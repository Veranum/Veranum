// File: client/src/pages/ManageHabitacionesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getAllHotelesAdmin,
    createHabitacion, 
    updateHabitacion, 
    deleteHabitacion,
    setNuevoPrecioHabitacion
} from '../services/adminService';
// Asumimos que esta función existe en tus servicios para llamar a la nueva ruta del API
import { getHabitacionesAdminStatus } from '../services/habitacionesService'; 
import HabitacionModal from '../components/admin/HabitacionModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageHabitacionesPage.module.css';

// --- Iconos para la UI (sin cambios) ---
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20v11H2z"></path><path d="M2 14v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5"></path><path d="M6 11V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const ManageHabitacionesPage = () => {
    const [hoteles, setHoteles] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [habitaciones, setHabitaciones] = useState([]);
    const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabitacion, setEditingHabitacion] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingHabitacion, setDeletingHabitacion] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const [searchTerm, setSearchTerm] = useState('');
    // --- FILTRO DE DISPONIBILIDAD RESTAURADO ---
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [priceSort, setPriceSort] = useState('none');

    const fetchHotelData = useCallback(async (hotelId) => {
        setLoading(true);
        try {
            const habitacionesRes = await getHabitacionesAdminStatus(hotelId);
            setHabitaciones(habitacionesRes.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los datos de las habitaciones.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getAllHotelesAdmin();
                setHoteles(response.data);
            } catch (err) {
                setError('No se pudieron cargar los hoteles.');
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);
    
    useEffect(() => {
        fetchHotelData(selectedHotel);
    }, [selectedHotel, fetchHotelData]);

    useEffect(() => {
        let result = [...habitaciones];

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(h => h.nombre.toLowerCase().includes(lowercasedTerm) || h._id.toString().includes(lowercasedTerm));
        }

        // --- LÓGICA DEL FILTRO DE DISPONIBILIDAD ACTUALIZADA ---
        if (availabilityFilter !== 'all') {
            result = result.filter(h => {
                // 'disponible' ahora significa que hay al menos 1 habitación libre hoy
                if (availabilityFilter === 'disponible') {
                    return h.inventario.disponibles > 0;
                }
                // 'ocupada' ahora significa que no hay NINGUNA habitación libre hoy
                if (availabilityFilter === 'ocupada') {
                    return h.inventario.disponibles === 0;
                }
                return true;
            });
        }
        
        if (priceSort !== 'none') {
            result.sort((a, b) => priceSort === 'desc' ? b.precio - a.precio : a.precio - b.precio);
        }
        setFilteredHabitaciones(result);
    }, [habitaciones, searchTerm, availabilityFilter, priceSort]);

    const handleOpenModal = (habitacion = null) => {
        setEditingHabitacion(habitacion);
        setIsModalOpen(true);
    };

    const handleSaveHabitacion = async (formData) => {
        try {
            const { precio, ...detallesHabitacion } = formData;
            const numericPrice = parseFloat(precio);

            if (editingHabitacion) {
                await updateHabitacion(editingHabitacion._id, detallesHabitacion);
                if (numericPrice && numericPrice !== editingHabitacion.precio) {
                    await setNuevoPrecioHabitacion({ 
                        habitacion_id: editingHabitacion._id, 
                        valor: numericPrice 
                    });
                }
                setNotification({ show: true, message: 'Habitación actualizada exitosamente.', type: 'success' });
            } else {
                const nuevaHabitacionRes = await createHabitacion(detallesHabitacion);
                const nuevaHabitacionId = nuevaHabitacionRes.data._id;
                if (numericPrice > 0) {
                    await setNuevoPrecioHabitacion({
                        habitacion_id: nuevaHabitacionId,
                        valor: numericPrice
                    });
                }
                setNotification({ show: true, message: 'Habitación creada exitosamente.', type: 'success' });
            }
            fetchHotelData(selectedHotel);
            setIsModalOpen(false);
            setEditingHabitacion(null);
        } catch (err) {
            setNotification({ show: true, message: `Error al guardar: ${err.response?.data?.message || err.message}`, type: 'error' });
        }
    };

    const handleDeleteClick = (habitacion) => {
        setDeletingHabitacion(habitacion);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingHabitacion) return;
        try {
            await deleteHabitacion(deletingHabitacion._id);
            setNotification({ show: true, message: 'Habitación eliminada exitosamente.', type: 'success' });
            fetchHotelData(selectedHotel);
        } catch (err) {
            setNotification({ show: true, message: `Error al eliminar: ${err.response?.data?.message || err.message}`, type: 'error' });
        } finally {
            setShowDeleteModal(false);
            setDeletingHabitacion(null);
        }
    };

    return (
        <>
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            {isModalOpen && (
                 <HabitacionModal 
                    show={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSaveHabitacion} 
                    habitacion={editingHabitacion}
                    hoteles={hoteles}
                    defaultHotelId={selectedHotel}
                />
            )}
            <ConfirmationModal 
                show={showDeleteModal}
                title="Confirmar Eliminación"
                message={`¿Seguro que quieres eliminar la habitación N° ${deletingHabitacion?._id} (${deletingHabitacion?.nombre})? Esta acción es irreversible.`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />

            <div className="container">
                <div className={styles.header}>
                    <h1>Gestión de Habitaciones</h1>
                    <button onClick={() => handleOpenModal(null)} className={styles.createButton} disabled={hoteles.length === 0}>
                        Crear Nueva Habitación
                    </button>
                </div>

                <div className={`${styles.hotelSelectorContainer} card`}>
                    <label htmlFor="hotel-selector">Gestionando Hotel</label>
                    <select id="hotel-selector" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
                        <option value="">Todos los hoteles</option>
                        {hoteles.map(hotel => (
                            <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* --- SECCIÓN DE FILTROS RESTAURADA A SU DISEÑO ORIGINAL --- */}
                <div className={`${styles.filtersContainer} card`}>
                    <div className={styles.searchWrapper}>
                        <label htmlFor="search-input">Buscar</label>
                        <div className={styles.inputIconWrapper}>
                            <SearchIcon />
                            <input id="search-input" type="text" placeholder="Buscar por N° Habitación o Nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="availability-filter">Disponibilidad (Hoy)</label>
                            <select id="availability-filter" value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                                <option value="all">Todas</option>
                                <option value="disponible">Con Disponibilidad</option>
                                <option value="ocupada">Sin Disponibilidad</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="price-sort">Ordenar por</label>
                            <select id="price-sort" value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                                <option value="none">Por Defecto</option>
                                <option value="desc">Precio: Mayor a Menor</option>
                                <option value="asc">Precio: Menor a Mayor</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? <p>Cargando...</p> : error ? <p className={styles.errorMessage}>{error}</p> : (
                    <div className={styles.habitacionesGrid}>
                        {filteredHabitaciones.map(h => {
                            const disponibles = h.inventario.disponibles;
                            const statusClassName = disponibles > 0 ? styles.status_disponible : styles.status_ocupada;
                            // El texto ahora muestra el inventario real, que es la información correcta
                            const statusText = `${disponibles} / ${h.inventario.total} Disp.`;

                            return (
                                <div key={h._id} className={`${styles.habitacionCard} card`}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.habitacionId}><BedIcon /> Habitación N°{h._id}</span>
                                        <span className={`${styles.status} ${statusClassName}`}>{statusText}</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h4>{h.nombre}</h4>
                                        <div className={styles.details}>
                                            <span><UsersIcon /> {h.capacidad} Personas</span>
                                            <span><LayersIcon /> Piso {h.piso}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <span className={styles.price}><DollarSignIcon />${new Intl.NumberFormat('es-CL').format(h.precio)} / noche</span>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleOpenModal(h)} className={styles.editButton}><EditIcon /></button>
                                            <button onClick={() => handleDeleteClick(h)} className={styles.deleteButton}><TrashIcon /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!loading && filteredHabitaciones.length === 0 && <p className={styles.noResults}>No se encontraron habitaciones para la selección actual.</p>}
            </div>
        </>
    );
};

export default ManageHabitacionesPage;