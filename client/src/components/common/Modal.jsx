// src/components/common/Modal.jsx
import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ show, onClose, title, children }) => {
    if (!show) {
        return null;
    }

    return (
        // El overlay que oscurece el fondo
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Contenedor del modal, se evita que el clic se propague al overlay */}
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.acceptButton}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;