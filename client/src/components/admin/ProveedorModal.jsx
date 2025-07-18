// client/src/components/admin/ProveedorModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos los estilos profesionales

const ProveedorModal = ({ show, onClose, onSave, proveedor }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        contacto_nombre: '',
        telefono: '',
        email: '',
        direccion: ''
    });

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
        }
    }, [proveedor, show]);

    if (!show) return null;

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();
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

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{proveedor ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nombre de la Empresa</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Contacto</label>
                            <input name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Teléfono</label>
                            <input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Dirección (Opcional)</label>
                            <input name="direccion" value={formData.direccion} onChange={handleChange} />
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

export default ProveedorModal;