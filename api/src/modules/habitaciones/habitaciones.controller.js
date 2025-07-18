//api/src/modules/habitaciones/habitaciones.controller.js

const mongoose = require('mongoose');
const Habitacion = mongoose.model('Habitacion');
const Reserva = mongoose.model('Reserva');
const Precio = mongoose.model('Precio');

/**
 * @desc    Obtener el estado de todas las habitaciones para el panel de admin
 * @access  Admin
 */
exports.getHabitacionesAdminStatus = async (req, res, next) => {
    try {
        const query = req.query.hotelId ? { hotel_id: req.query.hotelId } : {};
        const habitaciones = await Habitacion.find(query).sort({ _id: 1 }).lean();
        
        const hoy = new Date();
        const inicioHoy = new Date(new Date(hoy).setHours(0, 0, 0, 0));
        const finHoy = new Date(new Date(hoy).setHours(23, 59, 59, 999));

        const resultado = await Promise.all(
            habitaciones.map(async (hab) => {
                const ocupadasHoy = await Reserva.countDocuments({
                    habitacion_id: hab._id,
                    estado: 'Confirmado',
                    fecha_inicio: { $lt: finHoy },
                    fecha_fin: { $gt: inicioHoy }
                });

                const precioVigente = await Precio.findOne({
                    habitacion_id: hab._id,
                    fecha_vigencia: { $lte: new Date() }
                }).sort({ fecha_vigencia: -1 });

                return {
                    ...hab,
                    precio: precioVigente ? precioVigente.valor : 0,
                    inventario: {
                        total: hab.cantidad,
                        ocupadas: ocupadasHoy,
                        disponibles: hab.cantidad - ocupadasHoy
                    }
                };
            })
        );
        
        res.status(200).json({ success: true, data: resultado });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener todas las habitaciones para la página pública
 * @access  Público
 * @note    Esta es la única versión de getHabitaciones. Usa .populate() para incluir el nombre del hotel.
 */
exports.getHabitaciones = async (req, res, next) => {
    try {
        const query = req.query.hotelId ? { hotel_id: req.query.hotelId } : {};
        
        const todasLasHabitaciones = await Habitacion.find(query)
            .populate('hotel_id', 'nombre') // Trae el nombre del hotel
            .sort({ _id: 1 })
            .lean();

        const resultadoFinal = await Promise.all(
            todasLasHabitaciones.map(async (habitacion) => {
                const precioVigente = await Precio.findOne({
                    habitacion_id: habitacion._id,
                    fecha_vigencia: { $lte: new Date() }
                }).sort({ fecha_vigencia: -1 });

                return {
                    ...habitacion,
                    precio: precioVigente ? precioVigente.valor : 0
                };
            })
        );
        
        res.status(200).json({ success: true, count: resultadoFinal.length, data: resultadoFinal });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtener una sola habitación por su ID
 * @access  Público
 * @note    Esta es la función que faltaba y causaba el error en el servidor.
 */
exports.getHabitacion = async (req, res, next) => {
     try {
        const habitacion = await Habitacion.findById(req.params.id).populate('hotel_id', 'nombre').lean();
        if (!habitacion) {
            return res.status(404).json({ success: false, message: 'Habitación no encontrada' });
        }
        
        const precioVigente = await Precio.findOne({
            habitacion_id: habitacion._id,
            fecha_vigencia: { $lte: new Date() }
        }).sort({ fecha_vigencia: -1 });

        const habitacionConPrecio = {
            ...habitacion,
            precio: precioVigente ? precioVigente.valor : 0
        };

        res.status(200).json({ success: true, data: habitacionConPrecio });
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Crear una nueva habitación
 * @access  Admin
 */
exports.createHabitacion = async (req, res, next) => {
    try {
        const habitacion = await Habitacion.create(req.body);
        res.status(201).json({ success: true, data: habitacion });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Actualizar una habitación
 * @access  Admin
 */
exports.updateHabitacion = async (req, res, next) => {
     try {
        const habitacion = await Habitacion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!habitacion) {
            return res.status(404).json({ success: false, message: 'Habitación no encontrada' });
        }
        res.status(200).json({ success: true, data: habitacion });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Eliminar una habitación
 * @access  Admin
 */
exports.deleteHabitacion = async (req, res, next) => {
    try {
        const habitacion = await Habitacion.findById(req.params.id);
         if (!habitacion) {
            return res.status(404).json({ success: false, message: 'Habitación no encontrada' });
        }

        await Precio.deleteMany({ habitacion_id: habitacion._id });
        await habitacion.deleteOne();
        
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};