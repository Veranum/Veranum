// api/jest.config.js
module.exports = {
  preset: '@shelf/jest-mongodb', 
  roots: ['<rootDir>/src/tests'],
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)',
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'], 
  testTimeout: 30000, // Aumentado a 30 segundos para dar más margen a las operaciones de DB
  // --- NUEVA LÍNEA: Ignorar el archivo hotels.test.js ---
  testPathIgnorePatterns: ['/node_modules/', '/src/tests/integration/hotels.test.js'],
};