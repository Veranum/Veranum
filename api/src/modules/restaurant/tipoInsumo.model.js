// api/src/modules/restaurant/tipoInsumo.model.js
const mongoose = require('mongoose');

const TipoInsumoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la categoría es requerido.'],
        trim: true,
        unique: true
    },
    hotel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: [true, 'Todo tipo de insumo debe pertenecer a un hotel.']
    }
}, { timestamps: true, collection: 'tipos_insumo' });

module.exports = mongoose.model('TipoInsumo', TipoInsumoSchema);