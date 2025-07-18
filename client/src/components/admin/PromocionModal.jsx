// client/src/components/admin/PromocionModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos los estilos profesionales

const PromocionModal = ({ show, onClose, onSave, promocion }) => {
    const [formData, setFormData] = useState({
        codigo: '',
        descripcion: '',
        porcentaje_descuento: '',
        fecha_inicio: '',
        fecha_fin: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (show) {
            if (promocion) {
                setFormData({
                    codigo: promocion.codigo || '',
                    descripcion: promocion.descripcion || '',
                    porcentaje_descuento: promocion.porcentaje_descuento?.toString() || '',
                    fecha_inicio: formatDateForInput(promocion.fecha_inicio),
                    fecha_fin: formatDateForInput(promocion.fecha_fin)
                });
            } else {
                setFormData({ codigo: '', descripcion: '', porcentaje_descuento: '', fecha_inicio: '', fecha_fin: '' });
            }
            setInputErrors({}); // Limpiar errores al abrir el modal
        }
    }, [promocion, show]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (name === 'codigo' && !value) {
            errorMessage = 'El código es obligatorio.';
        } else if (name === 'descripcion' && !value) {
            errorMessage = 'La descripción es obligatoria.';
        } else if (name === 'porcentaje_descuento') {
            const numValue = Number(value);
            if (!value) {
                errorMessage = 'El porcentaje de descuento es obligatorio.';
            } else if (isNaN(numValue) || numValue < 1 || numValue > 100) {
                errorMessage = 'Debe ser un número entre 1 y 100.';
            }
        } else if (name === 'fecha_fin' && formData.fecha_inicio && value && value < formData.fecha_inicio) {
            errorMessage = 'La fecha de fin no puede ser anterior a la de inicio.';
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    };

    const handleChange = e => {
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

        const isCodigoValid = validateField('codigo', formData.codigo);
        const isDescripcionValid = validateField('descripcion', formData.descripcion);
        const isPorcentajeValid = validateField('porcentaje_descuento', formData.porcentaje_descuento);
        const isFechaFinValid = validateField('fecha_fin', formData.fecha_fin); // Re-validar fecha fin por si acaso

        if (!isCodigoValid || !isDescripcionValid || !isPorcentajeValid || !isFechaFinValid) {
            alert('Por favor, corrija los errores en el formulario.');
            return;
        }

        const dataToSave = {
            ...formData,
            porcentaje_descuento: Number(formData.porcentaje_descuento),
            fecha_inicio: formData.fecha_inicio || null,
            fecha_fin: formData.fecha_fin || null,
        };
        onSave(dataToSave);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.codigo && formData.descripcion && formData.porcentaje_descuento &&
                        (formData.porcentaje_descuento >=1 && formData.porcentaje_descuento <= 100) &&
                        (!formData.fecha_inicio || !formData.fecha_fin || formData.fecha_fin >= formData.fecha_inicio);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{promocion ? 'Editar Promoción' : 'Crear Nueva Promoción'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Código</label>
                            <input 
                                name="codigo" 
                                value={formData.codigo} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                placeholder="Ej: INVIERNO25" 
                                required 
                                disabled={!!promocion} 
                                style={{ textTransform: 'uppercase' }}
                                className={inputErrors.codigo ? styles.inputError : (formData.codigo && !inputErrors.codigo ? styles.inputSuccess : '')}
                            />
                            {inputErrors.codigo && <p className={styles.inputErrorMessage}>{inputErrors.codigo}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>% de Descuento</label>
                            <input 
                                name="porcentaje_descuento" 
                                type="number" 
                                value={formData.porcentaje_descuento} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                placeholder="Ej: 25" 
                                required 
                                min="1" 
                                max="100"
                                className={inputErrors.porcentaje_descuento ? styles.inputError : (formData.porcentaje_descuento && !inputErrors.porcentaje_descuento ? styles.inputSuccess : '')}
                            />
                            {inputErrors.porcentaje_descuento && <p className={styles.inputErrorMessage}>{inputErrors.porcentaje_descuento}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Descripción</label>
                            <input 
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                placeholder="Descuento para temporada de invierno" 
                                required
                                className={inputErrors.descripcion ? styles.inputError : (formData.descripcion && !inputErrors.descripcion ? styles.inputSuccess : '')}
                            />
                            {inputErrors.descripcion && <p className={styles.inputErrorMessage}>{inputErrors.descripcion}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha de Inicio (Opcional)</label>
                            <input 
                                name="fecha_inicio" 
                                type="date" 
                                value={formData.fecha_inicio} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={inputErrors.fecha_inicio ? styles.inputError : ''}
                            />
                            {inputErrors.fecha_inicio && <p className={styles.inputErrorMessage}>{inputErrors.fecha_inicio}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha de Fin (Opcional)</label>
                            <input 
                                name="fecha_fin" 
                                type="date" 
                                value={formData.fecha_fin} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                min={formData.fecha_inicio} 
                                className={inputErrors.fecha_fin ? styles.inputError : ''}
                            />
                            {inputErrors.fecha_fin && <p className={styles.inputErrorMessage}>{inputErrors.fecha_fin}</p>}
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

export default PromocionModal;