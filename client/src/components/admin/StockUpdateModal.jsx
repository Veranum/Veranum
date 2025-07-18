import React, { useState } from 'react';
import styles from './ReservaModal.module.css';

const StockUpdateModal = ({ show, onClose, onUpdate, insumo }) => {
    const [cantidad, setCantidad] = useState(1);

    if (!show) return null;

    // Llama a la función onUpdate con un valor positivo para sumar o negativo para restar
    const handleUpdate = (factor) => {
        onUpdate(cantidad * factor);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.smallModal}`}>
                <h2>Ajustar Stock de: {insumo?.nombre}</h2>
                <p>Stock Actual: <strong>{insumo?.stock} {insumo?.unidad_medida}</strong></p>
                <div className={styles.inputGroup}>
                    <label>Cantidad a Ajustar</label>
                    <input 
                        type="number" 
                        value={cantidad} 
                        onChange={(e) => setCantidad(Number(e.target.value))} 
                        min="1" 
                    />
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={() => handleUpdate(-1)} className={styles.cancelButton}>Restar Cantidad</button>
                    <button onClick={() => handleUpdate(1)}>Añadir Cantidad</button>
                </div>
                <button type="button" onClick={onClose} style={{marginTop: '1rem', width: '100%'}}>Cerrar</button>
            </div>
        </div>
    );
};

export default StockUpdateModal;