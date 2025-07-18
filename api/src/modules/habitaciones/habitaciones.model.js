// api/src/modules/habitaciones/habitaciones.model.js
const mongoose = require('mongoose');
const Counter = require('../counters/counters.model');

const HabitacionSchema = new mongoose.Schema({
  _id: { type: Number, alias: 'numeroHabitacion' },
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true },
  categoria: { type: String, enum: ['individual', 'doble', 'matrimonial', 'suite-junior', 'familiar'], required: true },
  capacidad: { type: Number, required: true },
  piso: { type: Number, required: true },
  servicios: [String],
  imagenUrl: { type: String, default: '' },
  // --- CAMPO NUEVO PARA INVENTARIO ---
  cantidad: { 
    type: Number, 
    required: [true, 'La cantidad de habitaciones de este tipo es requerida.'], 
    default: 1,
    min: [1, 'Debe haber al menos una habitación de este tipo.']
  }
}, { 
    timestamps: true,
    collection: 'habitaciones',
    _id: false 
});

// El hook de auto-incremento se mantiene sin cambios
HabitacionSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'habitacionId' },
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            this.numeroHabitacion = counter.sequence_value;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Habitacion', HabitacionSchema);