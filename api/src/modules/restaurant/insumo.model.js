const mongoose = require('mongoose');

const InsumoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del insumo es requerido.'],
        trim: true
    },
    descripcion: String,
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    unidad_medida: {
        type: String,
        required: true,
        enum: ['kg', 'litros', 'unidades']
    },
    hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    tipo_insumo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoInsumo',
        required: true
    },
    proveedor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: true
    },
    precio_unitario: {
        type: Number,
        required: [true, 'El precio del insumo es requerido.'],
        default: 0
    }
}, { timestamps: true });

// --- LÍNEA CLAVE Y CORRECTA ---
module.exports = mongoose.model('Insumo', InsumoSchema);