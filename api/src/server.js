// src/server.js

require('dotenv').config(); 

const app = require('./app'); 
const mongoose = require('mongoose'); 

const PORT = process.env.PORT || 5001;

// --- ELIMINADO: Ya no se define modelPaths aquí ni se hace modelPaths.forEach(require(path)) ---

const connectDB = async (mongoUri = process.env.MONGO_URI) => {
  try {
    if (!mongoUri) {
      console.error('Error: La URI de MongoDB no está definida.');
      process.exit(1); 
    }

    if (mongoose.connection.readyState === 0) { 
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log(`MongoDB Connected: ${mongoUri.split('@')[1] ? `(using ${mongoUri.split('@')[1].split('/')[0]})` : mongoUri}`);
    } else if (mongoose.connection.host !== new URL(mongoUri).host || mongoose.connection.name !== new URL(mongoUri).pathname.substring(1)) {
        console.log(`MongoDB already connected to a different DB (${mongoose.connection.name}), disconnecting and reconnecting to ${mongoUri}`);
        await mongoose.disconnect();
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
    }
    else {
        console.log('MongoDB already connected, reusing connection.');
    }

    // --- ELIMINADO: Ya no se cargan modelos aquí. app.js se encarga de eso. ---

  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    throw error; 
  }
};

if (require.main === module) {
  connectDB(process.env.MONGO_URI) 
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor de la API corriendo en http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('Error FATAL al iniciar el servidor:', err.message);
      process.exit(1);
    });
}

module.exports = app;
module.exports.connectDB = connectDB;