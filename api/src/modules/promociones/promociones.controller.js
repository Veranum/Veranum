// api/src/modules/promociones/promociones.controller.js
const Promocion = require('./promociones.model');

// @desc    Obtener todas las promociones (Admin)
exports.getAllPromociones = async (req, res, next) => {
    try {
        const promociones = await Promocion.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: promociones.length, data: promociones });
    } catch (error) {
        next(error);
    }
};

// @desc    Validar y obtener una promoción por su código
// @route   GET /api/promociones/validar/:codigo
exports.validarPromocionPorCodigo = async (req, res, next) => {
    try {
        // Se usa req.params.codigo para coincidir con la nueva ruta
        const codigoPromocion = req.params.codigo.toUpperCase();
        const hoy = new Date();

        const promocion = await Promocion.findOne({
            codigo: codigoPromocion,
            activa: true,
            $or: [ { fecha_inicio: null }, { fecha_inicio: { $lte: hoy } } ],
            $or: [ { fecha_fin: null }, { fecha_fin: { $gte: hoy } } ]
        });

        if (!promocion) {
            return res.status(404).json({ success: false, message: 'El código de promoción no es válido o ha expirado.' });
        }
        res.status(200).json({ success: true, data: promocion });
    } catch (error) {
        next(error);
    }
};

// @desc    Crear una nueva promoción (Admin)
exports.createPromocion = async (req, res, next) => {
    try {
        const promocion = await Promocion.create(req.body);
        res.status(201).json({ success: true, data: promocion });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar una promoción (Admin)
exports.updatePromocion = async (req, res, next) => {
    try {
        const promocion = await Promocion.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!promocion) {
            return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        }
        res.status(200).json({ success: true, data: promocion });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar una promoción (Admin)
exports.deletePromocion = async (req, res, next) => {
    try {
        const promocion = await Promocion.findByIdAndDelete(req.params.id);
        if (!promocion) {
            return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};