// client/src/components/admin/TipoInsumoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css';

const TipoInsumoModal = ({ show, onClose, onSave, tipoInsumo, hoteles, defaultHotelId }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        hotel_id: ''
    });

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
        }
    }, [tipoInsumo, show, hoteles, defaultHotelId]);

    if (!show) return null;

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{tipoInsumo ? 'Editar' : 'Crear'} Tipo de Insumo</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup} style={{marginBottom: '1rem'}}>
                        <label>Hotel de Pertenencia</label>
                        <select name="hotel_id" value={formData.hotel_id} onChange={handleChange} required>
                            {hoteles.map(h => <option key={h._id} value={h._id}>{h.nombre}</option>)}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Nombre de la Categoría</label>
                        <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Lácteos, Carnes, Bebidas" required />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TipoInsumoModal;