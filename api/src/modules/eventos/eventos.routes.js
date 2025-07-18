const express = require('express');
const router = express.Router();
const {
    // Centros de Evento
    getAllCentrosEvento,
    createCentroEvento,
    updateCentroEvento,
    deleteCentroEvento,
    // Arriendos
    getAllArriendos, // <-- ESTA ES LA LÍNEA QUE FALTABA
    getArriendosPorCentro,
    createArriendo,
    updateArriendo,
    deleteArriendo
} = require('./eventos.controller');

const { protect, authorize } = require('../../middleware/auth.middleware');

const adminRoles = ['admin', 'gerente'];

// --- Rutas para Centros de Evento ---
router.route('/centros')
    .get(getAllCentrosEvento)
    .post(protect, authorize(...adminRoles), createCentroEvento);

router.route('/centros/:id')
    .put(protect, authorize(...adminRoles), updateCentroEvento)
    .delete(protect, authorize(...adminRoles), deleteCentroEvento);

// --- Rutas para Arriendos ---
router.route('/arriendos')
    .get(protect, authorize(...adminRoles), getAllArriendos) // Esta línea ahora funcionará
    .post(protect, authorize(...adminRoles), createArriendo);
    
router.route('/arriendos/:id')
    .put(protect, authorize(...adminRoles), updateArriendo)
    .delete(protect, authorize(...adminRoles), deleteArriendo);

router.route('/arriendos/centro/:centroId')
    .get(protect, authorize(...adminRoles), getArriendosPorCentro);

module.exports = router;