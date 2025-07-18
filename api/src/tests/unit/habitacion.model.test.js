// api/src/tests/unit/habitacion.model.test.js
const mongoose = require('mongoose');
// CORRECCIÓN: Asegúrate de que la ruta sea correcta (habitaciones.model con 'es')
const Habitacion = require('../../modules/habitaciones/habitaciones.model'); 
const Counter = require('../../modules/counters/counters.model'); 
const Hotel = require('../../modules/hoteles/hotel.model'); 

describe('Habitacion Model Unit Tests', () => {
  let testHotel;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST;
    if (!mongoUri) {
      throw new Error('MONGO_URI_TEST is not defined. Please check your .env.test file and jest.config.js setupFiles.');
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri); 
    }
  });

  beforeEach(async () => {
    await Habitacion.deleteMany({});
    await Hotel.deleteMany({});
    await Counter.deleteMany({}); 
    
    testHotel = await Hotel.create({
        nombre: 'Hotel Unit Test',
        ubicacion: { direccion: '123 Test St', ciudad: 'Testville', pais: 'Testland' },
        servicios_extras: []
    });
  });

  afterAll(async () => {
    await mongoose.connection.close(); 
  });

  it('should auto-increment _id (numeroHabitacion) on save', async () => {
    const habitacion1 = await Habitacion.create({
      hotel_id: testHotel._id,
      nombre: 'Habitacion 1',
      descripcion: 'desc',
      categoria: 'individual',
      capacidad: 1,
      piso: 1,
      cantidad: 1
    });
    expect(habitacion1.numeroHabitacion).toBe(1);

    const habitacion2 = await Habitacion.create({
      hotel_id: testHotel._id,
      nombre: 'Habitacion 2',
      descripcion: 'desc',
      categoria: 'doble',
      capacidad: 2,
      piso: 2,
      cantidad: 1
    });
    expect(habitacion2.numeroHabitacion).toBe(2);

    const counter = await Counter.findOne({ _id: 'habitacionId' });
    expect(counter.sequence_value).toBe(2);
  });

  it('should enforce required fields', async () => {
    const invalidHabitacion = new Habitacion({});
    let err;
    try {
      await invalidHabitacion.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.nombre).toBeDefined();
    expect(err.errors.hotel_id).toBeDefined();
    // ... más aserciones para otros campos requeridos
  });

  it('should enforce min value for cantidad', async () => {
    const invalidHabitacion = new Habitacion({
      hotel_id: testHotel._id,
      nombre: 'Habitacion Invalid',
      descripcion: 'desc',
      categoria: 'individual',
      capacidad: 1,
      piso: 1,
      cantidad: 0 // Cantidad inválida
    });
    let err;
    try {
      await invalidHabitacion.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.cantidad.message).toBe('Debe haber al menos una habitación de este tipo.');
  });
});