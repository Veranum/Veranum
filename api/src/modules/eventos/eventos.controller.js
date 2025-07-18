const mongoose = require('mongoose');
const CentroEvento = require('./centroEvento.model');
const ArriendoEvento = require('./arriendoEvento.model');

// --- Gestión de Centros de Evento ---

const checkEventAvailability = async (centro_evento_id, fecha_evento, hora_inicio, hora_fin, arriendoIdToExclude = null) => {
    // Buscamos un arriendo existente que se cruce con el horario solicitado
    const query = {
        centro_evento_id,
        fecha_evento: new Date(new Date(fecha_evento).setUTCHours(0,0,0,0)), // Comparamos solo la fecha
        estado: 'Confirmado',
        // Un cruce de horarios ocurre si (InicioA < FinB) y (FinA > InicioB)
        hora_inicio: { $lt: hora_fin },
        hora_fin: { $gt: hora_inicio },
    };
    // Si estamos actualizando, excluimos el propio arriendo de la comprobación
    if (arriendoIdToExclude) {
        query._id = { $ne: arriendoIdToExclude };
    }
    const existingArriendo = await ArriendoEvento.findOne(query);
    return !existingArriendo; // Retorna true si está disponible, false si no
};

exports.getAllCentrosEvento = async (req, res, next) => {
    try {
        const query = req.query.hotelId ? { hotel_id: req.query.hotelId } : {};
        const centros = await CentroEvento.find(query).populate('hotel_id', 'nombre');
        res.status(200).json({ success: true, count: centros.length, data: centros });
    } catch (error) {
        next(error);
    }
};

exports.createCentroEvento = async (req, res, next) => {
    try {
        const centro = await CentroEvento.create(req.body);
        res.status(201).json({ success: true, data: centro });
    } catch (error) {
        next(error);
    }
};

exports.updateCentroEvento = async (req, res, next) => {
    try {
        const centro = await CentroEvento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!centro) return res.status(404).json({ success: false, message: 'Centro de eventos no encontrado' });
        res.status(200).json({ success: true, data: centro });
    } catch (error) {
        next(error);
    }
};

exports.deleteCentroEvento = async (req, res, next) => {
    try {
        const centro = await CentroEvento.findById(req.params.id);
        if (!centro) return res.status(404).json({ success: false, message: 'Centro de eventos no encontrado' });
        
        // Opcional: Validar que no tenga arriendos futuros antes de borrar
        await ArriendoEvento.deleteMany({ centro_evento_id: req.params.id });
        await centro.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};


// --- Gestión de Arriendos ---

// --- Gestión de Arriendos (ACTUALIZADO) ---
exports.getArriendosPorCentro = async (req, res, next) => {
    try {
        const arriendos = await ArriendoEvento.find({ centro_evento_id: req.params.centroId })
            .sort({ fecha_evento: -1, hora_inicio: 1 });
        res.status(200).json({ success: true, data: arriendos });
    } catch (error) {
        next(error);
    }
};


exports.getAllArriendos = async (req, res, next) => {
    try {
        // 1. Obtenemos los parámetros de la URL, con valores por defecto.
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 6; // Mostraremos 6 tarjetas por página
        const skip = (page - 1) * limit;

        // 2. Creamos la consulta base (a futuro podrías añadir filtros aquí)
        const query = {};

        // 3. Ejecutamos dos consultas en paralelo: una para contar todos los documentos y otra para obtener solo la página actual.
        const [arriendos, totalCount] = await Promise.all([
            ArriendoEvento.find(query)
                .populate('centro_evento_id', 'nombre hotel_id')
                .sort({ fecha_evento: -1 })
                .skip(skip)
                .limit(limit),
            ArriendoEvento.countDocuments(query)
        ]);
        
        // 4. Devolvemos los datos junto con la información de paginación
        res.status(200).json({
            success: true,
            data: arriendos,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) {
        next(error);
    }
};

exports.createArriendo = async (req, res, next) => {
    const { centro_evento_id, fecha_evento, hora_inicio, hora_fin } = req.body;
    try {
        // --- INICIO DE LA CORRECCIÓN ---
        // 1. Verificamos la disponibilidad como antes
        const isAvailable = await checkEventAvailability(centro_evento_id, fecha_evento, hora_inicio, hora_fin);
        if (!isAvailable) {
            return res.status(409).json({ success: false, message: 'El salón ya está reservado en el horario seleccionado.' });
        }

        // 2. Buscamos el centro de eventos para obtener su hotel_id
        const centro = await CentroEvento.findById(centro_evento_id);
        if (!centro) {
            return res.status(404).json({ success: false, message: 'El centro de eventos seleccionado no existe.' });
        }
        
        // 3. Añadimos el hotel_id al cuerpo de la petición antes de crear
        const datosArriendo = {
            ...req.body,
            hotel_id: centro.hotel_id
        };

        const arriendo = await ArriendoEvento.create(datosArriendo);
        // --- FIN DE LA CORRECCIÓN ---

        res.status(201).json({ success: true, data: arriendo });
    } catch (error) {
        next(error);
    }
};

// --- NUEVA FUNCIÓN ---
exports.updateArriendo = async (req, res, next) => {
    const { centro_evento_id, fecha_evento, hora_inicio, hora_fin } = req.body;
    try {
        const isAvailable = await checkEventAvailability(centro_evento_id, fecha_evento, hora_inicio, hora_fin, req.params.id);
        if (!isAvailable) {
            return res.status(409).json({ success: false, message: 'Conflicto de horario con otro arriendo existente.' });
        }
        const arriendo = await ArriendoEvento.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!arriendo) return res.status(404).json({ success: false, message: 'Arriendo no encontrado' });

        res.status(200).json({ success: true, data: arriendo });
    } catch (error) {
        next(error);
    }
};

exports.deleteArriendo = async (req, res, next) => {
    try {
        const arriendo = await ArriendoEvento.findByIdAndDelete(req.params.id);
        if (!arriendo) return res.status(404).json({ success: false, message: 'Arriendo no encontrado' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};