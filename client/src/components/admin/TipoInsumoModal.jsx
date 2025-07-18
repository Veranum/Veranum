// client/src/components/admin/TipoInsumoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos estilos del modal principal

const TipoInsumoModal = ({ show, onClose, onSave, tipoInsumo, hoteles, defaultHotelId }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        hotel_id: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    useEffect(() => {
        if (show) {
            if (tipoInsumo) { // Modo Edición
                setFormData({
                    nombre: tipoInsumo.nombre || '',
                    hotel_id: tipoInsumo.hotel_id?._id || ''
                });
            } else { // Modo Creación
                setFormData({
                    nombre: '',
                    // Asigna el hotel seleccionado en la página o el primero de la lista
                    hotel_id: defaultHotelId || (hoteles.length > 0 ? hoteles[0]._id : '')
                });
            }
            setInputErrors({}); // Limpiar errores al abrir
        }
    }, [tipoInsumo, show, hoteles, defaultHotelId]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'hotel_id'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
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
        const isHotelValid = validateField('hotel_id', formData.hotel_id);

        if (!isNombreValid || !isHotelValid) {
            alert('Por favor, complete todos los campos requeridos correctamente.');
            return;
        }

        onSave(formData);
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && formData.hotel_id;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{tipoInsumo ? 'Editar' : 'Crear'} Tipo de Insumo</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup} style={{marginBottom: '1rem'}}>
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
                    <div className={styles.inputGroup}>
                        <label>Nombre de la Categoría</label>
                        <input 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            placeholder="Ej: Lácteos, Carnes, Bebidas" 
                            required 
                            className={inputErrors.nombre ? styles.inputError : (formData.nombre && !inputErrors.nombre ? styles.inputSuccess : '')}
                        />
                        {inputErrors.nombre && <p className={styles.inputErrorMessage}>{inputErrors.nombre}</p>}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TipoInsumoModal;