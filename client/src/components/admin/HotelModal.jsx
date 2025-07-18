// client/src/components/admin/HotelModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Importa los estilos compartidos

const HotelModal = ({ show, onClose, onSave, hotel }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        ciudad: '',
        pais: 'Chile',
        servicios_extras: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (hotel) {
                // Modo Edición
                setFormData({
                    nombre: hotel.nombre || '',
                    direccion: hotel.ubicacion?.direccion || '',
                    ciudad: hotel.ubicacion?.ciudad || '',
                    pais: hotel.ubicacion?.pais || 'Chile',
                    servicios_extras: hotel.servicios_extras?.join(', ') || ''
                });
            } else {
                // Modo Creación
                setFormData({ nombre: '', direccion: '', ciudad: '', pais: 'Chile', servicios_extras: '' });
            }
            setInputErrors({}); // Limpiar errores al abrir el modal
        }
    }, [hotel, show]);

    if (!show) {
        return null;
    }

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'direccion', 'ciudad', 'pais'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
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
        const isDireccionValid = validateField('direccion', formData.direccion);
        const isCiudadValid = validateField('ciudad', formData.ciudad);
        const isPaisValid = validateField('pais', formData.pais);

        if (!isNombreValid || !isDireccionValid || !isCiudadValid || !isPaisValid) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        const dataToSave = {
            nombre: formData.nombre,
            ubicacion: {
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                pais: formData.pais
            },
            servicios_extras: formData.servicios_extras.split(',').map(s => s.trim()).filter(Boolean)
        };
        onSave(dataToSave);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && formData.direccion && formData.ciudad && formData.pais;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{hotel ? 'Editar Hotel' : 'Crear Nuevo Hotel'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Hotel</label>
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
                            <label>Ciudad</label>
                            <input 
                                type="text" 
                                name="ciudad" 
                                value={formData.ciudad} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.ciudad ? styles.inputError : (formData.ciudad && !inputErrors.ciudad ? styles.inputSuccess : '')}
                            />
                            {inputErrors.ciudad && <p className={styles.inputErrorMessage}>{inputErrors.ciudad}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Dirección</label>
                            <input 
                                type="text" 
                                name="direccion" 
                                value={formData.direccion} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.direccion ? styles.inputError : (formData.direccion && !inputErrors.direccion ? styles.inputSuccess : '')}
                            />
                            {inputErrors.direccion && <p className={styles.inputErrorMessage}>{inputErrors.direccion}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Servicios Extras (separados por coma)</label>
                            <input 
                                type="text" 
                                name="servicios_extras" 
                                value={formData.servicios_extras} 
                                onChange={handleChange} 
                                placeholder="Piscina, Gimnasio, Spa..." 
                                className={inputErrors.servicios_extras ? styles.inputError : ''}
                            />
                            {inputErrors.servicios_extras && <p className={styles.inputErrorMessage}>{inputErrors.servicios_extras}</p>}
                        </div>
                    </div>

                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar Hotel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HotelModal;