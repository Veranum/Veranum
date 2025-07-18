// client/src/pages/ReservationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styles from './ReservarPage.module.css';
import { createReservation, validarCodigoPromocion, getServiciosByHotel, getAvailableRooms } from '../services/reservasService';
import Notification from '../components/common/Notification';

const getRoomImageUrl = (roomName) => {
    const name = roomName ? roomName.toLowerCase() : '';
    if (name.includes('doble')) return 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80';
    if (name.includes('individual')) return 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80';
    if (name.includes('matrimonial')) return 'https://images.unsplash.com/photo-1590490359853-392136724f9c?w=800&q=80';
    return `https://placehold.co/600x400/005f73/ffffff?text=${(roomName || '').replace(' ', '+')}`;
};

const ReservationsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { preselectedRoom } = location.state || {};

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [noches, setNoches] = useState(0);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState(new Set());
    const [costoAlojamiento, setCostoAlojamiento] = useState(0);
    const [costoServicios, setCostoServicios] = useState(0);
    const [costoTotal, setCostoTotal] = useState(0);
    const [descuento, setDescuento] = useState(0);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [availabilityMessage, setAvailabilityMessage] = useState('');

    useEffect(() => {
        // --- CORRECCIÓN: Se pasa el ID del hotel (preselectedRoom.hotel_id._id), no el objeto completo ---
        if (preselectedRoom?.hotel_id?._id) {
            getServiciosByHotel(preselectedRoom.hotel_id._id).then(response => {
                if (response.data) setServiciosDisponibles(response.data);
            }).catch(err => console.error("Error al cargar servicios:", err));
        }
    }, [preselectedRoom]);

    useEffect(() => {
        if (checkIn && checkOut) {
            const d1 = new Date(checkIn), d2 = new Date(checkOut);
            if (d2 > d1) {
                const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
                setNoches(diff);
                setCostoAlojamiento(diff * (preselectedRoom?.precio || 0));
                return;
            }
        }
        setNoches(0);
        setCostoAlojamiento(0);
    }, [checkIn, checkOut, preselectedRoom]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (checkIn && checkOut && preselectedRoom?._id) {
                const d1 = new Date(checkIn);
                const d2 = new Date(checkOut);

                if (d2 <= d1) {
                    setIsAvailable(false);
                    setAvailabilityMessage('');
                    return;
                }

                setIsChecking(true);
                setAvailabilityMessage('');
                setError('');
                try {
                    // --- CORRECCIÓN: Se pasa el ID del hotel (preselectedRoom.hotel_id._id), no el objeto completo ---
                    const hotelId = preselectedRoom.hotel_id?._id;
                    const response = await getAvailableRooms(checkIn, checkOut, hotelId);
                    
                    const roomIsAvailable = response.data.some(room => room._id === preselectedRoom._id);
                    
                    setIsAvailable(roomIsAvailable);
                    if (!roomIsAvailable) {
                        setAvailabilityMessage('Esta habitación no está disponible para las fechas seleccionadas.');
                    }
                } catch (err) {
                    console.error("Error al verificar disponibilidad:", err);
                    setAvailabilityMessage('No se pudo verificar la disponibilidad. Inténtalo de nuevo.');
                    setIsAvailable(false);
                } finally {
                    setIsChecking(false);
                }
            }
        };

        const timer = setTimeout(() => {
            checkAvailability();
        }, 500);

        return () => clearTimeout(timer);
    }, [checkIn, checkOut, preselectedRoom]);


    useEffect(() => {
        let totalDiario = 0;
        serviciosSeleccionados.forEach(id => {
            const servicio = serviciosDisponibles.find(s => s._id === id);
            if (servicio) totalDiario += servicio.precio_diario;
        });
        setCostoServicios(totalDiario * noches);
    }, [serviciosSeleccionados, noches, serviciosDisponibles]);

    useEffect(() => {
        const subtotal = costoAlojamiento + costoServicios;
        const discountAmount = appliedPromo ? subtotal * (appliedPromo.porcentaje_descuento / 100) : 0;
        setDescuento(discountAmount);
        setCostoTotal(subtotal - discountAmount);
    }, [costoAlojamiento, costoServicios, appliedPromo]);

    const handleServicioChange = (id) => {
        setServiciosSeleccionados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleApplyPromo = async () => {
        if (!promoCodeInput) return;
        setPromoError(''); setAppliedPromo(null);
        try {
            const res = await validarCodigoPromocion(promoCodeInput);
            setAppliedPromo(res.data);
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Error al validar.');
        }
    };

    const handleConfirm = async () => {
        if (noches <= 0) {
            setError('Por favor, selecciona un rango de fechas válido.');
            return;
        }
        if (!isAvailable) {
            setError('No puedes reservar porque la habitación no está disponible en las fechas elegidas.');
            return;
        }
        setLoading(true); setError('');
        try {
            await createReservation({
                habitacion_id: preselectedRoom._id,
                fecha_inicio: checkIn,
                fecha_fin: checkOut,
                servicios_adicionales: Array.from(serviciosSeleccionados),
                codigo_promocion: appliedPromo ? appliedPromo.codigo : undefined
            });
            setNotification({ show: true, message: '¡Reserva confirmada con éxito!', type: 'success' });
            setTimeout(() => navigate('/mis-reservas'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo completar la reserva.');
        } finally {
            setLoading(false);
        }
    };

    if (!preselectedRoom) {
        return <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}><h1>Error</h1><p>No has seleccionado una habitación. <Link to="/habitaciones">Vuelve para elegir una</Link>.</p></div>;
    }

    return (
        <>
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })}/>
            <div className={styles.bookingPageLayout}>
                <div className={styles.bookingCard}>
                    <div className={styles.stepHeader}><span className={styles.stepNumber}>1</span><h2>Confirma tu Habitación</h2></div>
                    <div className={styles.roomInfo}>
                        <img src={preselectedRoom.imagenUrl || getRoomImageUrl(preselectedRoom.nombre)} alt={preselectedRoom.nombre} className={styles.roomImage} />
                        <div className={styles.roomDetails}>
                            <h3>{preselectedRoom.nombre}</h3>
                            <p>Capacidad para {preselectedRoom.capacidad} personas.</p>
                        </div>
                    </div>
                </div>

                <div className={styles.bookingCard}>
                    <div className={styles.stepHeader}><span className={styles.stepNumber}>2</span><h2>Elige tus Fechas</h2></div>
                    <div className={styles.datePickerGroup}>
                        <div className={styles.dateInput}><label htmlFor="checkin">Check-in</label><input type="date" id="checkin" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]}/></div>
                        <div className={styles.arrow}>→</div>
                        <div className={styles.dateInput}><label htmlFor="checkout">Check-out</label><input type="date" id="checkout" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn} disabled={!checkIn} /></div>
                    </div>
                    {isChecking && <p style={{textAlign: 'center', marginTop: '1rem'}}>Verificando disponibilidad...</p>}
                    {availabilityMessage && <p className={styles.errorMessage} style={{marginTop: '1rem'}}>{availabilityMessage}</p>}
                </div>
                
                {serviciosDisponibles.length > 0 && (
                    <div className={styles.bookingCard}>
                        <div className={styles.stepHeader}><span className={styles.stepNumber}>3</span><h2>Añade Servicios Adicionales</h2></div>
                        <div className={styles.servicesList}>
                            {serviciosDisponibles.map(s => (
                                <label key={s._id} className={styles.serviceItem}>
                                    <input type="checkbox" checked={serviciosSeleccionados.has(s._id)} onChange={() => handleServicioChange(s._id)} />
                                    <span className={styles.serviceInfo}>{s.nombre}</span>
                                    <span className={styles.servicePrice}>+${s.precio_diario.toLocaleString('es-CL')} / día</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.bookingCard}>
                    <div className={styles.stepHeader}><span className={styles.stepNumber}>4</span><h2>Código de Promoción</h2></div>
                    <div className={styles.promoInputGroup}>
                        <input type="text" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} placeholder="Escribe tu código aquí" />
                        <button onClick={handleApplyPromo}>Aplicar</button>
                    </div>
                    {promoError && <p className={styles.promoError}>{promoError}</p>}
                    {appliedPromo && <p className={styles.promoSuccess}>¡Código "{appliedPromo.codigo}" aplicado! (-{appliedPromo.porcentaje_descuento}%)</p>}
                </div>

                {noches > 0 && (
                    <div className={`${styles.bookingCard} ${styles.priceSummary}`}>
                        <div className={styles.stepHeader}><span className={styles.stepNumber}>5</span><h2>Resumen y Pago</h2></div>
                        <div className={styles.priceRow}><span>Alojamiento ({noches} {noches > 1 ? 'noches' : 'noche'})</span><span>${costoAlojamiento.toLocaleString('es-CL')}</span></div>
                        {costoServicios > 0 && <div className={styles.priceRow}><span>Servicios adicionales</span><span>${costoServicios.toLocaleString('es-CL')}</span></div>}
                        {descuento > 0 && appliedPromo && <div className={`${styles.priceRow} ${styles.discountRow}`}><span>Descuento ({appliedPromo.porcentaje_descuento}%)</span><span>- ${Math.round(descuento).toLocaleString('es-CL')}</span></div>}
                        <hr className={styles.divider} />
                        <div className={`${styles.priceRow} ${styles.totalRow}`}><span>Total a Pagar</span><span>${Math.round(costoTotal).toLocaleString('es-CL')}</span></div>
                    </div>
                )}
                
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button 
                    onClick={handleConfirm} 
                    disabled={loading || noches <= 0 || isChecking || !isAvailable}
                    className={styles.confirmButton}
                >
                    {loading ? 'Procesando...' : 'Confirmar y Reservar'}
                </button>
            </div>
        </>
    );
};

export default ReservationsPage;