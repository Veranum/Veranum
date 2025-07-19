// api/src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.handler.js');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// --- CRÍTICO: RE-INTRODUCIR LA CARGA DE MODELOS AQUÍ AL PRINCIPIO ---
// Esto asegura que todos los esquemas de Mongoose se registren GLOBALMENTE
// tan pronto como 'app.js' es requerido (ya sea por server.js o por los tests).
require('./modules/usuarios/usuarios.model');
require('./modules/habitaciones/habitaciones.model');
require('./modules/reservas/reservas.model');
require('./modules/promociones/promociones.model');
require('./modules/counters/counters.model');
require('./modules/hoteles/hotel.model');
require('./modules/precios/precio.model.js');
require('./modules/servicios/servicio.model.js');
require('./modules/eventos/centroEvento.model.js');
require('./modules/eventos/arriendoEvento.model.js');
require('./modules/restaurant/proveedor.model');
require('./modules/restaurant/tipoInsumo.model');
require('./modules/restaurant/insumo.model');
// -------------------------------------------------------------------

const mainApiRouter = require('./routes');
const app = express();

app.use(cors());
app.use(express.json()); 

app.use(mongoSanitize()); 
app.use(xss()); 

app.use('/api', mainApiRouter);
app.use(errorHandler);

module.exports = app;