const mongoose = require('mongoose');

const CentroEventoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del salón es requerido.'],
        trim: true
    },
    hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    capacidad: {
        type: Number,
        required: [true, 'La capacidad de personas es requerida.']
    },
    equipamiento: {
        type: [String], // Array de strings, ej: ["Proyector", "Sistema de Audio", "Micrófonos"]
        default: []
    },
    precio_por_hora: {
        type: Number,
        required: [true, 'El precio por hora es requerido.']
    },
    imagenUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true, collection: 'centros_eventos' });

module.exports = mongoose.model('CentroEvento', CentroEventoSchema);