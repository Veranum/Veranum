// api/src/tests/integration/auth.test.js

require('dotenv').config({ path: '.env.test' }); // Asegura que las variables de entorno de prueba estén cargadas

const request = require('supertest');
const { getTestApp, cleanTestCollections, closeDbConnection } = require('../test_utils'); // Importa las utilidades de test
const User = require('../../modules/usuarios/usuarios.model'); // Importa el modelo User para operaciones directas en DB

let app; // Esta variable contendrá la instancia de la aplicación Express ya configurada y conectada

beforeAll(async () => {
  // Obtiene la instancia completamente configurada de la aplicación Express
  // que ya estará conectada a la base de datos de prueba.
  app = await getTestApp(); 
  
  // Limpia las colecciones relevantes de la base de datos antes de que comiencen todas las pruebas de este suite
  await cleanTestCollections(); 
});

afterEach(async () => {
  // Limpia las colecciones relevantes de la base de datos después de cada test individual para asegurar aislamiento.
  // Esto es crucial para evitar interferencias entre tests.
  await cleanTestCollections(); 
});

afterAll(async () => {
  // Cierra la conexión a la base de datos después de que todas las pruebas en este suite terminen.
  await closeDbConnection(); 
});

describe('Auth API Integration Tests', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app) // Usa la instancia 'app' directamente que ya está conectada a la DB de prueba
      .post('/api/auth/register')
      .send({
        run_cliente: '12345678-9',
        nombre: 'Juan Perez',
        email: 'juan.perez@example.com',
        password: 'password123',
        rol: 'cliente',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    const userInDb = await User.findOne({ email: 'juan.perez@example.com' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.nombre).toBe('Juan Perez');
    expect(userInDb.rol).toBe('cliente'); 
  });

  it('should not register a user with duplicate RUN', async () => {
    // Primero, registra un usuario
    await request(app)
      .post('/api/auth/register')
      .send({
        run_cliente: '98765432-1',
        nombre: 'Maria Lopez',
        email: 'maria.lopez@example.com',
        password: 'password123',
        rol: 'cliente',
      });

    // Intenta registrar otro con el mismo RUN
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        run_cliente: '98765432-1', // RUN duplicado
        nombre: 'Pedro Gomez',
        email: 'pedro.gomez@example.com',
        password: 'anotherpassword',
        rol: 'cliente',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('El RUN ingresado ya se encuentra registrado.');
  });

  it('should login a user with email successfully', async () => {
    // Registra un usuario para esta prueba específica
    await request(app)
      .post('/api/auth/register')
      .send({
        run_cliente: '22334455-6',
        nombre: 'Login User Email',
        email: 'login.email@example.com',
        password: 'loginpassword',
        rol: 'cliente',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: 'login.email@example.com',
        password: 'loginpassword', 
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should login a user with RUN successfully', async () => {
    // Registra un usuario para esta prueba específica
    await request(app)
      .post('/api/auth/register')
      .send({
        run_cliente: '11223344-5',
        nombre: 'Login User RUN',
        email: 'login.run@example.com',
        password: 'runpassword',
        rol: 'cliente',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: '11223344-5', 
        password: 'runpassword', 
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identificador: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Credenciales inválidas.');
  });

  it('should get authenticated user profile', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        run_cliente: '77889900-1',
        nombre: 'Profile User',
        email: 'profile.user@example.com',
        password: 'profilepassword',
        rol: 'cliente',
      });
    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`); 

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('profile.user@example.com');
    expect(res.body.data.nombre).toBe('Profile User');
    expect(res.body.data.rol).toBe('cliente');
    expect(res.body.data).not.toHaveProperty('password'); 
  });

  it('should not get profile without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No autorizado para acceder a esta ruta. Token no proporcionado.');
  });

  it('should not get profile with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123'); 

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No autorizado. El token no es válido.');
  });
});