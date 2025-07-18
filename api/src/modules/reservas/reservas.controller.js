// api/src/modules/reservas/reservas.controller.js
const mongoose = require('mongoose');
const Reserva = mongoose.model('Reserva');
const Habitacion = mongoose.model('Habitacion');
const Precio = mongoose.model('Precio');
const Servicio = mongoose.model('Servicio');
const Promocion = require('../promociones/promociones.model');


/**
 * --- FUNCIÓN HELPER RESTAURADA ---
 * Esta función es necesaria para que el endpoint getAvailableRooms funcione correctamente.
 */
const checkAvailability = async (habitacion_id, fecha_inicio, fecha_fin, excludeReservaId = null) => {
    const habitacion = await Habitacion.findById(habitacion_id);
    if (!habitacion) return false;
    const inventarioTotal = habitacion.cantidad;
    const query = {
        habitacion_id,
        estado: 'Confirmado',
        fecha_inicio: { $lt: new Date(fecha_fin) },
        fecha_fin: { $gt: new Date(fecha_inicio) }
    };
    if (excludeReservaId) {
        query._id = { $ne: excludeReservaId };
    }
    const reservasSuperpuestas = await Reserva.countDocuments(query);
    return reservasSuperpuestas < inventarioTotal;
};

/**
 * @desc    Crear una reserva (para Clientes)
 * @note    Versión final y única de esta función. Incluye una validación de
 * inventario robusta que se ejecuta en el servidor y es ineludible.
 */
