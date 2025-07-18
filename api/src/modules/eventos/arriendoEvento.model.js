const mongoose = require('mongoose');

const ArriendoEventoSchema = new mongoose.Schema({
    centro_evento_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CentroEvento',
        required: true
    },
    cliente_nombre: {
        type: String,
        required: [true, 'El nombre del cliente o empresa es requerido.']
    },
    cliente_email: {
        type: String,
        required: [true, 'El email de contacto es requerido.']
    },

    hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    
    fecha_evento: {
        type: Date,
        required: true
    },
    hora_inicio: {
        type: String, // Formato "HH:MM"
        required: true
    },
    hora_fin: {
        type: String, // Formato "HH:MM"
        required: true
    },
    precio_total: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['Confirmado', 'Pendiente', 'Cancelado'],
        default: 'Confirmado'
    }
}, { timestamps: true, collection: 'arriendos_eventos' });

module.exports = mongoose.model('ArriendoEvento', ArriendoEventoSchema);