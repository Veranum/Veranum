// api/src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.handler.js');

// --- Precarga de Modelos ---
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
// La línea de 'rol.model' ha sido eliminada.

const mainApiRouter = require('./routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', mainApiRouter);
app.use(errorHandler);

module.exports = app;