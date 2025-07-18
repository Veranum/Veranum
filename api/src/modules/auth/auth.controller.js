// api/src/modules/auth/auth.controller.js
const Usuario = require('../usuarios/usuarios.model');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    const { run_cliente, nombre, email, password, rol } = req.body;
    try {
        if (!run_cliente || !nombre || !email || !password) {
            return res.status(400).json({ success: false, message: 'Por favor, complete todos los campos.' });
        }
        const usuario = await Usuario.create({ _id: run_cliente, nombre, email, password, rol });
        sendTokenResponse(usuario, 201, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'El RUN ingresado ya se encuentra registrado.' });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const { identificador, password } = req.body;
    try {
        if (!identificador || !password) {
            return res.status(400).json({ success: false, message: 'Por favor, ingrese identificador y contraseña.' });
        }
        
        const usuario = await Usuario.findOne({ 
            $or: [{ _id: identificador.toUpperCase() }, { email: identificador.toLowerCase() }] 
        }).select('+password');

        if (!usuario || !(await usuario.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
        sendTokenResponse(usuario, 200, res);
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    const usuario = await Usuario.findById(req.user.id);
    res.status(200).json({ success: true, data: usuario });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, rol: user.rol, nombre: user.nombre },
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
    );
    res.status(statusCode).json({ success: true, token });
};