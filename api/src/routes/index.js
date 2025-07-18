// api/src/routes/index.js
const express = require('express');
const authRoutes = require('../modules/auth/auth.routes.js');
const habitacionesRoutes = require('../modules/habitaciones/habitaciones.routes.js');
// --- CORRECCIÓN: Se ajusta el nombre del archivo de rutas ---
const hotelesRoutes = require('../modules/hoteles/hoteles.routes.js'); 
const promocionesRoutes = require('../modules/promociones/promociones.routes.js');
const reservasRoutes = require('../modules/reservas/reservas.routes.js');
const usuariosRoutes = require('../modules/usuarios/usuarios.routes.js');
const preciosRoutes = require('../modules/precios/precios.routes.js');
const serviciosRoutes = require('../modules/servicios/servicios.routes.js');
const reportesRoutes = require('../modules/reportes/reportes.routes.js');
const eventosRoutes = require('../modules/eventos/eventos.routes.js');
const restaurantRoutes = require('../modules/restaurant/restaurant.routes');

const router = express.Router();    

router.use('/auth', authRoutes);
router.use('/habitaciones', habitacionesRoutes);
router.use('/hoteles', hotelesRoutes);
router.use('/promociones', promocionesRoutes);
router.use('/reservas', reservasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/precios', preciosRoutes);
router.use('/servicios', serviciosRoutes);  
router.use('/reportes', reportesRoutes);
router.use('/eventos', eventosRoutes);
router.use('/restaurant', restaurantRoutes);

module.exports = router;