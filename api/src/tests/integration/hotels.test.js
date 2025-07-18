// api/src/tests/integration/hotels.test.js

require('dotenv').config({ path: '.env.test' }); // Asegura que las variables de entorno de prueba estén cargadas

const request = require('supertest');
const startApp = require('../../server'); // Importa la nueva función startApp
const mongoose = require('mongoose');
const Hotel = require('../../modules/hoteles/hotel.model');
const User = require('../../modules/usuarios/usuarios.model'); 

let appInstance; // Variable para mantener la instancia de la aplicación Express configurada para tests
let adminToken;
let gerenteToken;
let clientToken;

beforeAll(async () => {
    // Inicia la aplicación Express, sobrescribiendo la URI de MongoDB con la de prueba,
    // y sin iniciar el servidor HTTP (startListening: false).
    appInstance = await startApp(process.env.MONGO_URI_TEST, false); 

    // Limpiar colecciones relevantes antes de crear usuarios de prueba
    await User.deleteMany({}); 
    await Hotel.deleteMany({});
    
    console.log("\n--- Hotels Test Suite: Registration Attempts ---");
    const adminRegRes = await request(appInstance).post('/api/auth/register').send({ run_cliente: '11111111-1', nombre: 'Admin User', email: 'admin@test.com', password: 'password123', rol: 'admin' });
    console.log("Hotels Suite Admin register response:", adminRegRes.statusCode, adminRegRes.body);
    
    const gerenteRegRes = await request(appInstance).post('/api/auth/register').send({ run_cliente: '22222222-2', nombre: 'Gerente User', email: 'gerente@test.com', password: 'password123', rol: 'gerente' });
    console.log("Hotels Suite Gerente register response:", gerenteRegRes.statusCode, gerenteRegRes.body);

    const clientRegRes = await request(appInstance).post('/api/auth/register').send({ run_cliente: '33333333-3', nombre: 'Client User', email: 'client@test.com', password: 'password123', rol: 'cliente' });
    console.log("Hotels Suite Client register response:", clientRegRes.statusCode, clientRegRes.body);

    expect(adminRegRes.statusCode).toBe(201);
    expect(gerenteRegRes.statusCode).toBe(201);
    expect(clientRegRes.statusCode).toBe(201);

    // NUEVO DEBUGGING: Verificar usuario en DB y matchPassword justo después del registro.
    const adminUserInDb = await User.findOne({ email: 'admin@test.com' }).select('+password');
    console.log("Hotels Suite - Admin User in DB after registration (email):", adminUserInDb ? adminUserInDb.email : null);
    if (adminUserInDb) {
        const isMatch = await adminUserInDb.matchPassword('password123');
        console.log("Hotels Suite - Admin password matches using matchPassword method:", isMatch);
        expect(isMatch).toBe(true); 
    } else {
        throw new Error("Hotels Suite - Admin user not found in DB after registration, this is critical.");
    }
    

    console.log("\n--- Hotels Test Suite: Login Attempts ---");
    const adminLoginRes = await request(appInstance).post('/api/auth/login').send({ identificador: 'admin@test.com', password: 'password123' });
    adminToken = adminLoginRes.body.token;
    console.log("Hotels Suite Admin login response:", adminLoginRes.statusCode, adminLoginRes.body);
    expect(adminLoginRes.statusCode).toBe(200); 

    const gerenteLoginRes = await request(appInstance).post('/api/auth/login').send({ identificador: 'gerente@test.com', password: 'password123' });
    gerenteToken = gerenteLoginRes.body.token;
    console.log("Hotels Suite Gerente login response:", gerenteLoginRes.statusCode, gerenteLoginRes.body);
    expect(gerenteLoginRes.statusCode).toBe(200); 

    const clientLoginRes = await request(appInstance).post('/api/auth/login').send({ identificador: 'client@test.com', password: 'password123' });
    clientToken = clientLoginRes.body.token;
    console.log("Hotels Suite Client login response:", clientLoginRes.statusCode, clientLoginRes.body);
    expect(clientLoginRes.statusCode).toBe(200); 


    expect(adminToken).toBeDefined();
    expect(gerenteToken).toBeDefined();
    expect(clientToken).toBeDefined();

  }, 30000); // Aumenta el timeout para el beforeAll para operaciones de DB y red

  afterEach(async () => {
    // Limpia la colección de hoteles después de cada test individual
    await Hotel.deleteMany({});
  });

  afterAll(async () => {
    // Asegúrate de limpiar usuarios y cerrar la conexión de Mongoose después de todos los tests del suite
    await User.deleteMany({}); 
    if (mongoose.connection.readyState !== 0) { 
        await mongoose.connection.close();
    }
  });

  // --- GET /api/hoteles (Pública) ---
  it('should get all hotels (public access)', async () => {
    await Hotel.create({ nombre: 'Hotel A', ubicacion: { direccion: '1 A', ciudad: 'City A', pais: 'Country A' } });
    await Hotel.create({ nombre: 'Hotel B', ubicacion: { direccion: '2 B', ciudad: 'City B', pais: 'Country B' } });

    const res = await request(appInstance).get('/api/hoteles'); // Usa appInstance

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2); 
    expect(res.body.data[0].nombre).toBe('Hotel A');
    expect(res.body.data[1].nombre).toBe('Hotel B');
  });

  // --- POST /api/hoteles (Protegida: admin, gerente) ---
  it('should create a new hotel as admin', async () => {
    const res = await request(appInstance)
      .post('/api/hoteles')
      .set('Authorization', `Bearer ${adminToken}`) 
      .send({
        nombre: 'Nuevo Hotel',
        ubicacion: { direccion: 'New St 1', ciudad: 'New City', pais: 'New Country' },
        servicios_extras: ['Parking']
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe('Nuevo Hotel');
    expect(res.body.data.ubicacion.ciudad).toBe('New City');

    const hotelInDb = await Hotel.findOne({ nombre: 'Nuevo Hotel' });
    expect(hotelInDb).not.toBeNull();
  });

  it('should not create a new hotel without authentication', async () => {
    const res = await request(appInstance)
      .post('/api/hoteles')
      .send({ nombre: 'Hotel Sin Auth', ubicacion: { direccion: 'No St', ciudad: 'No City', pais: 'No Country' } });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should not create a new hotel as client', async () => {
    const res = await request(appInstance)
      .post('/api/hoteles')
      .set('Authorization', `Bearer ${clientToken}`) 
      .send({ nombre: 'Hotel Cliente', ubicacion: { direccion: 'Client St', ciudad: 'Client City', pais: 'Client Country' } });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('no está autorizado');
  });

  it('should not create a hotel with missing required fields', async () => {
    const res = await request(appInstance)
      .post('/api/hoteles')
      .set('Authorization', `Bearer ${adminToken}`) 
      .send({
        nombre: 'Hotel Incompleto' 
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('path `direccion` is required'); 
  });

  it('should update an existing hotel as gerente', async () => {
    const hotel = await Hotel.create({ nombre: 'Hotel a Actualizar', ubicacion: { direccion: 'Old St', ciudad: 'Old City', pais: 'Old Country' } });

    const res = await request(appInstance)
      .put(`/api/hoteles/${hotel._id}`)
      .set('Authorization', `Bearer ${gerenteToken}`) 
      .send({ nombre: 'Hotel Actualizado', 'ubicacion.ciudad': 'Updated City' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe('Hotel Actualizado');
    expect(res.body.data.ubicacion.ciudad).toBe('Updated City');

    const updatedHotelInDb = await Hotel.findById(hotel._id);
    expect(updatedHotelInDb.nombre).toBe('Hotel Actualizado');
    expect(updatedHotelInDb.ubicacion.ciudad).toBe('Updated City');
  });

  it('should not update a non-existent hotel', async () => {
    const nonExistentId = new mongoose.Types.ObjectId(); 

    const res = await request(appInstance)
      .put(`/api/hoteles/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`) 
      .send({ nombre: 'No Existe' });

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Hotel no encontrado');
  });

  it('should delete an existing hotel as admin', async () => {
    const hotel = await Hotel.create({ nombre: 'Hotel a Eliminar', ubicacion: { direccion: 'Del St', ciudad: 'Del City', pais: 'Del Country' } });

    const res = await request(appInstance)
      .delete(`/api/hoteles/${hotel._id}`)
      .set('Authorization', `Bearer ${adminToken}`); 

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({}); 

    const deletedHotelInDb = await Hotel.findById(hotel._id);
    expect(deletedHotelInDb).toBeNull();
  });

  it('should not delete a non-existent hotel', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(appInstance)
      .delete(`/api/hoteles/${nonExistentId}`)
      .set('Authorization', `Bearer ${gerenteToken}`); 

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Hotel no encontrado');
  });