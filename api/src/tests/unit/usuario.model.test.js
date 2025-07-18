// api/src/tests/unit/usuario.model.test.js
const mongoose = require('mongoose');
const User = require('../../modules/usuarios/usuarios.model'); // Ajusta la ruta a tu modelo

describe('User Model Unit Tests', () => {
  let connection;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST;
    // Comprobamos si mongoUri es undefined y lanzamos un error claro para depuración
    if (!mongoUri) {
      throw new Error('MONGO_URI_TEST is not defined. Please check your .env.test file and jest.config.js setupFiles.');
    }
    // Conectar solo si no hay una conexión existente o está desconectada
    if (mongoose.connection.readyState === 0) {
      connection = await mongoose.connect(mongoUri); 
    } else {
      connection = mongoose.connection; // Usar la conexión existente si ya está activa
    }
  });

  afterEach(async () => {
    await User.deleteMany({}); // Limpiar usuarios después de cada prueba
  });

  afterAll(async () => {
    // Cerrar la conexión solo si es la que abrimos en este beforeAll
    if (connection) {
      await mongoose.connection.close(); 
    }
  });

  it('should hash password before saving user', async () => {
    const userData = {
      _id: '12345678-9',
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'plainPassword123',
    };
    const user = new User(userData);
    await user.save();

    const savedUser = await User.findById(userData._id).select('+password');
    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe('plainPassword123'); // Password should be hashed
    const isMatch = await savedUser.matchPassword('plainPassword123');
    expect(isMatch).toBe(true);
  });

  it('should validate RUN format', async () => {
    // Prueba para RUN inválido
    let user = new User({
      _id: 'invalid-run', 
      nombre: 'Invalid User',
      email: 'invalid@example.com',
      password: 'password123',
    });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors._id.message).toBe('INVALID-RUN no es un formato de RUN válido.'); // Mensaje en mayúsculas

    // Prueba para RUN válido (ajustado para cumplir el formato de 7-8 dígitos)
    user = new User({
        _id: '1234567-K', // RUN válido con 7 dígitos y dígito verificador 'K'
        nombre: 'Valid User',
        email: 'valid@example.com',
        password: 'password123',
      });
      err = null;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeNull(); // Ahora sí debe pasar sin error
  });

  it('should validate unique email', async () => {
    await User.create({
      _id: '11111111-1',
      nombre: 'User One',
      email: 'unique@example.com',
      password: 'password123',
    });

    const userTwo = new User({
      _id: '22222222-2',
      nombre: 'User Two',
      email: 'unique@example.com', // Email duplicado
      password: 'password456',
    });
    let err;
    try {
      await userTwo.save();
    } catch (error) {
      err = error;
    }
    expect(err).not.toBeNull();
    expect(err.code).toBe(11000); // Código de error de duplicado de MongoDB
  });
}); 