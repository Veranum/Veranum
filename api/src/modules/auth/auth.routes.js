// api/src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./auth.controller.js');
const { protect } = require('../../middleware/auth.middleware.js');
const { loginLimiter } = require('../../middleware/rateLimit.middleware.js'); // Importar el limitador

// Ruta para registrar un nuevo usuario: POST /api/auth/register (También puede tener un limitador)
// router.post('/register', apiLimiter, register); // Puedes aplicar un limitador general si quieres

// Ruta para iniciar sesión: POST /api/auth/login
router.post('/login', loginLimiter, login); // Aplicar el limitador de login

// Ruta para obtener los datos del usuario autenticado (protegida)
router.get('/me', protect, getMe);

module.exports = router;