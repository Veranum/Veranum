// client/src/components/admin/ReservaModal.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, getHabitacionesByHotel, getServiciosByHotelAdmin } from '../../services/adminService';
import { validarCodigoPromocion } from '../../services/reservasService';
import useDebounce from '../../hooks/useDebounce';
import styles from './ReservaModal.module.css';

const ReservaModal = ({ show, onClose, onSave, reserva }) => {
    const [formData, setFormData] = useState({
        cliente_id: '',
        habitacion_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'Confirmado',
        servicios_adicionales: new Set(),
        codigo_promocion: ''
    });

    const [userSearch, setUserSearch] = useState('');
    const [roomSearch, setRoomSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [roomResults, setRoomResults] = useState([]);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isRoomLoading, setIsRoomLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);

    const [priceDetails, setPriceDetails] = useState({
        noches: 0,
        costoAlojamiento: 0,
        costoServicios: 0,
        appliedPromo: null,
        total: 0
    });

    const [promoStatus, setPromoStatus] = useState({ loading: false, message: '', type: '' });

    const debouncedUserSearch = useDebounce(userSearch, 300);
    const debouncedRoomSearch = useDebounce(roomSearch, 300);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (debouncedUserSearch) {
            setIsUserLoading(true);
            getAllUsers(1, 10, { searchTerm: debouncedUserSearch }).then(res => {
                setUserResults(res.data);
            }).finally(() => setIsUserLoading(false));
        } else {
            setUserResults([]);
        }
    }, [debouncedUserSearch]);

    useEffect(() => {
        if (debouncedRoomSearch) {
            setIsRoomLoading(true);
            getHabitacionesByHotel('', debouncedRoomSearch).then(res => {
                setRoomResults(res.data);
            }).finally(() => setIsRoomLoading(false));
        } else {
            setRoomResults([]);
        }
    }, [debouncedRoomSearch]);

    useEffect(() => {
        if (selectedRoom?.hotel_id?._id) {
            getServiciosByHotelAdmin(selectedRoom.hotel_id._id).then(res => {
                setAvailableServices(res.data);
            });
        } else {
            setAvailableServices([]);
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (reserva && show) {
            const habitacionData = reserva.habitacion_id;
            setSelectedRoom(habitacionData);
            setUserSearch(`${reserva.cliente_id?.nombre} (${reserva.cliente_id?._id})`);
            setRoomSearch(habitacionData ? `${habitacionData.nombre} (N°${habitacionData._id})` : '');
            setFormData({
                cliente_id: reserva.cliente_id?._id || '',
                habitacion_id: habitacionData?._id || '',
                fecha_inicio: new Date(reserva.fecha_inicio).toISOString().split('T')[0],
                fecha_fin: new Date(reserva.fecha_fin).toISOString().split('T')[0],
                estado: reserva.estado || 'Confirmado',
                servicios_adicionales: new Set(reserva.servicios_adicionales?.map(s => s._id) || []),
                codigo_promocion: ''
            });
        }
    }, [reserva, show]);

    useEffect(() => {
        if (formData.fecha_inicio && formData.fecha_fin && selectedRoom) {
            const d1 = new Date(formData.fecha_inicio);
            const d2 = new Date(formData.fecha_fin);
            if (d2 > d1) {
                const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
                setPriceDetails(prev => ({ ...prev, noches: diff, costoAlojamiento: diff * (selectedRoom.precio || 0) }));
                return;
            }
        }
        setPriceDetails(prev => ({ ...prev, noches: 0, costoAlojamiento: 0 }));
    }, [formData.fecha_inicio, formData.fecha_fin, selectedRoom]);

    useEffect(() => {
        if (priceDetails.noches > 0 && availableServices.length > 0) {
            let totalDiario = 0;
            formData.servicios_adicionales.forEach(id => {
                const servicio = availableServices.find(s => s._id === id);
                if (servicio) totalDiario += servicio.precio_diario;
            });
            setPriceDetails(prev => ({ ...prev, costoServicios: totalDiario * prev.noches }));
        } else {
            setPriceDetails(prev => ({ ...prev, costoServicios: 0 }));
        }
    }, [formData.servicios_adicionales, priceDetails.noches, availableServices]);

    useEffect(() => {
        const subtotal = priceDetails.costoAlojamiento + priceDetails.costoServicios;
        const discountPercentage = priceDetails.appliedPromo?.porcentaje_descuento || 0;
        const descuento = subtotal * (discountPercentage / 100);
        const total = subtotal - descuento;
        setPriceDetails(prev => ({ ...prev, total }));
    }, [priceDetails.costoAlojamiento, priceDetails.costoServicios, priceDetails.appliedPromo]);

    if (!show) return null;

    const handleApplyPromo = async () => {
        if (!formData.codigo_promocion) return;
        setPromoStatus({ loading: true, message: '', type: '' });
        try {
            const res = await validarCodigoPromocion(formData.codigo_promocion);
            setPriceDetails(prev => ({ ...prev, appliedPromo: res.data }));
            setPromoStatus({ loading: false, message: '¡Código aplicado!', type: 'success' });
        } catch (err) {
            setPriceDetails(prev => ({ ...prev, appliedPromo: null }));
            setPromoStatus({ loading: false, message: 'Código no válido o expirado.', type: 'error' });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'codigo_promocion') {
            setPromoStatus({ loading: false, message: '', type: '' });
            setPriceDetails(prev => ({...prev, appliedPromo: null}));
        }
    };

    const handleSelectUser = (user) => {
        setFormData({ ...formData, cliente_id: user._id });
        setUserSearch(`${user.nombre} (${user._id})`);
        setUserResults([]);
    };
    
    const handleSelectRoom = (room) => {
        setFormData({ ...formData, habitacion_id: room._id.toString(), servicios_adicionales: new Set() });
        setSelectedRoom(room);
        setRoomSearch(`${room.nombre} (N°${room._id})`);
        setRoomResults([]);
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            const newServices = new Set(prev.servicios_adicionales);
            if (newServices.has(serviceId)) {
                newServices.delete(serviceId);
            } else {
                newServices.add(serviceId);
            }
            return { ...prev, servicios_adicionales: newServices };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData, servicios_adicionales: Array.from(formData.servicios_adicionales) };
        onSave(dataToSave);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{reserva ? `Editar Reserva Nº ${reserva.numeroReserva}` : 'Crear Nueva Reserva'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Buscar Cliente por Nombre o RUN</label>
                            <div className={styles.searchableWrapper}>
                                <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Escribe para buscar..." required />
                                {isUserLoading && <div className={styles.spinner}></div>}
                                {userResults.length > 0 && (
                                    <ul className={styles.searchResults}>
                                        {userResults.map(user => <li key={user._id} onClick={() => handleSelectUser(user)}>{user.nombre} ({user._id})</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label>Buscar Habitación por Nombre o N°</label>
                            <div className={styles.searchableWrapper}>
                                <input type="text" value={roomSearch} onChange={(e) => setRoomSearch(e.target.value)} placeholder="Escribe para buscar..." required />
                                {isRoomLoading && <div className={styles.spinner}></div>}
                                {roomResults.length > 0 && (
                                    <ul className={styles.searchResults}>
                                        {roomResults.map(room => <li key={room._id} onClick={() => handleSelectRoom(room)}>{room.nombre} (Disponibles hoy: {room.inventario?.disponibles || 'N/A'})</li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                        
                        <div className={styles.inputGroup}>
                            <label>Fecha de Check-in</label>
                            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required min={today} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha de Check-out</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required min={formData.fecha_inicio || today} />
                        </div>
                        
                        {availableServices.length > 0 && (
                            <div className={styles.fullWidth}>
                                <label>Servicios Adicionales</label>
                                <div className={styles.checkboxGroup}>
                                    {availableServices.map(service => (
                                        <label key={service._id} className={styles.checkboxLabel}>
                                            <input type="checkbox" checked={formData.servicios_adicionales.has(service._id)} onChange={() => handleServiceToggle(service._id)} />
                                            {service.nombre} (+${service.precio_diario.toLocaleString('es-CL')}/día)
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className={styles.promoContainer}>
                            <div className={styles.inputGroup} style={{flexGrow: 1}}>
                                <label>Código de Promoción (Opcional)</label>
                                <input type="text" name="codigo_promocion" value={formData.codigo_promocion} onChange={handleChange} />
                            </div>
                            <button type="button" onClick={handleApplyPromo} className={styles.applyButton} disabled={promoStatus.loading}>
                                {promoStatus.loading ? '...' : 'Aplicar'}
                            </button>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange}>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                        
                        {promoStatus.message && (
                            <div className={styles.fullWidth} style={{ marginTop: '-1rem' }}>
                                <p className={`${styles.promoMessage} ${styles[promoStatus.type]}`}>{promoStatus.message}</p>
                            </div>
                        )}
                    </div>

                    {priceDetails.noches > 0 && (
                        <div className={styles.priceSummary}>
                            <h3 className={styles.summaryTitle}>Resumen de Costos</h3>
                            <div className={styles.priceRow}>
                                <span>Alojamiento ({priceDetails.noches} {priceDetails.noches > 1 ? 'noches' : 'noche'})</span>
                                <span>${priceDetails.costoAlojamiento.toLocaleString('es-CL')}</span>
                            </div>
                            {priceDetails.costoServicios > 0 && (
                                <div className={styles.priceRow}>
                                    <span>Servicios Adicionales</span>
                                    <span>+ ${priceDetails.costoServicios.toLocaleString('es-CL')}</span>
                                </div>
                            )}
                            {priceDetails.appliedPromo && (
                                <div className={`${styles.priceRow} ${styles.discountRow}`}>
                                    <span>Descuento ({priceDetails.appliedPromo.porcentaje_descuento}%)</span>
                                    <span>- ${Math.round((priceDetails.costoAlojamiento + priceDetails.costoServicios) * (priceDetails.appliedPromo.porcentaje_descuento / 100)).toLocaleString('es-CL')}</span>
                                </div>
                            )}
                            <hr className={styles.divider} />
                            <div className={`${styles.priceRow} ${styles.totalRow}`}>
                                <span>Total Estimado</span>
                                <span>${Math.round(priceDetails.total).toLocaleString('es-CL')}</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.saveButton}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservaModal;