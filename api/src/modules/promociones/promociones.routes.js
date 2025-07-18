// api/src/modules/promociones/promociones.routes.js
const express = require('express');
const router = express.Router();
const {
    getAllPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion,
    validarPromocionPorCodigo // Asegúrate que la función se llame así en tu controlador
} = require('./promociones.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const adminRoles = ['admin', 'gerente'];

// Rutas de Admin para /api/promociones
router.route('/')
    .get(protect, authorize(...adminRoles), getAllPromociones)
    .post(protect, authorize(...adminRoles), createPromocion);

// --- RUTA CORREGIDA PARA VALIDAR CÓDIGOS ---
// Ahora coincide con la URL /api/promociones/validar/:codigo
router.route('/validar/:codigo')
    .get(validarPromocionPorCodigo);

// Rutas de Admin para /api/promociones/:id
router.route('/:id')
    .put(protect, authorize(...adminRoles), updatePromocion)
    .delete(protect, authorize(...adminRoles), deletePromocion);

module.exports = router;