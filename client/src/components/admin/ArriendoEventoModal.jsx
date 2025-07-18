// client/src/components/admin/ArriendoEventoModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReservaModal.module.css';

const ArriendoEventoModal = ({ show, onClose, onSave, arriendo, centros }) => {
    const [formData, setFormData] = useState({
        cliente_nombre: '',
        cliente_email: '',
        fecha_evento: '',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        precio_total: '',
        estado: 'Confirmado',
        centro_evento_id: ''
    });
    const [inputErrors, setInputErrors] = useState({});

    const [selectedCentro, setSelectedCentro] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (show) {
            if (arriendo) { // Modo Edición
                const centro = centros.find(c => c._id === arriendo.centro_evento_id._id);
                setSelectedCentro(centro);
                setFormData({
                    cliente_nombre: arriendo.cliente_nombre || '',
                    cliente_email: arriendo.cliente_email || '',
                    fecha_evento: new Date(arriendo.fecha_evento).toISOString().split('T')[0],
                    hora_inicio: arriendo.hora_inicio || '09:00',
                    hora_fin: arriendo.hora_fin || '10:00',
                    precio_total: arriendo.precio_total?.toString() || '',
                    estado: arriendo.estado || 'Confirmado',
                    centro_evento_id: arriendo.centro_evento_id?._id || ''
                });
            } else { // Modo Creación
                const primerCentro = centros.length > 0 ? centros[0] : null;
                setSelectedCentro(primerCentro);
                setFormData({
                    cliente_nombre: '', cliente_email: '', fecha_evento: '',
                    hora_inicio: '09:00', hora_fin: '10:00', precio_total: '',
                    estado: 'Confirmado',
                    centro_evento_id: primerCentro ? primerCentro._id : ''
                });
            }
            setInputErrors({}); // Limpiar errores al abrir el modal
        }
    }, [arriendo, show, centros]);
    
    useEffect(() => {
        if (formData.hora_inicio && formData.hora_fin && selectedCentro) {
            const [startHour, startMinute] = formData.hora_inicio.split(':').map(Number);
            const [endHour, endMinute] = formData.hora_fin.split(':').map(Number);

            // Validar que la hora fin sea posterior a la hora inicio
            if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
                setInputErrors(prev => ({ ...prev, hora_fin: 'La hora de fin debe ser posterior a la de inicio.' }));
                setFormData(prev => ({ ...prev, precio_total: '0' }));
                return;
            } else {
                setInputErrors(prev => ({ ...prev, hora_fin: '' }));
            }

            const duracionHoras = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
            const precioCalculado = duracionHoras * selectedCentro.precio_por_hora;
            setFormData(prev => ({ ...prev, precio_total: precioCalculado.toString() }));
        } else {
            setFormData(prev => ({ ...prev, precio_total: '0' }));
        }
    }, [formData.hora_inicio, formData.hora_fin, selectedCentro]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['cliente_nombre', 'cliente_email', 'fecha_evento', 'hora_inicio', 'hora_fin', 'centro_evento_id'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (name === 'cliente_email') {
            const emailRegex = /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(value)) errorMessage = 'El formato del correo electrónico no es válido.';
        } else if (name === 'fecha_evento' && value && value < today) {
            errorMessage = 'La fecha del evento no puede ser pasada.';
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar y actualizar errores
        validateField(name, value);

        if (name === 'centro_evento_id') {
            const centro = centros.find(c => c._id === value);
            setSelectedCentro(centro);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        const fieldsToValidate = ['cliente_nombre', 'cliente_email', 'fecha_evento', 'hora_inicio', 'hora_fin', 'centro_evento_id'];
        let formIsValid = true;
        fieldsToValidate.forEach(field => {
            if (!validateField(field, formData[field])) {
                formIsValid = false;
            }
        });
        
        // Validar la lógica de horas nuevamente al enviar
        const [startHour, startMinute] = formData.hora_inicio.split(':').map(Number);
        const [endHour, endMinute] = formData.hora_fin.split(':').map(Number);
        if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
            setInputErrors(prev => ({ ...prev, hora_fin: 'La hora de fin debe ser posterior a la de inicio.' }));
            formIsValid = false;
        }

        if (!formIsValid) {
            alert('Por favor, corrija los errores en el formulario.');
            return;
        }

        onSave({ ...formData, precio_total: Number(formData.precio_total) });
    };

    const isFormValid = Object.values(inputErrors).every(err => err === '') &&
                        formData.cliente_nombre && formData.cliente_email && 
                        formData.fecha_evento && formData.hora_inicio && formData.hora_fin &&
                        formData.centro_evento_id &&
                        (new Date(formData.fecha_evento).toISOString().split('T')[0] >= today) &&
                        ((parseInt(formData.hora_fin.split(':')[0]) * 60 + parseInt(formData.hora_fin.split(':')[1])) > (parseInt(formData.hora_inicio.split(':')[0]) * 60 + parseInt(formData.hora_inicio.split(':')[1])));


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{arriendo ? `Editar Arriendo` : 'Nuevo Arriendo de Salón'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <label>Salón de Eventos</label>
                            <select 
                                name="centro_evento_id" 
                                value={formData.centro_evento_id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                disabled={!!arriendo}
                                className={inputErrors.centro_evento_id ? styles.inputError : (formData.centro_evento_id && !inputErrors.centro_evento_id ? styles.inputSuccess : '')}
                            >
                                <option value="">Seleccione un salón</option>
                                {centros.map(c => <option key={c._id} value={c._id}>{c.nombre} ({c.hotel_id?.nombre}) - ${c.precio_por_hora?.toLocaleString('es-CL')}/hr</option>)}
                            </select>
                            {inputErrors.centro_evento_id && <p className={styles.inputErrorMessage}>{inputErrors.centro_evento_id}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre Cliente/Empresa</label>
                            <input 
                                name="cliente_nombre" 
                                value={formData.cliente_nombre} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.cliente_nombre ? styles.inputError : (formData.cliente_nombre && !inputErrors.cliente_nombre ? styles.inputSuccess : '')}
                            />
                            {inputErrors.cliente_nombre && <p className={styles.inputErrorMessage}>{inputErrors.cliente_nombre}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email de Contacto</label>
                            <input 
                                name="cliente_email" 
                                type="email" 
                                value={formData.cliente_email} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.cliente_email ? styles.inputError : (formData.cliente_email && !inputErrors.cliente_email ? styles.inputSuccess : '')}
                            />
                            {inputErrors.cliente_email && <p className={styles.inputErrorMessage}>{inputErrors.cliente_email}</p>}
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Fecha del Evento</label>
                            <input 
                                name="fecha_evento" 
                                type="date" 
                                value={formData.fecha_evento} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min={today}
                                className={inputErrors.fecha_evento ? styles.inputError : (formData.fecha_evento && !inputErrors.fecha_evento ? styles.inputSuccess : '')}
                            />
                            {inputErrors.fecha_evento && <p className={styles.inputErrorMessage}>{inputErrors.fecha_evento}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hora Inicio</label>
                            <input 
                                name="hora_inicio" 
                                type="time" 
                                value={formData.hora_inicio} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.hora_inicio ? styles.inputError : (formData.hora_inicio && !inputErrors.hora_inicio ? styles.inputSuccess : '')}
                            />
                            {inputErrors.hora_inicio && <p className={styles.inputErrorMessage}>{inputErrors.hora_inicio}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hora Fin</label>
                            <input 
                                name="hora_fin" 
                                type="time" 
                                value={formData.hora_fin} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.hora_fin ? styles.inputError : (formData.hora_fin && !inputErrors.hora_fin ? styles.inputSuccess : '')}
                            />
                            {inputErrors.hora_fin && <p className={styles.inputErrorMessage}>{inputErrors.hora_fin}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Precio Total ($)</label>
                            <input name="precio_total" type="number" value={formData.precio_total} readOnly disabled className={styles.inputDisabled} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange}>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                    <div className={`${styles.buttonGroup} ${styles.fullWidth}`}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton} disabled={!isFormValid}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArriendoEventoModal;