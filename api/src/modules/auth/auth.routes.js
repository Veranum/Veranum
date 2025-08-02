// api/src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./auth.controller.js');
const { protect } = require('../../middleware/auth.middleware.js');
const { loginLimiter } = require('../../middleware/rateLimit.middleware.js'); // Importar el limitador

// Ruta para registrar un nuevo usuario: POST /api/auth/register
router.post('/register', register); // <-- Habilitar la ruta de registro sin apiLimiter

// Ruta para iniciar sesión: POST /api/auth/login
router.post('/login', loginLimiter, login); // Aplicar el limitador de login

// Ruta para obtener los datos del usuario autenticado (protegida)
router.get('/me', protect, getMe);

module.exports = router;