// client/src/components/admin/InsumoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos estilos del modal principal

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
    const [inputErrors, setInputErrors] = useState({});

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
            setInputErrors({}); // Limpiar errores al abrir
        }
    }, [insumo, show, tipos, proveedores, hoteles]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['nombre', 'unidad_medida', 'tipo_insumo_id', 'proveedor_id', 'hotel_id'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (['stock', 'precio_unitario'].includes(name)) {
            const numValue = Number(value);
            if (value === '' || isNaN(numValue) || numValue < 0) { // Permitir string vacío para el campo si no es un número
                errorMessage = 'Debe ser un número no negativo.';
            }
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
        
        const fieldsToValidate = ['nombre', 'stock', 'unidad_medida', 'precio_unitario', 'tipo_insumo_id', 'proveedor_id', 'hotel_id'];
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

        onSave({ 
            ...formData, 
            stock: Number(formData.stock),
            precio_unitario: Number(formData.precio_unitario)
        });
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.nombre && (formData.stock !== '') && (formData.precio_unitario !== '') &&
                        formData.unidad_medida && formData.tipo_insumo_id && formData.proveedor_id && formData.hotel_id &&
                        Number(formData.stock) >= 0 && Number(formData.precio_unitario) >= 0;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.largeModal}`}>
                <h2 className={styles.modalTitle}>{insumo ? 'Editar Insumo' : 'Crear Nuevo Insumo'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Nombre del Insumo</label>
                            <input 
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
                            <label>Tipo de Insumo (Categoría)</label>
                            <select 
                                name="tipo_insumo_id" 
                                value={formData.tipo_insumo_id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.tipo_insumo_id ? styles.inputError : (formData.tipo_insumo_id && !inputErrors.tipo_insumo_id ? styles.inputSuccess : '')}
                            >
                                <option value="">Seleccione un tipo</option>
                                {tipos.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
                            </select>
                            {inputErrors.tipo_insumo_id && <p className={styles.inputErrorMessage}>{inputErrors.tipo_insumo_id}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Proveedor</label>
                            <select 
                                name="proveedor_id" 
                                value={formData.proveedor_id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.proveedor_id ? styles.inputError : (formData.proveedor_id && !inputErrors.proveedor_id ? styles.inputSuccess : '')}
                            >
                                <option value="">Seleccione un proveedor</option>
                                {proveedores.map(p => <option key={p._id} value={p._id}>{p.nombre}</option>)}
                            </select>
                            {inputErrors.proveedor_id && <p className={styles.inputErrorMessage}>{inputErrors.proveedor_id}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Stock Inicial</label>
                            <input 
                                name="stock" 
                                type="number" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="0" 
                                className={inputErrors.stock ? styles.inputError : (formData.stock !== '' && !inputErrors.stock ? styles.inputSuccess : '')}
                            />
                            {inputErrors.stock && <p className={styles.inputErrorMessage}>{inputErrors.stock}</p>}
                        </div>
                         <div className={styles.inputGroup}>
                            <label>Precio Unitario ($)</label>
                            <input 
                                name="precio_unitario" 
                                type="number" 
                                value={formData.precio_unitario} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="0" 
                                className={inputErrors.precio_unitario ? styles.inputError : (formData.precio_unitario !== '' && !inputErrors.precio_unitario ? styles.inputSuccess : '')}
                            />
                            {inputErrors.precio_unitario && <p className={styles.inputErrorMessage}>{inputErrors.precio_unitario}</p>}
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                            <label>Unidad de Medida</label>
                            <select 
                                name="unidad_medida" 
                                value={formData.unidad_medida} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.unidad_medida ? styles.inputError : (formData.unidad_medida && !inputErrors.unidad_medida ? styles.inputSuccess : '')}
                            >
                                <option value="unidades">Unidades</option>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="litros">Litros (L)</option>
                            </select>
                            {inputErrors.unidad_medida && <p className={styles.inputErrorMessage}>{inputErrors.unidad_medida}</p>}
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar Insumo</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InsumoModal;