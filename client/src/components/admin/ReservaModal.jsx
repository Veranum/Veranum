// client/src/components/admin/ReservaModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getHabitacionesByHotel, getServiciosByHotelAdmin } from '../../services/adminService';
import { validarCodigoPromocion } from '../../services/reservasService'; // Correct import name
import useDebounce from '../../hooks/useDebounce';
import styles from './ReservaModal.module.css';
import ModalStepper from '../common/ModalStepper';


const ReservaModal = ({ show, onClose, onSave, reserva }) => {
    // Estado para controlar los pasos del modal
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Estado del formulario
    const [formData, setFormData] = useState({
        cliente_id: '',
        habitacion_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'Confirmado',
        servicios_adicionales: new Set(),
        codigo_promocion: ''
    });

    // Estados para la búsqueda y selección de usuario/habitación
    const [userSearch, setUserSearch] = useState('');
    const [roomSearch, setRoomSearch] = useState('');
    const [userResults, setUserResults] = useState([]); // Inicializar con array vacío
    const [roomResults, setRoomResults] = useState([]); // Inicializar con array vacío
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isRoomLoading, setIsRoomLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);

    // Estado para detalles de precios (incluye noches y costoAlojamiento)
    const [priceDetails, setPriceDetails] = useState({
        noches: 0,
        costoAlojamiento: 0,
        costoServicios: 0,
        appliedPromo: null,
        total: 0
    });

    // Estado para la promoción
    const [promoStatus, setPromoStatus] = useState({ loading: false, message: '', type: '' });
    // Estado para errores de validación de campos
    const [inputErrors, setInputErrors] = useState({});

    // Hooks para debounce en búsquedas
    const debouncedUserSearch = useDebounce(userSearch, 300);
    const debouncedRoomSearch = useDebounce(roomSearch, 300);
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // Función de validación de campos (con useCallback para optimización)
    const validateField = useCallback((name, value) => {
        let errorMessage = '';
        if (!value && ['cliente_id', 'habitacion_id', 'fecha_inicio', 'fecha_fin', 'estado'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (name === 'fecha_inicio' && value < today) {
            errorMessage = 'La fecha de check-in no puede ser pasada.';
        } else if (name === 'fecha_fin' && formData.fecha_inicio && value <= formData.fecha_inicio) { // MODIFICADO: changed to strictly greater than for at least one night
            errorMessage = 'La fecha de check-out debe ser posterior a la de check-in.';
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    }, [formData.fecha_inicio, today]); // Depende de formData.fecha_inicio y today

    // Efecto para buscar usuarios cuando cambia la búsqueda
    useEffect(() => {
        if (debouncedUserSearch) {
            setIsUserLoading(true);
            getAllUsers(1, 10, { searchTerm: debouncedUserSearch }).then(res => {
                setUserResults(res.data || []); // Ensure res.data is an array or default to empty
            }).finally(() => setIsUserLoading(false));
        } else {
            setUserResults([]);
        }
    }, [debouncedUserSearch]); // REMOVED setUserResults from dependencies

    // Efecto para buscar habitaciones cuando cambia la búsqueda
    useEffect(() => {
        if (debouncedRoomSearch) {
            setIsRoomLoading(true);
            // `getHabitacionesByHotel` en adminService.js acepta (hotelId, searchTerm)
            getHabitacionesByHotel('', debouncedRoomSearch).then(res => {
                setRoomResults(res.data || []); // Ensure res.data is an array or default to empty
            }).finally(() => setIsRoomLoading(false));
        } else {
            setRoomResults([]);
        }
    }, [debouncedRoomSearch]); // REMOVED setRoomResults from dependencies

    // Efecto para obtener servicios disponibles según el hotel de la habitación seleccionada
    useEffect(() => {
        if (selectedRoom?.hotel_id?._id) {
            getServiciosByHotelAdmin(selectedRoom.hotel_id._id).then(res => {
                setAvailableServices(res.data || []); // Ensure res.data is an array or default to empty
            }).catch(err => {
                console.error("Error fetching services for hotel:", err);
                setAvailableServices([]); // Limpiar servicios en caso de error
            });
        } else {
            setAvailableServices([]);
        }
    }, [selectedRoom]);

    // Efecto para inicializar el formulario si se está editando una reserva existente
    useEffect(() => {
        if (show) { // Se activa cuando el modal se muestra
            if (reserva) { // Modo edición
                // Asigna los datos de la reserva existente al estado del formulario
                setSelectedRoom(reserva.habitacion_id); // Asigna el objeto completo de habitación
                setSelectedUser(reserva.cliente_id); // Asigna el objeto completo de usuario
                setUserSearch(`${reserva.cliente_id?.nombre || ''} (${reserva.cliente_id?._id || ''})`);
                setRoomSearch(reserva.habitacion_id ? `${reserva.habitacion_id.nombre || ''} (N°${reserva.habitacion_id._id || ''})` : '');
                setFormData({
                    cliente_id: reserva.cliente_id?._id || '',
                    habitacion_id: reserva.habitacion_id?._id || '',
                    fecha_inicio: new Date(reserva.fecha_inicio).toISOString().split('T')[0],
                    fecha_fin: new Date(reserva.fecha_fin).toISOString().split('T')[0],
                    estado: reserva.estado || 'Confirmado',
                    // Asegúrate de que los servicios_adicionales sean un Set
                    // FIX: Asegurar que servicios_adicionales sea un array antes de mapear
                    servicios_adicionales: new Set(Array.isArray(reserva.servicios_adicionales) ? reserva.servicios_adicionales.map(s => s._id) : []),
                    codigo_promocion: '' // No se precarga el código de promoción en edición por seguridad/simplicidad
                });
                setPriceDetails(prev => ({
                    ...prev,
                    noches: Math.ceil((new Date(reserva.fecha_fin) - new Date(reserva.fecha_inicio)) / (1000 * 60 * 60 * 24)),
                    costoAlojamiento: reserva.precio_final, // Asumiendo que precio_final ya incluye el costo de alojamiento inicial
                    costoServicios: 0, // Se recalculará si hay servicios adicionales seleccionados
                    appliedPromo: null,
                    total: reserva.precio_final // Se recalculará si se aplica una nueva promo o servicios
                }));
                setInputErrors({});
                setCurrentStep(1); // Siempre empieza en el primer paso al abrir
            } else { // Modo creación de nueva reserva
                // Resetea el formulario a sus valores iniciales
                setFormData({
                    cliente_id: '', habitacion_id: '', fecha_inicio: '', fecha_fin: '',
                    estado: 'Confirmado', servicios_adicionales: new Set(), codigo_promocion: ''
                });
                setSelectedUser(null); setSelectedRoom(null);
                setUserSearch(''); setRoomSearch('');
                setAvailableServices([]);
                setPriceDetails({ noches: 0, costoAlojamiento: 0, costoServicios: 0, appliedPromo: null, total: 0 });
                setPromoStatus({ loading: false, message: '', type: '' });
                setInputErrors({});
                setCurrentStep(1); // Siempre empieza en el primer paso al abrir
            }
        }
    }, [reserva, show]); // Dependencias: reserva y show para re-inicializar el modal

    // Efecto para calcular noches y costo de alojamiento cuando cambian las fechas o la habitación
    useEffect(() => {
        if (formData.fecha_inicio && formData.fecha_fin && selectedRoom) {
            const d1 = new Date(formData.fecha_inicio);
            const d2 = new Date(formData.fecha_fin);
            if (d2 > d1) { // MODIFICADO: ensure d2 is strictly greater than d1 for at least one night
                const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
                // Actualiza directamente priceDetails
                setPriceDetails(prev => ({
                    ...prev,
                    noches: diff,
                    costoAlojamiento: diff * (selectedRoom.precio || 0)
                }));
                return;
            }
        }
        // Resetea si las fechas no son válidas
        setPriceDetails(prev => ({ ...prev, noches: 0, costoAlojamiento: 0 }));
    }, [formData.fecha_inicio, formData.fecha_fin, selectedRoom]); // Depende de las fechas y la habitación seleccionada

    // Efecto para calcular el costo de servicios adicionales
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
    }, [formData.servicios_adicionales, priceDetails.noches, availableServices]); // Depende de servicios seleccionados, noches y servicios disponibles

    // Efecto para calcular el costo total final (incluyendo promociones)
    useEffect(() => {
        const subtotal = priceDetails.costoAlojamiento + priceDetails.costoServicios;
        const discountPercentage = priceDetails.appliedPromo?.porcentaje_descuento || 0;
        const descuento = subtotal * (discountPercentage / 100);
        const total = subtotal - descuento;
        setPriceDetails(prev => ({ ...prev, total }));
    }, [priceDetails.costoAlojamiento, priceDetails.costoServicios, priceDetails.appliedPromo]); // Depende de costos de alojamiento, servicios y promoción aplicada

    // Si el modal no debe mostrarse, retorna null
    if (!show) return null;

    // Manejador para aplicar código de promoción
    const handleApplyPromo = async () => {
        if (!formData.codigo_promocion) {
            setPromoStatus({ loading: false, message: 'Ingresa un código de promoción.', type: 'error' });
            setPriceDetails(prev => ({ ...prev, appliedPromo: null }));
            return;
        }
        setPromoStatus({ loading: true, message: '', type: '' });
        try {
            // Corrected function call: validarCodigoPromocion
            const res = await validarCodigoPromocion(formData.codigo_promocion);
            setPriceDetails(prev => ({ ...prev, appliedPromo: res.data }));
            setPromoStatus({ loading: false, message: '¡Código aplicado!', type: 'success' });
        } catch (err) {
            setPromoStatus({ loading: false, message: err.response?.data?.message || 'Error al validar.' , type: 'error' });
        }
    };

    // Manejador genérico para cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value); // Valida el campo al cambiar
        if (name === 'codigo_promocion') {
            setPromoStatus({ loading: false, message: '', type: '' });
            setPriceDetails(prev => ({ ...prev, appliedPromo: null })); // Limpia la promo aplicada si cambia el código
        }
    };

    // Manejador para la validación al perder el foco (blur)
    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    // Manejador cuando se selecciona un usuario de la lista de búsqueda
    const handleSelectUser = (user) => {
        setFormData({ ...formData, cliente_id: user._id });
        setSelectedUser(user);
        setUserSearch(`${user.nombre} (${user._id})`);
        setUserResults([]); // Limpia los resultados de búsqueda después de seleccionar
        validateField('cliente_id', user._id); // Valida el campo cliente_id
    };

    // Manejador cuando se selecciona una habitación de la lista de búsqueda
    const handleSelectRoom = (room) => {
        setFormData({ ...formData, habitacion_id: room._id.toString(), servicios_adicionales: new Set() });
        setSelectedRoom(room);
        setRoomSearch(`${room.nombre} (N°${room._id})`);
        setRoomResults([]); // Limpia los resultados de búsqueda después de seleccionar
        validateField('habitacion_id', room._id.toString()); // Valida el campo habitacion_id
    };

    // Manejador para añadir/quitar servicios adicionales
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

    // Lógica para avanzar al siguiente paso del formulario
    const handleNextStep = () => {
        let isValid = true;
        if (currentStep === 1) {
            // Valida que cliente y habitación estén seleccionados y sus campos no tengan errores de validación
            isValid = selectedUser && selectedRoom &&
                      inputErrors.cliente_id === '' &&
                      inputErrors.habitacion_id === '';
            if (!isValid) {
                alert('Por favor, selecciona un cliente y una habitación para continuar.');
            }
        } else if (currentStep === 2) {
            // Valida que las fechas sean válidas y que haya al menos una noche
            // MODIFICADO: Validation now explicitly checks for noches > 0 for valid date range
            isValid = formData.fecha_inicio && formData.fecha_fin && priceDetails.noches > 0 &&
                      inputErrors.fecha_inicio === '' &&
                      inputErrors.fecha_fin === '';
            if (!isValid) {
                alert('Por favor, selecciona fechas válidas para al menos una noche.');
            }
        }

        if (isValid && currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // Lógica para retroceder al paso anterior del formulario
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Manejador para el envío final del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Realiza una validación final de todos los campos obligatorios antes de guardar
        const fieldsToValidate = ['cliente_id', 'habitacion_id', 'fecha_inicio', 'fecha_fin', 'estado'];
        let formIsValid = true;
        fieldsToValidate.forEach(field => {
            // Asegura que los campos estén presentes y sin errores de validación individual
            if (!formData[field] || inputErrors[field]) {
                formIsValid = false;
            }
        });

        // Asegura que se haya seleccionado al menos una noche
        if (priceDetails.noches <= 0) {
            formIsValid = false;
        }

        if (!formIsValid) {
            alert('Por favor, complete todos los campos requeridos correctamente y asegúrate de seleccionar fechas válidas antes de guardar.');
            return;
        }

        // Prepara los datos para guardar, convirtiendo el Set de servicios a un Array
        const dataToSave = { ...formData, servicios_adicionales: Array.from(formData.servicios_adicionales) };
        onSave(dataToSave); // Llama a la función onSave pasada por props
    };

    // Determina si el botón final de "Guardar" debe estar deshabilitado
    const isFormCompleteAndValid = Object.values(inputErrors).every(err => err === '') &&
                                   formData.cliente_id && formData.habitacion_id &&
                                   formData.fecha_inicio && formData.fecha_fin && formData.estado &&
                                   priceDetails.noches > 0; // Se habilita solo si todas las condiciones se cumplen

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{reserva ? `Editar Reserva Nº ${reserva.numeroReserva}` : 'Crear Nueva Reserva'}</h2>

                {/* Componente ModalStepper para la navegación por pasos */}
                <ModalStepper
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onStepChange={setCurrentStep}
                />

                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <div className={styles.formSection}>
                            <h3>1. Cliente y Habitación</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Buscar Cliente por Nombre o RUN</label>
                                    <div className={styles.searchableWrapper}>
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            onBlur={handleBlur}
                                            placeholder="Escribe para buscar..."
                                            // Aplica la clase de error si el campo tiene error, o success si está válido
                                            className={inputErrors.cliente_id ? styles.inputError : (selectedUser && !inputErrors.cliente_id ? styles.inputSuccess : '')}
                                        />
                                        {isUserLoading && <div className={styles.spinner}></div>}
                                        {userResults.length > 0 && (
                                            <ul className={styles.searchResults}>
                                                {userResults.map(user => <li key={user._id} onClick={() => handleSelectUser(user)}>{user.nombre} ({user._id})</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    {/* Muestra mensaje de error si existe */}
                                    {inputErrors.cliente_id && <p className={styles.inputErrorMessage}>{inputErrors.cliente_id}</p>}
                                    {selectedUser && <p className={styles.selectedItem}>Seleccionado: {selectedUser.nombre} ({selectedUser._id})</p>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Buscar Habitación por Nombre o N°</label>
                                    <div className={styles.searchableWrapper}>
                                        <input
                                            type="text"
                                            value={roomSearch}
                                            onChange={(e) => setRoomSearch(e.target.value)}
                                            onBlur={handleBlur}
                                            placeholder="Escribe para buscar..."
                                            className={inputErrors.habitacion_id ? styles.inputError : (selectedRoom && !inputErrors.habitacion_id ? styles.inputSuccess : '')}
                                        />
                                        {isRoomLoading && <div className={styles.spinner}></div>}
                                        {roomResults.length > 0 && (
                                            <ul className={styles.searchResults}>
                                                {roomResults.map(room => <li key={room._id} onClick={() => handleSelectRoom(room)}>{room.nombre} (N°{room._id}) - Disp: {room.inventario?.disponibles || 'N/A'}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    {inputErrors.habitacion_id && <p className={styles.inputErrorMessage}>{inputErrors.habitacion_id}</p>}
                                    {selectedRoom && <p className={styles.selectedItem}>Seleccionado: {selectedRoom.nombre} (N°{selectedRoom._id})</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className={styles.formSection}>
                            <h3>2. Fechas y Servicios Adicionales</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Fecha de Check-in</label>
                                    <input
                                        type="date"
                                        name="fecha_inicio"
                                        value={formData.fecha_inicio}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        min={today} // No permite seleccionar fechas pasadas
                                        max={formData.fecha_fin || undefined} // No permite seleccionar una fecha de check-in posterior a la de check-out
                                        disabled={!!formData.fecha_fin} // Deshabilita si ya hay una fecha de
                                        check-out seleccionada
                                        
                                        className={inputErrors.fecha_inicio ? styles.inputError : (formData.fecha_inicio && !inputErrors.fecha_inicio ? styles.inputSuccess : '')}
                                    />
                                    {inputErrors.fecha_inicio && <p className={styles.inputErrorMessage}>{inputErrors.fecha_inicio}</p>}
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Fecha de Check-out</label>
                                    <input
                                        type="date"
                                        name="fecha_fin"
                                        value={formData.fecha_fin}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        min={formData.fecha_inicio || today}
                                        disabled={!formData.fecha_inicio}
                                        className={inputErrors.fecha_fin ? styles.inputError : (formData.fecha_fin && !inputErrors.fecha_fin ? styles.inputSuccess : '')}
                                    />
                                    {inputErrors.fecha_fin && <p className={styles.inputErrorMessage}>{inputErrors.fecha_fin}</p>}
                                </div>

                                {selectedRoom?.hotel_id?._id && availableServices.length > 0 && (
                                    <div className={styles.fullWidth}>
                                        <label>Servicios Adicionales (Hotel: {selectedRoom.hotel_id.nombre})</label>
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
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className={styles.formSection}>
                            <h3>3. Promoción y Resumen Final</h3>
                            <div className={styles.promoAndStatusContainer}> {/* Apply the new container class here */}
                                <div className={styles.formGrid}> {/* ADDED THIS WRAPPER */}
                                    <div className={styles.promoContainer}>
                                        <div className={styles.inputGroup} style={{ flexGrow: 1 }}>
                                            <label>Código de Promoción</label>
                                            <input
                                                type="text"
                                                name="codigo_promocion"
                                                value={formData.codigo_promocion}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                        <button type="button" onClick={handleApplyPromo} className={styles.applyButton} disabled={promoStatus.loading}>
                                            {promoStatus.loading ? '...' : 'Aplicar'}
                                        </button>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Estado de Reserva</label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={inputErrors.estado ? styles.inputError : ''}
                                        >
                                            <option value="Confirmado">Confirmado</option>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                        {inputErrors.estado && <p className={styles.inputErrorMessage}>{inputErrors.estado}</p>}
                                    </div>
                                </div> {/* END OF ADDED WRAPPER */}

                                {/* Modificación aquí: Envoltorio del mensaje de promoción */}
                                {promoStatus.message && (
                                    // Make sure promoMessageWrapper spans full width of the grid
                                    <div className={`${styles.promoMessageWrapper} ${styles.fullWidth}`}> {/* CLASE AÑADIDA */}
                                        <p className={`${styles.promoMessage} ${styles[promoStatus.type]}`}>{promoStatus.message}</p>
                                    </div>
                                )}
                            </div>

                            {priceDetails.noches > 0 && (
                                <div className={styles.priceSummary}>
                                    <h3 className={styles.summaryTitle}>Resumen de Costos</h3>
                                    <div className={styles.priceRow}>
                                        <span>Alojamiento ({priceDetails.noches} {priceDetails.noches === 1 ? 'noche' : 'noches'})</span>
                                        <span>${priceDetails.costoAlojamiento.toLocaleString('es-CL')}</span>
                                    </div>
                                    {priceDetails.costoServicios > 0 && (
                                        <div className={`${styles.priceRow}`}>
                                            <span>Servicios Adicionales</span>
                                            <span>+ ${priceDetails.costoServicios.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                    {priceDetails.appliedPromo && (
                                        <div className={`${styles.priceRow} ${styles.discountRow}`}>
                                            <span>Descuento ({priceDetails.appliedPromo.porcentaje_descuento}%)</span>
                                            {/* CORRECCIÓN AQUÍ: Cambiado 'costoAlojamento' a 'costoAlojamiento' */}
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

                        </div>
                    )}

                    {/* --- Navegación entre pasos y botones de acción --- */}
                    <div className={styles.modalFooter}>
                        {currentStep > 1 && (
                            <button type="button" onClick={handlePrevStep} className={styles.prevButton}>
                                Anterior
                            </button>
                        )}
                        {currentStep < totalSteps && (
                            <button type="button" onClick={handleNextStep} className={styles.nextButton}>
                                Siguiente
                            </button>
                        )}
                        {currentStep === totalSteps && (
                            <button type="submit" className={styles.saveButton} disabled={!isFormCompleteAndValid}>
                                {reserva ? 'Guardar Cambios' : 'Crear Reserva'}
                            </button>
                        )}
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            Cerrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservaModal;