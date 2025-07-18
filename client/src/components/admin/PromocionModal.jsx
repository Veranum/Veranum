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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
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
        }
    }, [promocion, show]);

    if (!show) return null;

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = e => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            porcentaje_descuento: Number(formData.porcentaje_descuento),
            fecha_inicio: formData.fecha_inicio || null,
            fecha_fin: formData.fecha_fin || null,
        };
        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{promocion ? 'Editar Promoción' : 'Crear Nueva Promoción'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Código</label>
                            <input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: INVIERNO25" required disabled={!!promocion} style={{ textTransform: 'uppercase' }}/>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>% de Descuento</label>
                            <input name="porcentaje_descuento" type="number" value={formData.porcentaje_descuento} onChange={handleChange} placeholder="Ej: 25" required min="1" max="100"/>
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Descripción</label>
                            <input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descuento para temporada de invierno" required/>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha de Inicio (Opcional)</label>
                            <input name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha de Fin (Opcional)</label>
                            <input name="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} min={formData.fecha_inicio} />
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

export default PromocionModal;