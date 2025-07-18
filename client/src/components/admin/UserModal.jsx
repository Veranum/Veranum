// client/src/components/admin/UserModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css';

const UserModal = ({ show, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        _id: '',
        nombre: '',
        email: '',
        password: '',
        rol: 'cliente',
    });

    useEffect(() => {
        if (show) {
            if (user) {
                setFormData({
                    _id: user._id || '',
                    nombre: user.nombre || '',
                    email: user.email || '',
                    password: '',
                    rol: user.rol || 'cliente',
                });
            } else {
                setFormData({ _id: '', nombre: '', email: '', password: '', rol: 'cliente' });
            }
        }
    }, [user, show]);

    if (!show) return null;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (user && !dataToSave.password) {
            delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{user ? `Editar Usuario` : 'Crear Nuevo Usuario'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>RUN (ID de Usuario)</label>
                            <input type="text" name="_id" value={formData._id} onChange={handleChange} required disabled={!!user} placeholder="12345678-9"/>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre Completo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Contraseña {user ? '(Dejar en blanco para no cambiar)' : ''}</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!user} minLength={user ? undefined : 6} placeholder={user ? '••••••••' : ''} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Rol</label>
                            {/* --- CAMBIO: Se usan los 3 roles fijos --- */}
                            <select name="rol" value={formData.rol} onChange={handleChange}>
                                <option value="cliente">Cliente</option>
                                <option value="gerente">Gerente</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;