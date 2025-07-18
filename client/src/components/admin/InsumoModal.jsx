// client/src/components/admin/InsumoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css';

const InsumoModal = ({ show, onClose, onSave, insumo, tipos, proveedores, hoteles }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        stock: '0',
        unidad_medida: 'unidades',
        precio_unitario: '0',
        tipo_insumo_id: '',
        proveedor_id: '',
        hotel_id: ''
    });

    useEffect(() => {
        if (show) {
            if (insumo) { // Modo Edición
                setFormData({
                    nombre: insumo.nombre || '',
                    stock: insumo.stock?.toString() || '0',
                    unidad_medida: insumo.unidad_medida || 'unidades',
                    precio_unitario: insumo.precio_unitario?.toString() || '0',
                    tipo_insumo_id: insumo.tipo_insumo_id?._id || '',
                    proveedor_id: insumo.proveedor_id?._id || '',
                    hotel_id: insumo.hotel_id?._id || ''
                });
            } else { // Modo Creación
                setFormData({
                    nombre: '',
                    stock: '0',
                    unidad_medida: 'unidades',
                    precio_unitario: '0',
                    tipo_insumo_id: tipos.length > 0 ? tipos[0]._id : '',
                    proveedor_id: proveedores.length > 0 ? proveedores[0]._id : '',
                    hotel_id: hoteles.length > 0 ? hoteles[0]._id : ''
                });
            }
        }
    }, [insumo, show, tipos, proveedores, hoteles]);

    if (!show) return null;

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            stock: Number(formData.stock),
            precio_unitario: Number(formData.precio_unitario)
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.largeModal}`}>
                <h2 className={styles.modalTitle}>{insumo ? 'Editar Insumo' : 'Crear Nuevo Insumo'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Insumo</label>
                            <input name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hotel de Pertenencia</label>
                            <select name="hotel_id" value={formData.hotel_id} onChange={handleChange} required>
                                {hoteles.map(h => <option key={h._id} value={h._id}>{h.nombre}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Tipo de Insumo (Categoría)</label>
                            <select name="tipo_insumo_id" value={formData.tipo_insumo_id} onChange={handleChange} required>
                                {tipos.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Proveedor</label>
                            <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} required>
                                {proveedores.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Stock Inicial</label>
                            <input name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" />
                        </div>
                         <div className={styles.inputGroup}>
                            <label>Precio Unitario ($)</label>
                            <input name="precio_unitario" type="number" value={formData.precio_unitario} onChange={handleChange} required min="0" />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label>Unidad de Medida</label>
                            <select name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} required>
                                <option value="unidades">Unidades</option>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="litros">Litros (L)</option>
                            </select>
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar Insumo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsumoModal;