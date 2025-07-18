// client/src/components/admin/CentroEventoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos los estilos profesionales

const CentroEventoModal = ({ show, onClose, onSave, hotel: centroEvento, hoteles }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        hotel_id: '',
        capacidad: '',
        precio_por_hora: '',
        equipamiento: '',
        imagenUrl: ''
    });

    useEffect(() => {
        if (show) {
            if (centroEvento) {
                setFormData({
                    nombre: centroEvento.nombre || '',
                    hotel_id: centroEvento.hotel_id._id || '',
                    capacidad: centroEvento.capacidad || '',
                    precio_por_hora: centroEvento.precio_por_hora || '',
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
        }
    }, [centroEvento, show, hoteles]);

    if (!show) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            equipamiento: formData.equipamiento.split(',').map(item => item.trim()).filter(Boolean),
            capacidad: parseInt(formData.capacidad),
            precio_por_hora: parseFloat(formData.precio_por_hora)
        };
        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{centroEvento ? 'Editar Centro de Eventos' : 'Crear Nuevo Centro de Eventos'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <label>Hotel de Pertenencia</label>
                            <select name="hotel_id" value={formData.hotel_id} onChange={handleChange} required>
                                {hoteles.map(h => <option key={h._id} value={h._id}>{h.nombre}</option>)}
                            </select>
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Nombre del Salón</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Capacidad (personas)</label>
                            <input type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Precio por Hora</label>
                            <input type="number" name="precio_por_hora" value={formData.precio_por_hora} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Equipamiento (separado por comas)</label>
                            <input type="text" name="equipamiento" value={formData.equipamiento} onChange={handleChange} placeholder="Proyector, Audio, Micrófonos..." />
                        </div>
                        <div className={styles.fullWidth}>
                            <label>URL de la Imagen</label>
                            <input type="text" name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} />
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CentroEventoModal;