// api/jest.setup.js
// Cargar variables de entorno solo para pruebas ANTES de que cualquier módulo use process.env
require('dotenv').config({ path: '.env.test' }); 

// Puedes dejar esto vacío si no necesitas configuraciones adicionales para Jest en este punto
// o añadir cosas como aumentar el timeout globalmente si es necesario para tests muy largos:
// jest.setTimeout(30000); // 30 segundos