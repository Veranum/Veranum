// client/src/components/admin/CentroEventoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos estilos del modal principal

const CentroEventoModal = ({ show, onClose, onSave, hotel: centroEvento, hoteles }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        hotel_id: '',
        capacidad: '',
        precio_por_hora: '',
        equipamiento: '',
        imagenUrl: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (centroEvento) {
                setFormData({
                    nombre: centroEvento.nombre || '',
                    hotel_id: centroEvento.hotel_id._id || '',
                    capacidad: centroEvento.capacidad?.toString() || '',
                    precio_por_hora: centroEvento.precio_por_hora?.toString() || '',
                    equipamiento: centroEvento.equipamiento?.join(', ') || '',
                    imagenUrl: centroEvento.imagenUrl || ''
                });
            } else {
                setFormData({
                    nombre: '',
                    hotel_id: hoteles.length > 0 ? hoteles[0]._id : '',
                    capacidad: '',
                    precio_por_hora: '',
                    equipamiento: '',
                    imagenUrl: ''
                });
            }
            setInputErrors({}); // Limpiar errores al abrir
        }
    }, [centroEvento, show, hoteles]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'hotel_id', 'capacidad', 'precio_por_hora'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (['capacidad', 'precio_por_hora'].includes(name)) {
            const numValue = Number(value);
            if (value === '' || isNaN(numValue) || numValue <= 0) {
                errorMessage = 'Debe ser un número positivo.';
            }
        } else if (name === 'imagenUrl' && value && !/^https?:\/\/.+\.(png|jpe?g|gif|webp)$/i.test(value)) {
            errorMessage = 'URL de imagen no válida.';
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

        const fieldsToValidate = ['nombre', 'hotel_id', 'capacidad', 'precio_por_hora', 'imagenUrl'];
        let formIsValid = true;
        fieldsToValidate.forEach(field => {
            if (!validateField(field, formData[field])) {
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            alert('Por favor, corrija los errores en el formulario.');
            return;
        }

        const dataToSave = {
            ...formData,
            equipamiento: formData.equipamiento.split(',').map(item => item.trim()).filter(Boolean),
            capacidad: parseInt(formData.capacidad),
            precio_por_hora: parseFloat(formData.precio_por_hora)
        };
        onSave(dataToSave);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && formData.hotel_id && formData.capacidad && formData.precio_por_hora &&
                        Number(formData.capacidad) > 0 && Number(formData.precio_por_hora) > 0;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{centroEvento ? 'Editar Centro de Eventos' : 'Crear Nuevo Centro de Eventos'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <label>Hotel de Pertenencia</label>
                            <select 
                                name="hotel_id" 
                                value={formData.hotel_id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.hotel_id ? styles.inputError : (formData.hotel_id && !inputErrors.hotel_id ? styles.inputSuccess : '')}
                            >
                                <option value="">Seleccione un hotel</option>
                                {hoteles.map(h => <option key={h._id} value={h._id}>{h.nombre}</option>)}
                            </select>
                            {inputErrors.hotel_id && <p className={styles.inputErrorMessage}>{inputErrors.hotel_id}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Nombre del Salón</label>
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
                            <label>Capacidad (personas)</label>
                            <input 
                                type="number" 
                                name="capacidad" 
                                value={formData.capacidad} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="1"
                                className={inputErrors.capacidad ? styles.inputError : (formData.capacidad && !inputErrors.capacidad ? styles.inputSuccess : '')}
                            />
                            {inputErrors.capacidad && <p className={styles.inputErrorMessage}>{inputErrors.capacidad}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Precio por Hora</label>
                            <input 
                                type="number" 
                                name="precio_por_hora" 
                                value={formData.precio_por_hora} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="0"
                                className={inputErrors.precio_por_hora ? styles.inputError : (formData.precio_por_hora && !inputErrors.precio_por_hora ? styles.inputSuccess : '')}
                            />
                            {inputErrors.precio_por_hora && <p className={styles.inputErrorMessage}>{inputErrors.precio_por_hora}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Equipamiento (separado por comas)</label>
                            <input 
                                type="text" 
                                name="equipamiento" 
                                value={formData.equipamiento} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                placeholder="Proyector, Audio, Micrófonos..." 
                                className={inputErrors.equipamiento ? styles.inputError : ''}
                            />
                            {inputErrors.equipamiento && <p className={styles.inputErrorMessage}>{inputErrors.equipamiento}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>URL de la Imagen</label>
                            <input 
                                type="text" 
                                name="imagenUrl" 
                                value={formData.imagenUrl} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                className={inputErrors.imagenUrl ? styles.inputError : (formData.imagenUrl && !inputErrors.imagenUrl ? styles.inputSuccess : '')}
                            />
                            {inputErrors.imagenUrl && <p className={styles.inputErrorMessage}>{inputErrors.imagenUrl}</p>}
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

export default CentroEventoModal;