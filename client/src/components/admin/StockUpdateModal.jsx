import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css'; // Reutilizamos estilos del modal principal

const StockUpdateModal = ({ show, onClose, onUpdate, insumo }) => {
    const [cantidad, setCantidad] = useState(1);
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        if (show) {
            setCantidad(1); // Resetear cantidad al abrir
            setInputError(''); // Limpiar errores al abrir
        }
    }, [show]);

    if (!show) return null;

    const handleQuantityChange = (e) => {
        const value = Number(e.target.value);
        if (isNaN(value) || value <= 0) {
            setInputError('La cantidad debe ser un número positivo.');
        } else {
            setInputError('');
            setCantidad(value);
        }
    };

    const handleUpdate = (factor) => {
        if (inputError || cantidad <= 0) {
            alert('Por favor, ingrese una cantidad válida y positiva.');
            return;
        }
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
                        onChange={handleQuantityChange} 
                        onBlur={handleQuantityChange} // Validar al perder el foco
                        min="1" 
                        required
                        className={inputError ? styles.inputError : (cantidad > 0 ? styles.inputSuccess : '')}
                    />
                    {inputError && <p className={styles.inputErrorMessage}>{inputError}</p>}
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={() => handleUpdate(-1)} className={styles.cancelButton} disabled={inputError || cantidad <= 0 || (insumo?.stock - cantidad < 0)}>Restar Cantidad</button>
                    <button onClick={() => handleUpdate(1)} disabled={inputError || cantidad <= 0}>Añadir Cantidad</button>
                </div>
                <button type="button" onClick={onClose} style={{marginTop: '1rem', width: '100%'}}>Cerrar</button>
            </div>
        </div>
    );
};

export default StockUpdateModal;