const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth.middleware');
const controller = require('./restaurant.controller');

const adminRoles = ['admin', 'gerente'];

// --- Rutas de Proveedores ---
router.route('/proveedores')
    .get(protect, authorize(...adminRoles), controller.getAllProveedores)
    .post(protect, authorize(...adminRoles), controller.createProveedor);
router.route('/proveedores/:id')
    .put(protect, authorize(...adminRoles), controller.updateProveedor)
    .delete(protect, authorize(...adminRoles), controller.deleteProveedor);

// --- Rutas de Tipos de Insumo ---
router.route('/tipos-insumo')
    .get(protect, authorize(...adminRoles), controller.getAllTiposInsumo)
    .post(protect, authorize(...adminRoles), controller.createTipoInsumo)
    .put(protect, authorize(...adminRoles), controller.updateTipoInsumo)
    .delete(protect, authorize(...adminRoles), controller.deleteTipoInsumo);

// --- Rutas de Insumos (Stock) ---
router.route('/insumos')
    .get(protect, authorize(...adminRoles), controller.getAllInsumos)
    .post(protect, authorize(...adminRoles), controller.createInsumo);
router.route('/insumos/:id')
    .put(protect, authorize(...adminRoles), controller.updateInsumo)
    .delete(protect, authorize(...adminRoles), controller.deleteInsumo)
    .patch(protect, authorize(...adminRoles), controller.updateStockInsumo);

module.exports = router;