exports.createReserva = async (req, res, next) => {
    try {
        

        const { habitacion_id, fecha_inicio, fecha_fin, servicios_adicionales = [], codigo_promocion } = req.body;

        const habitacion = await Habitacion.findById(habitacion_id);
        if (!habitacion) {
            return res.status(404).json({ success: false, message: 'La habitación especificada no existe.' });
        }

        const inventarioTotal = habitacion.cantidad;
        const reservasConfirmadas = await Reserva.countDocuments({
            habitacion_id: habitacion_id,
            estado: 'Confirmado',
            fecha_inicio: { $lt: new Date(fecha_fin) },
            fecha_fin: { $gt: new Date(fecha_inicio) }
        });

        if (reservasConfirmadas >= inventarioTotal) {
            return res.status(409).json({ success: false, message: 'Conflicto: No hay habitaciones de este tipo disponibles para las fechas seleccionadas.' });
        }

        const precioVigente = await Precio.findOne({ habitacion_id, fecha_vigencia: { $lte: new Date(fecha_inicio) } }).sort({ fecha_vigencia: -1 });
        if (!precioVigente) {
            return res.status(400).json({ success: false, message: 'La habitación no tiene un precio definido para estas fechas.' });
        }

        const dias = Math.ceil((new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24));
        if (dias <= 0) {
            return res.status(400).json({ message: 'El rango de fechas es inválido.' });
        }

        const costoHabitacion = dias * precioVigente.valor;
        let costoServicios = 0;
        if (servicios_adicionales.length > 0) {
            const serviciosDb = await Servicio.find({ '_id': { $in: servicios_adicionales } });
            costoServicios = serviciosDb.reduce((total, s) => total + s.precio_diario, 0) * dias;
        }

        let precioFinal = costoHabitacion + costoServicios;
        if (codigo_promocion) {
            const promocion = await Promocion.findOne({ codigo: codigo_promocion.toUpperCase(), activa: true });
            if (promocion) {
                precioFinal *= (1 - promocion.porcentaje_descuento / 100);
            }
        }

        const reservaData = {
            ...req.body,
            cliente_id: req.user.id,
            precio_final: Math.round(precioFinal),
            hotel_id: habitacion.hotel_id
        };

        const reserva = await Reserva.create(reservaData);
        res.status(201).json({ success: true, data: reserva });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Crear una reserva por un Administrador
 * @note    ACTUALIZADO para manejar servicios y promociones.
 */
exports.createReservaAdmin = async (req, res, next) => {
    const { 
        cliente_id, 
        habitacion_id, 
        fecha_inicio, 
        fecha_fin, 
        estado,
        // --- NUEVOS DATOS RECIBIDOS ---
        servicios_adicionales = [],
        codigo_promocion
    } = req.body;

    try {
        const habitacion = await Habitacion.findById(habitacion_id);
        if (!habitacion) return res.status(404).json({ message: 'Habitación no encontrada.' });

        if (estado === 'Confirmado') {
            const inventarioTotal = habitacion.cantidad;
            const reservasConfirmadas = await Reserva.countDocuments({
                habitacion_id,
                estado: 'Confirmado',
                fecha_inicio: { $lt: new Date(fecha_fin) },
                fecha_fin: { $gt: new Date(fecha_inicio) }
            });

            if (reservasConfirmadas >= inventarioTotal) {
                return res.status(409).json({ success: false, message: 'Conflicto: Inventario lleno.' });
            }
        }
        
        // --- LÓGICA DE CÁLCULO DE PRECIO MEJORADA ---
        const precioVigente = await Precio.findOne({ habitacion_id, fecha_vigencia: { $lte: new Date(fecha_inicio) } }).sort({ fecha_vigencia: -1 });
        if (!precioVigente) return res.status(400).json({ success: false, message: 'La habitación no tiene un precio definido.' });
        
        const dias = Math.ceil((new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24));
        if (dias <= 0) return res.status(400).json({ message: 'Rango de fechas inválido.' });

        const costoHabitacion = dias * precioVigente.valor;
        let costoServicios = 0;
        if (servicios_adicionales.length > 0) {
            const serviciosDb = await Servicio.find({ '_id': { $in: servicios_adicionales } });
            costoServicios = serviciosDb.reduce((total, s) => total + s.precio_diario, 0) * dias;
        }

        let precioFinal = costoHabitacion + costoServicios;
        if (codigo_promocion) {
            const promocion = await Promocion.findOne({ codigo: codigo_promocion.toUpperCase(), activa: true });
            if (promocion) {
                precioFinal *= (1 - promocion.porcentaje_descuento / 100);
            }
        }
        
        const reservaData = {
            ...req.body,
            hotel_id: habitacion.hotel_id,
            precio_final: Math.round(precioFinal)
        };
        
        const reserva = await Reserva.create(reservaData);
        res.status(201).json({ success: true, data: reserva });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar una reserva por un Administrador (CON DEPURACIÓN)
 * @note    Logs añadidos para rastrear el flujo de actualización.
 */
exports.updateReservaAdmin = async (req, res, next) => {
    // --- INICIO DE DEPURACIÓN ---
    console.log("\n\n==================================================");
    console.log("INICIANDO 'updateReservaAdmin' - ", new Date().toLocaleTimeString());
    console.log("==================================================");
    console.log("1. DATOS RECIBIDOS (req.body):", req.body);
    // --- FIN DE DEPURACIÓN ---

    try {
        const reservaId = req.params.id;
        const datosActualizacion = req.body;

        const reservaOriginal = await Reserva.findById(reservaId);
        if (!reservaOriginal) {
            return res.status(404).json({ success: false, message: 'Reserva original no encontrada.' });
        }
        console.log("2. Reserva original encontrada:", reservaOriginal);

        // La validación se activa si se intenta confirmar una reserva que no lo estaba,
        // o si se cambian las fechas de una reserva ya confirmada.
        const necesitaValidacion = datosActualizacion.estado === 'Confirmado';
        
        console.log(`3. ¿Necesita validación de inventario? -> ${necesitaValidacion}`);

        if (necesitaValidacion) {
            // Usamos las fechas nuevas si existen, si no, las originales.
            const fechaInicioValidar = datosActualizacion.fecha_inicio || reservaOriginal.fecha_inicio;
            const fechaFinValidar = datosActualizacion.fecha_fin || reservaOriginal.fecha_fin;

            console.log(`4. Validando disponibilidad para Habitación ID: ${reservaOriginal.habitacion_id} entre ${fechaInicioValidar} y ${fechaFinValidar}`);

            const habitacion = await Habitacion.findById(reservaOriginal.habitacion_id);
            if (!habitacion) {
                return res.status(404).json({ message: 'Habitación asociada no encontrada.' });
            }
            console.log(`5. Inventario total de la habitación: ${habitacion.cantidad}`);

            const inventarioTotal = habitacion.cantidad;
            const query = {
                _id: { $ne: reservaId }, // Excluimos la propia reserva del conteo
                habitacion_id: reservaOriginal.habitacion_id,
                estado: 'Confirmado',
                fecha_inicio: { $lt: new Date(fechaFinValidar) },
                fecha_fin: { $gt: new Date(fechaInicioValidar) }
            };

            console.log("6. Consulta para contar reservas existentes:", JSON.stringify(query, null, 2));
            const reservasConfirmadas = await Reserva.countDocuments(query);
            console.log(`7. Resultado: Se encontraron ${reservasConfirmadas} otras reservas confirmadas.`);
            
            console.log(`8. Realizando la comprobación: (reservasConfirmadas >= inventarioTotal) -> (${reservasConfirmadas} >= ${inventarioTotal})`);

            if (reservasConfirmadas >= inventarioTotal) {
                console.log("9. ¡VALIDACIÓN FALLIDA! El inventario está lleno. Devolviendo error 409.");
                console.log("==================================================\n");
                return res.status(409).json({ success: false, message: 'Conflicto: Inventario lleno. No se puede confirmar/mover esta reserva.' });
            } else {
                console.log("9. VALIDACIÓN EXITOSA. Hay inventario disponible.");
            }
        }
        
        console.log("10. Procediendo a actualizar la reserva en la base de datos...");
        const reservaActualizada = await Reserva.findByIdAndUpdate(reservaId, datosActualizacion, { new: true, runValidators: true });
        console.log("11. RESERVA ACTUALIZADA EXITOSAMENTE.");
        console.log("==================================================\n");
        res.status(200).json({ success: true, data: reservaActualizada });
        
    } catch (error) {
        console.error("!!! ERROR INESPERADO EN 'updateReservaAdmin' !!!", error);
        console.log("==================================================\n");
        next(error);
    }
};

// --- OTRAS FUNCIONES (sin cambios) ---
exports.getMisReservas = async (req, res, next) => {
    try {
        const reservas = await Reserva.find({ cliente_id: req.user.id }).populate('habitacion_id', 'nombre').populate('hotel_id', 'nombre').populate('servicios_adicionales', 'nombre');
        res.status(200).json({ success: true, data: reservas });
    } catch (error) { next(error); }
};

exports.cancelarMiReserva = async (req, res, next) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        if (!reserva) return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        if (reserva.cliente_id.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'No autorizado.' });
        if (new Date(reserva.fecha_inicio) <= new Date()) return res.status(400).json({ success: false, message: 'No se puede cancelar una reserva pasada.' });
        if (reserva.estado === 'Cancelado') return res.status(400).json({ success: false, message: 'La reserva ya está cancelada.' });
        reserva.estado = 'Cancelado';
        await reserva.save();
        res.status(200).json({ success: true, data: reserva });
    } catch (error) { next(error); }
};

exports.getAllReservasAdmin = async (req, res, next) => {
    try {
        const reservas = await Reserva.find().sort({ createdAt: -1 }).populate('cliente_id', 'nombre email _id').populate('habitacion_id', 'nombre precio').populate('hotel_id', 'nombre').populate('servicios_adicionales', 'nombre precio_diario');
        res.status(200).json({ success: true, count: reservas.length, data: reservas });
    } catch (error) { next(error); }
};

exports.getReservasPorUsuarioAdmin = async (req, res, next) => {
    try {
        const reservas = await Reserva.find({ cliente_id: req.params.run }).populate('habitacion_id', 'nombre').sort({ fecha_inicio: -1 });
        res.status(200).json({ success: true, count: reservas.length, data: reservas });
    } catch (error) { next(error); }
};

exports.deleteReservaAdmin = async (req, res, next) => {
    try {
        const reserva = await Reserva.findByIdAndDelete(req.params.id);
        if (!reserva) return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};


/**
 * @desc Obtiene las habitaciones disponibles para un rango de fechas.
 * @note CORREGIDO para validar el hotelId antes de usarlo.
 */
exports.getAvailableRooms = async (req, res, next) => {
    const { fecha_inicio, fecha_fin, hotelId } = req.query;
    if (!fecha_inicio || !fecha_fin) return res.status(400).json({ success: false, message: 'Se requieren fechas.' });
    try {
        let hotelQuery = {};
        
        // --- CORRECCIÓN: Añadimos una validación para el hotelId ---
        if (hotelId) {
            // Verificamos si el hotelId es una cadena válida de ObjectId de Mongoose
            if (mongoose.Types.ObjectId.isValid(hotelId)) {
                hotelQuery = { hotel_id: new mongoose.Types.ObjectId(hotelId) };
            } else {
                // Si no es válido, podemos devolver un error o simplemente no filtrar,
                // dependiendo de la lógica de negocio deseada. Devolver un error es más seguro.
                return res.status(400).json({ success: false, message: 'El ID del hotel proporcionado no es válido.' });
            }
        }
        
        const todasLasHabitaciones = await Habitacion.find(hotelQuery).lean();
        const availableRoomPromises = todasLasHabitaciones.map(async (habitacion) => {
            const isAvailable = await checkAvailability(habitacion._id, fecha_inicio, fecha_fin);
            return isAvailable ? habitacion : null;
        });
        const availableRooms = (await Promise.all(availableRoomPromises)).filter(Boolean);
        const roomsWithPrice = await Promise.all(
            availableRooms.map(async (habitacion) => {
                const precioVigente = await Precio.findOne({ habitacion_id: habitacion._id, fecha_vigencia: { $lte: new Date(fecha_inicio) } }).sort({ fecha_vigencia: -1 });
                return { ...habitacion, precio: precioVigente ? precioVigente.valor : 0 };
            })
        );
        res.status(200).json({ success: true, data: roomsWithPrice });
    } catch (error) {
        // El BSONError original se captura aquí. Con la validación, no debería volver a ocurrir.
        next(error);
    }
};