// api/src/modules/servicios/servicios.controller.js
const mongoose = require('mongoose'); // <-- LÍNEA AÑADIDA
const Servicio = mongoose.model('Servicio');
const Hotel = mongoose.model('Hotel');

// @desc    Obtener todos los servicios de un hotel específico
exports.getServiciosByHotel = async (req, res, next) => {
    try {
        const { hotelId } = req.params;

        // Esta línea ahora funcionará porque mongoose está definido
        if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
            return res.status(400).json({ success: false, message: 'Se requiere un ID de hotel válido.' });
        }

        const servicios = await Servicio.find({ hotel_id: hotelId });
        res.status(200).json({ success: true, data: servicios });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear un nuevo servicio
exports.createServicio = async (req, res, next) => {
    try {
        const servicio = await Servicio.create(req.body);
        res.status(201).json({ success: true, data: servicio });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar un servicio
exports.updateServicio = async (req, res, next) => {
    try {
        const servicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!servicio) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        }
        res.status(200).json({ success: true, data: servicio });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar un servicio
exports.deleteServicio = async (req, res, next) => {
    try {
        const servicio = await Servicio.findByIdAndDelete(req.params.id);
        if (!servicio) {
            return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};