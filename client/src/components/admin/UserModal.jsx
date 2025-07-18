// client/src/components/admin/UserModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutiliza estilos del modal principal

const validateRun = (run) => {
    if (!run) return 'El RUN es obligatorio.';
    const runRegex = /^[0-9]{7,8}-[0-9K]$/i;
    if (!runRegex.test(run)) return 'El formato del RUN no es válido (ej: 12345678-9).';
    return '';
};

const validateEmail = (email) => {
    if (!email) return 'El correo electrónico es obligatorio.';
    const emailRegex = /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return 'El formato del correo electrónico no es válido.';
    return '';
};

const validatePassword = (password, isEditing = false) => {
    if (!isEditing && !password) return 'La contraseña es obligatoria para nuevos usuarios.';
    if (password && password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
};

const UserModal = ({ show, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        _id: '',
        nombre: '',
        email: '',
        password: '',
        rol: 'cliente',
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (user) { // Modo edición
                setFormData({
                    _id: user._id || '',
                    nombre: user.nombre || '',
                    email: user.email || '',
                    password: '', // La contraseña no se precarga para edición
                    rol: user.rol || 'cliente',
                });
                setInputErrors({}); // Limpiar errores al abrir en modo edición
            } else { // Modo creación
                setFormData({ _id: '', nombre: '', email: '', password: '', rol: 'cliente' });
                setInputErrors({}); // Limpiar errores al abrir en modo creación
            }
        }
    }, [user, show]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        switch (name) {
            case '_id':
                errorMessage = validateRun(value);
                break;
            case 'nombre':
                if (!value) errorMessage = 'El nombre es obligatorio.';
                break;
            case 'email':
                errorMessage = validateEmail(value);
                break;
            case 'password':
                errorMessage = validatePassword(value, !!user); // Pasar si es modo edición
                break;
            case 'rol':
                if (!value) errorMessage = 'El rol es obligatorio.';
                break;
            default:
                break;
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        const isIdValid = validateField('_id', formData._id);
        const isNombreValid = validateField('nombre', formData.nombre);
        const isEmailValid = validateField('email', formData.email);
        const isPasswordValid = validateField('password', formData.password);
        const isRolValid = validateField('rol', formData.rol);

        if (!isIdValid || !isNombreValid || !isEmailValid || !isPasswordValid || !isRolValid) {
            alert('Por favor, corrija los errores en el formulario.');
            return;
        }

        const dataToSave = { ...formData };
        if (user && !dataToSave.password) {
            delete dataToSave.password; // No enviar contraseña si no se modificó en edición
        }
        onSave(dataToSave);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        (user ? true : (formData.password && formData._id && formData.nombre && formData.email)); // Campos obligatorios para creación

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{user ? `Editar Usuario` : 'Crear Nuevo Usuario'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>RUN (ID de Usuario)</label>
                            <input 
                                type="text" 
                                name="_id" 
                                value={formData._id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                disabled={!!user} 
                                placeholder="12345678-9"
                                className={inputErrors._id ? styles.inputError : (formData._id && !inputErrors._id ? styles.inputSuccess : '')}
                            />
                            {inputErrors._id && <p className={styles.inputErrorMessage}>{inputErrors._id}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre Completo</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.nombre ? styles.inputError : (formData.nombre && !inputErrors.nombre ? styles.inputSuccess : '')}
                            />
                            {inputErrors.nombre && <p className={styles.inputErrorMessage}>{inputErrors.nombre}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.email ? styles.inputError : (formData.email && !inputErrors.email ? styles.inputSuccess : '')}
                            />
                            {inputErrors.email && <p className={styles.inputErrorMessage}>{inputErrors.email}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Contraseña {user ? '(Dejar en blanco para no cambiar)' : ''}</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required={!user} 
                                minLength={user ? undefined : 6} 
                                placeholder={user ? '••••••••' : ''} 
                                className={inputErrors.password ? styles.inputError : (formData.password && !inputErrors.password ? styles.inputSuccess : '')}
                            />
                            {inputErrors.password && <p className={styles.inputErrorMessage}>{inputErrors.password}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Rol</label>
                            <select 
                                name="rol" 
                                value={formData.rol} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={inputErrors.rol ? styles.inputError : ''}
                            >
                                <option value="cliente">Cliente</option>
                                <option value="gerente">Gerente</option>
                                <option value="admin">Admin</option>
                            </select>
                            {inputErrors.rol && <p className={styles.inputErrorMessage}>{inputErrors.rol}</p>}
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;