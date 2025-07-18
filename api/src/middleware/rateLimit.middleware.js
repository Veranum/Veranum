// api/src/middleware/rateLimit.middleware.js
const rateLimit = require('express-rate-limit');

// Limitador básico para prevenir ataques de fuerza bruta en el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limita cada IP a 5 solicitudes por windowMs
  message: 'Demasiados intentos de inicio de sesión desde esta IP, por favor, inténtalo de nuevo después de 15 minutos.',
  standardHeaders: true, // Retorna los encabezados RateLimit-* en la respuesta
  legacyHeaders: false, // Deshabilita los encabezados X-RateLimit-*
});

// Limitador más general para rutas que no requieren mucha frecuencia
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // Limita cada IP a 100 solicitudes por hora
  message: 'Demasiadas solicitudes desde esta IP, por favor, inténtalo de nuevo después de una hora.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
};