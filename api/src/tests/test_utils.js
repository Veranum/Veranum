// api/src/tests/test_utils.js
const mongoose = require('mongoose'); 
const { connectDB } = require('../server'); 

// --- CRÍTICO: Importar la aplicación Express. Al hacerlo, app.js se ejecuta
// y todos los modelos de Mongoose se registran.
const app = require('../app'); 


/**
 * Obtiene una instancia completamente configurada de la aplicación Express
 * conectada a la base de datos de prueba.
 * @returns {object} La instancia de la aplicación Express.
 */
const getTestApp = async () => {
  const mongoUri = process.env.MONGO_URI_TEST;
  if (!mongoUri) {
    throw new Error('MONGO_URI_TEST no está definida en .env.test. Por favor, verifica tu archivo .env.test.');
  }

  // Llama a connectDB (de server.js) para conectar Mongoose a la DB de prueba.
  // Los modelos ya están registrados por el 'require' de 'app' de arriba.
  await connectDB(mongoUri); 

  return app;
};

/**
 * Limpia colecciones específicas en la base de datos de prueba.
 */
const cleanTestCollections = async () => {
    const collectionsToClean = [
      'users', 'hotels', 'habitaciones', 'reservas', 'promociones', 'counters',
      'precios', 'servicios', 'centros_eventos', 'arriendos_eventos',
      'proveedores', 'tipos_insumo', 'insumos' 
    ];

    for (const collectionName of collectionsToClean) {
        try {
            await mongoose.connection.db.dropCollection(collectionName);
        } catch (err) {
            if (err.codeName !== 'NamespaceNotFound') {
                console.error(`Error al eliminar colección '${collectionName}':`, err);
                throw err;
            }
        }
    }
};


/**
 * Cierra la conexión de Mongoose a la base de datos.
 */
const closeDbConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada para tests.');
  }
};

module.exports = {
  getTestApp,
  cleanTestCollections,
  closeDbConnection
};