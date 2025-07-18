const mongoose = require('mongoose');

const PromocionSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'El código de la promoción es requerido.'],
    unique: true,
    uppercase: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida.']
  },
  porcentaje_descuento: {
    type: Number,
    required: [true, 'El porcentaje de descuento es requerido.'],
    min: 1,
    max: 100
  },
  activa: {
    type: Boolean,
    default: true
  },
  // --- NUEVOS CAMPOS DE FECHA ---
  fecha_inicio: {
    type: Date,
    default: null
  },
  fecha_fin: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Promocion', PromocionSchema);