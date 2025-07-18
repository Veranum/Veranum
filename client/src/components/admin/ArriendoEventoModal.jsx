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

    // --- NUEVO ESTADO PARA GUARDAR EL SALÓN SELECCIONADO ---
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
        }
    }, [arriendo, show, centros]);
    
    // --- NUEVO USEEFFECT PARA CALCULAR EL PRECIO AUTOMÁTICAMENTE ---
    useEffect(() => {
        if (formData.hora_inicio && formData.hora_fin && selectedCentro) {
            const [startHour, startMinute] = formData.hora_inicio.split(':').map(Number);
            const [endHour, endMinute] = formData.hora_fin.split(':').map(Number);

            const startTime = startHour + startMinute / 60;
            const endTime = endHour + endMinute / 60;

            if (endTime > startTime) {
                const duracionHoras = endTime - startTime;
                const precioCalculado = duracionHoras * selectedCentro.precio_por_hora;
                setFormData(prev => ({ ...prev, precio_total: precioCalculado.toString() }));
            } else {
                setFormData(prev => ({ ...prev, precio_total: '0' }));
            }
        }
    }, [formData.hora_inicio, formData.hora_fin, selectedCentro]);


    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Si cambia el centro de eventos, actualizamos el estado del salón seleccionado
        if (name === 'centro_evento_id') {
            const centro = centros.find(c => c._id === value);
            setSelectedCentro(centro);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, precio_total: Number(formData.precio_total) });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{arriendo ? `Editar Arriendo` : 'Nuevo Arriendo de Salón'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.fullWidth}>
                            <label>Salón de Eventos</label>
                            <select name="centro_evento_id" value={formData.centro_evento_id} onChange={handleChange} required disabled={!!arriendo}>
                                {centros.map(c => <option key={c._id} value={c._id}>{c.nombre} ({c.hotel_id?.nombre}) - ${c.precio_por_hora?.toLocaleString('es-CL')}/hr</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nombre Cliente/Empresa</label>
                            <input name="cliente_nombre" value={formData.cliente_nombre} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email de Contacto</label>
                            <input name="cliente_email" type="email" value={formData.cliente_email} onChange={handleChange} required />
                        </div>
                        <div className={styles.fullWidth}>
                            <label>Fecha del Evento</label>
                            <input name="fecha_evento" type="date" value={formData.fecha_evento} onChange={handleChange} required min={today} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hora Inicio</label>
                            <input name="hora_inicio" type="time" value={formData.hora_inicio} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Hora Fin</label>
                            <input name="hora_fin" type="time" value={formData.hora_fin} onChange={handleChange} required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Precio Total ($)</label>
                            {/* --- CAMBIO: El campo de precio ahora es de solo lectura --- */}
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
                        <button type="submit" className={styles.saveButton}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArriendoEventoModal;