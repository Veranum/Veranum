// client/src/components/reservations/DateRangePicker.jsx
import React from 'react';
import styles from './DateRangePicker.module.css';

const DateRangePicker = ({ fechas, onDateChange, inputErrors = {} }) => { // Recibe inputErrors
    
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        
        const newFechas = { ...fechas };

        if (name === 'fin' && newFechas.inicio && value < newFechas.inicio) {
            // Si la fecha de salida es anterior a la de llegada, ajusta la fecha de llegada
            newFechas.inicio = value;
        } else if (name === 'inicio' && newFechas.fin && value > newFechas.fin) {
            // Si la fecha de llegada es posterior a la de salida, ajusta la fecha de salida
            newFechas.fin = value;
        }

        newFechas[name] = value;
        onDateChange(newFechas);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className={styles.dateRangeContainer}>
            <div className={styles.dateInputGroup}>
                <label htmlFor="checkin">Check-in</label>
                <input
                    id="checkin"
                    type="date"
                    name="inicio"
                    value={fechas.inicio}
                    onChange={handleDateChange}
                    min={today} // No se puede reservar en el pasado
                    required
                    className={inputErrors.inicio ? styles.inputError : ''}
                />
                 {inputErrors.inicio && <p className={styles.inputErrorMessage}>{inputErrors.inicio}</p>}
            </div>
            <div className={styles.separator}>→</div>
            <div className={styles.dateInputGroup}>
                <label htmlFor="checkout">Check-out</label>
                <input
                    id="checkout"
                    type="date"
                    name="fin"
                    value={fechas.fin}
                    onChange={handleDateChange}
                    min={fechas.inicio || today} // La salida no puede ser antes de la llegada
                    required
                    className={inputErrors.fin ? styles.inputError : ''}
                />
                {inputErrors.fin && <p className={styles.inputErrorMessage}>{inputErrors.fin}</p>}
            </div>
        </div>
    );
};

export default DateRangePicker;