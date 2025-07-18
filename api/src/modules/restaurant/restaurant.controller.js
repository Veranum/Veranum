const mongoose = require('mongoose'); // <-- LÍNEA AÑADIDA QUE SOLUCIONA EL ERROR PRINCIPAL
const Proveedor = require('./proveedor.model');
const TipoInsumo = require('./tipoInsumo.model');
const Insumo = require('./insumo.model');

// --- PROVEEDORES ---
exports.getAllProveedores = async (req, res, next) => {
    try {
        const data = await Proveedor.find();
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.createProveedor = async (req, res, next) => {
    try {
        const data = await Proveedor.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.updateProveedor = async (req, res, next) => {
    try {
        const data = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.deleteProveedor = async (req, res, next) => {
    try {
        // Opcional: Validar que no tenga insumos asociados antes de borrar
        const data = await Proveedor.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};

// --- TIPOS DE INSUMO ---
exports.getAllTiposInsumo = async (req, res, next) => {
    try {
        const query = {};
        if (req.query.hotelId) {
            query.hotel_id = req.query.hotelId;
        }

        const tipos = await TipoInsumo.find(query).populate('hotel_id', 'nombre').sort({ nombre: 1 });
        res.status(200).json({ success: true, data: tipos });
    } catch (error) {
        next(error);
    }
};

exports.createTipoInsumo = async (req, res, next) => {
    try {
        const data = await TipoInsumo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};

exports.updateTipoInsumo = async (req, res, next) => {
    try {
        const data = await TipoInsumo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ success: false, message: 'Tipo de insumo no encontrado' });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};

exports.deleteTipoInsumo = async (req, res, next) => {
    try {
        // Opcional: Validar que ningún insumo esté usando este tipo antes de borrar
        const data = await TipoInsumo.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Tipo de insumo no encontrado' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};

// --- INSUMOS (STOCK) ---
exports.getAllInsumos = async (req, res, next) => {
    try {
        const { hotelId } = req.query;
        const query = {};

        // Si se provee un hotelId y no es un string vacío, lo añadimos al query
        if (hotelId && hotelId !== "") {
            query.hotel_id = new mongoose.Types.ObjectId(hotelId);
        }

        const data = await Insumo.find(query)
            .populate('tipo_insumo_id', 'nombre')
            .populate('proveedor_id', 'nombre')
            .populate('hotel_id', 'nombre');
            
        res.status(200).json({ success: true, data });
    } catch (error) { 
        next(error); 
    }
};

exports.createInsumo = async (req, res, next) => {
    try {
        const data = await Insumo.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
};


exports.updateInsumo = async (req, res, next) => {
    try {
        const data = await Insumo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
};
exports.deleteInsumo = async (req, res, next) => {
    try {
        const data = await Insumo.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};

exports.updateStockInsumo = async (req, res, next) => {
    try {
        const { cantidad } = req.body; // Cantidad a sumar (positiva) o restar (negativa)
        if (typeof cantidad !== 'number') {
            return res.status(400).json({ success: false, message: 'La cantidad debe ser un número.' });
        }

        const insumo = await Insumo.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: cantidad } }, // Usamos $inc para la actualización atómica
            { new: true, runValidators: true }
        );

        if (!insumo) return res.status(404).json({ success: false, message: 'Insumo no encontrado' });
        
        res.status(200).json({ success: true, data: insumo });
    } catch (error) {
        next(error);
    }
};