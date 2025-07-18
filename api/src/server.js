// src/server.js

require('dotenv').config();

const app = require('./app'); // Tu aplicación Express
const mongoose = require('mongoose'); // Importar mongoose directamente aquí

const PORT = process.env.PORT || 5001;

/**
 * Función para inicializar la aplicación Express y conectar a la base de datos.
 * @param {string|null} mongoUriOverride - URI de MongoDB para usar, si se quiere sobrescribir process.env.MONGO_URI.
 * @param {boolean} startListening - Si el servidor debe empezar a escuchar peticiones HTTP.
 * @returns {object} La instancia de la aplicación Express configurada.
 */
const startApp = async (mongoUriOverride = null, startListening = true) => {
  try {
    const uri = mongoUriOverride || process.env.MONGO_URI; // Usa el override o la URI de desarrollo/producción
    if (!uri) {
      console.error('Error: MONGO_URI o MONGO_URI_TEST no está definido. Por favor, configura tus variables de entorno.');
      process.exit(1);
    }

    // Conectar a MongoDB solo si no hay una conexión existente o está desconectada
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
        await mongoose.connect(uri, {
            useNewUrlParser: true, // Opciones para compatibilidad (aunque deprecadas en Mongoose 4.x+)
            useUnifiedTopology: true // Opciones para compatibilidad
        });
        console.log(`MongoDB Connected: ${uri.split('@')[1] ? `(using ${uri.split('@')[1].split('/')[0]})` : uri}`);
    } else {
        console.log('MongoDB ya está conectada, reutilizando conexión.');
    }

    if (startListening) {
      app.listen(PORT, () => {
        console.log(`Servidor de la API corriendo en http://localhost:${PORT}`);
      });
    }
    return app; // Retorna la instancia de la aplicación configurada
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Si este archivo es ejecutado directamente (ej. `node src/server.js`), inicia el servidor.
if (require.main === module) {
  startApp(null, true); // Usa la URI por defecto de .env y empieza a escuchar
}

module.exports = startApp; // Exporta la función para que los tests puedan usarla