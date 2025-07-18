// client/src/components/admin/ServicioModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos estilos del modal principal

const ServicioModal = ({ show, onClose, onSave, servicio }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio_diario: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (servicio) {
                setFormData({
                    nombre: servicio.nombre || '',
                    descripcion: servicio.descripcion || '',
                    precio_diario: servicio.precio_diario?.toString() || ''
                });
            } else {
                setFormData({ nombre: '', descripcion: '', precio_diario: '' });
            }
            setInputErrors({}); // Limpiar errores al abrir
        }
    }, [servicio, show]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'descripcion', 'precio_diario'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (name === 'precio_diario') {
            const numValue = parseFloat(value);
            if (value === '' || isNaN(numValue) || numValue < 0) { // Manejar string vacío y 0 para números
                errorMessage = 'Debe ser un número no negativo.';
            }
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
        
        const isNombreValid = validateField('nombre', formData.nombre);
        const isDescripcionValid = validateField('descripcion', formData.descripcion);
        const isPrecioValid = validateField('precio_diario', formData.precio_diario);

        if (!isNombreValid || !isDescripcionValid || !isPrecioValid) {
            alert('Por favor, complete todos los campos requeridos correctamente.');
            return;
        }

        onSave({ ...formData, precio_diario: parseFloat(formData.precio_diario) });
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && formData.descripcion && formData.precio_diario;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>{servicio ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>Nombre del Servicio</label>
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
                    <div className={styles.inputGroup}>
                        <label>Descripción</label>
                        <textarea 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            rows="4" 
                            required 
                            className={inputErrors.descripcion ? styles.inputError : (formData.descripcion && !inputErrors.descripcion ? styles.inputSuccess : '')}
                        />
                        {inputErrors.descripcion && <p className={styles.inputErrorMessage}>{inputErrors.descripcion}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Precio Diario</label>
                        <input 
                            type="number" 
                            name="precio_diario" 
                            value={formData.precio_diario} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            required 
                            min="0" 
                            className={inputErrors.precio_diario ? styles.inputError : (formData.precio_diario && !inputErrors.precio_diario ? styles.inputSuccess : '')}
                        />
                        {inputErrors.precio_diario && <p className={styles.inputErrorMessage}>{inputErrors.precio_diario}</p>}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" disabled={!isFormValid}>Guardar Servicio</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServicioModal;