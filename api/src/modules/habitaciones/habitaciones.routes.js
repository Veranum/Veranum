// src/modules/habitaciones/habitaciones.routes.js
const express = require('express');
const router = express.Router();
const { 
  getHabitaciones, 
  getHabitacion, 
  createHabitacion, 
  updateHabitacion, 
  deleteHabitacion,
  // --- NUEVO IMPORT ---
  getHabitacionesAdminStatus 
} = require('./habitaciones.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const adminRoles = ['admin', 'gerente'];

// --- NUEVA RUTA PARA EL PANEL DE ADMIN ---
router.route('/admin/status')
  .get(protect, authorize(...adminRoles), getHabitacionesAdminStatus);

// La ruta raíz ahora maneja GET para todos y POST para admin
router.route('/')
  .get(getHabitaciones)
  .post(protect, authorize(...adminRoles), createHabitacion);

router.route('/:id')
  .get(getHabitacion)
  .put(protect, authorize(...adminRoles), updateHabitacion)
  .delete(protect, authorize(...adminRoles), deleteHabitacion);

module.exports = router;