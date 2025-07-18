// client/src/components/admin/ProveedorModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos los estilos profesionales

const validateEmail = (email) => {
    if (!email) return 'El email es obligatorio.';
    const emailRegex = /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return 'El formato del email no es válido.';
    return '';
};

const ProveedorModal = ({ show, onClose, onSave, proveedor }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        contacto_nombre: '',
        telefono: '',
        email: '',
        direccion: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (proveedor) {
                setFormData({
                    nombre: proveedor.nombre || '',
                    contacto_nombre: proveedor.contacto?.nombre || '',
                    telefono: proveedor.contacto?.telefono || '',
                    email: proveedor.contacto?.email || '',
                    direccion: proveedor.direccion || ''
                });
            } else {
                setFormData({ nombre: '', contacto_nombre: '', telefono: '', email: '', direccion: '' });
            }
            setInputErrors({}); // Limpiar errores al abrir
        }
    }, [proveedor, show]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'contacto_nombre', 'telefono', 'email'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (name === 'email') {
            errorMessage = validateEmail(value);
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = e => {
        e.preventDefault();

        const isNombreValid = validateField('nombre', formData.nombre);
        const isContactoNombreValid = validateField('contacto_nombre', formData.contacto_nombre);
        const isTelefonoValid = validateField('telefono', formData.telefono);
        const isEmailValid = validateField('email', formData.email);

        if (!isNombreValid || !isContactoNombreValid || !isTelefonoValid || !isEmailValid) {
            alert('Por favor, complete todos los campos requeridos correctamente.');
            return;
        }

        const dataToSave = {
            nombre: formData.nombre,
            direccion: formData.direccion,
            contacto: {
                nombre: formData.contacto_nombre,
                telefono: formData.telefono,
                email: formData.email
            }
        };
        onSave(dataToSave);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && formData.contacto_nombre && formData.telefono && formData.email;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{proveedor ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nombre de la Empresa</label>
                            <input 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.nombre ? styles.inputError : (formData.nombre && !inputErrors.nombre ? styles.inputSuccess : '')}
                            />
                            {inputErrors.nombre && <p className={styles.inputErrorMessage}>{inputErrors.nombre}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Contacto</label>
                            <input 
                                name="contacto_nombre" 
                                value={formData.contacto_nombre} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.contacto_nombre ? styles.inputError : (formData.contacto_nombre && !inputErrors.contacto_nombre ? styles.inputSuccess : '')}
                            />
                            {inputErrors.contacto_nombre && <p className={styles.inputErrorMessage}>{inputErrors.contacto_nombre}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Teléfono</label>
                            <input 
                                name="telefono" 
                                type="tel" 
                                value={formData.telefono} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.telefono ? styles.inputError : (formData.telefono && !inputErrors.telefono ? styles.inputSuccess : '')}
                            />
                            {inputErrors.telefono && <p className={styles.inputErrorMessage}>{inputErrors.telefono}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.email ? styles.inputError : (formData.email && !inputErrors.email ? styles.inputSuccess : '')}
                            />
                            {inputErrors.email && <p className={styles.inputErrorMessage}>{inputErrors.email}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Dirección (Opcional)</label>
                            <input 
                                name="direccion" 
                                value={formData.direccion} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                className={inputErrors.direccion ? styles.inputError : ''}
                            />
                            {inputErrors.direccion && <p className={styles.inputErrorMessage}>{inputErrors.direccion}</p>}
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProveedorModal;