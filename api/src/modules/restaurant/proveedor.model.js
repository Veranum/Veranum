const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del proveedor es requerido.'],
        unique: true,
        trim: true
    },
    contacto: {
        nombre: { type: String, required: true },
        telefono: { type: String, required: true },
        email: {
            type: String,
            required: true,
            match: [
              /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              'Por favor, ingrese un email válido.',
            ],
        }
    },
    direccion: { type: String }
}, { timestamps: true });

// --- LÍNEA CLAVE Y CORRECTA ---
// Asegúrate de que esta línea exporte el MODELO compilado.
module.exports = mongoose.model('Proveedor', ProveedorSchema);