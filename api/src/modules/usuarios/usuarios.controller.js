// api/src/modules/usuarios/usuarios.controller.js
const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');

// @desc    Obtener todos los usuarios (para Admin)
exports.getAllUsersAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 8;
        const skip = (page - 1) * limit;

        // --- LÓGICA DE FILTROS AÑADIDA ---
        const { searchTerm, roleFilter } = req.query;
        const matchStage = {};

        if (searchTerm) {
            matchStage.$or = [
                { nombre: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { _id: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        if (roleFilter && roleFilter !== 'all') {
            matchStage.rol = roleFilter;
        }
        // --- FIN DE LÓGICA DE FILTROS ---

        const results = await Usuario.aggregate([
            // Aplicamos el filtro al principio del pipeline
            { $match: matchStage },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $lookup: { from: 'reservas', localField: '_id', foreignField: 'cliente_id', as: 'reservasInfo' } },
                        { $project: { _id: 1, nombre: 1, email: 1, rol: 1, createdAt: 1, numeroDeReservas: { $size: '$reservasInfo' } } },
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ]
                }
            }
        ]);

        const usuarios = results[0].data;
        const totalCount = results[0].metadata.length > 0 ? results[0].metadata[0].total : 0;
        
        res.status(200).json({
            success: true,
            data: usuarios,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });
    } catch (error) { 
        next(error); 
    }
};

// @desc    Crear un nuevo usuario (para Admin)
exports.createUserAdmin = async (req, res, next) => {
    const { _id, nombre, email, password, rol } = req.body;
    try {
        const userExists = await Usuario.findOne({ $or: [{ _id }, { email }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'El RUN o el email ya están registrados.' });
        }
        const user = await Usuario.create({ _id, nombre, email, password, rol });
        res.status(201).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// --- NUEVA FUNCIÓN PARA ACTUALIZAR ---
// @desc    Actualizar un usuario (para Admin)
exports.updateUserAdmin = async (req, res, next) => {
    const { nombre, email, rol, password } = req.body;
    try {
        const user = await Usuario.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        user.nombre = nombre || user.nombre;
        user.email = email || user.email;
        user.rol = rol || user.rol;

        // Solo actualizar la contraseña si se proporciona una nueva
        if (password && password.length > 0) {
            user.password = password;
        }

        const updatedUser = await user.save();
        res.status(200).json({ success: true, data: updatedUser });

    } catch (error) {
        next(error);
    }
};

// --- NUEVA FUNCIÓN PARA ELIMINAR ---
// @desc    Eliminar un usuario (para Admin)
exports.deleteUserAdmin = async (req, res, next) => {
    try {
        const user = await Usuario.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        // Opcional: Aquí se podría añadir lógica para manejar las reservas del usuario eliminado
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};