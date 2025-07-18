// File: client/src/pages/ManageReservasPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    getReservas, 
    deleteReserva, 
    getAllHotelesAdmin,
    createReservaAdmin,
    updateReserva
} from '../services/adminService';
import styles from './ManageReservasPage.module.css';
import Notification from '../components/common/Notification';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ReservaModal from '../components/admin/ReservaModal';

// --- Iconos para la UI ---
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const SparklesIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"></path></svg>;

const ManageReservasPage = () => {
    const [reservas, setReservas] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        estado: 'Todos',
        fecha: '',
        sortBy: 'none',
        selectedHotel: ''
    });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    const [selectedReservas, setSelectedReservas] = useState(new Set());
    const selectAllCheckboxRef = useRef(null);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [reservasRes, hotelesRes] = await Promise.all([
                getReservas(),
                getAllHotelesAdmin()
            ]);
            const sortedReservas = reservasRes.data.sort((a,b) => b.numeroReserva - a.numeroReserva);
            setReservas(sortedReservas);
            setHoteles(hotelesRes.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los datos iniciales.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => setFilters({ search: '', estado: 'Todos', fecha: '', sortBy: 'none', selectedHotel: '' });
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL');

    const filteredAndSortedReservas = (() => {
        let filtered = reservas
            .filter(reserva => {
                const searchLower = filters.search.toLowerCase();
                const cliente = reserva.cliente_id;
                const matchesSearch = !filters.search || (reserva.numeroReserva?.toString().includes(searchLower)) || (cliente?.nombre?.toLowerCase().includes(searchLower)) || (cliente?._id?.toLowerCase().includes(searchLower));
                const matchesEstado = filters.estado === 'Todos' || reserva.estado === filters.estado;
                const matchesFecha = !filters.fecha || new Date(reserva.fecha_inicio) >= new Date(filters.fecha);
                const matchesHotel = !filters.selectedHotel || reserva.hotel_id?._id === filters.selectedHotel;
                return matchesSearch && matchesEstado && matchesFecha && matchesHotel;
            });

        if (filters.sortBy !== 'none') {
            const [field, direction] = filters.sortBy.split('_');
            const factor = direction === 'asc' ? 1 : -1;
            if (field === 'precio') {
                filtered.sort((a, b) => (a.precio_final - b.precio_final) * factor);
            }
        }
        
        return filtered;
    })();
    
    const handleSelectReserva = (reservaId) => {
        setSelectedReservas(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(reservaId)) {
                newSelected.delete(reservaId);
            } else {
                newSelected.add(reservaId);
            }
            return newSelected;
        });
    };
    
    const handleSelectAll = (e) => {
        const areAllVisibleSelected = filteredAndSortedReservas.length > 0 &&
            filteredAndSortedReservas.every(reserva => selectedReservas.has(reserva._id));

        if (areAllVisibleSelected) {
            setSelectedReservas(prevSelected => {
                const newSelected = new Set(prevSelected);
                filteredAndSortedReservas.forEach(reserva => newSelected.delete(reserva._id));
                return newSelected;
            });
        } else {
            setSelectedReservas(prevSelected => {
                const newSelected = new Set(prevSelected);
                filteredAndSortedReservas.forEach(reserva => newSelected.add(reserva._id));
                return newSelected;
            });
        }
    };

    useEffect(() => {
        const numVisible = filteredAndSortedReservas.length;
        if (selectAllCheckboxRef.current) {
            if (numVisible === 0) {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = false;
                return;
            }
            const visibleIds = new Set(filteredAndSortedReservas.map(r => r._id));
            const selectedVisible = new Set([...selectedReservas].filter(id => visibleIds.has(id)));
            
            if (selectedVisible.size === 0) {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = false;
            } else if (selectedVisible.size === numVisible) {
                selectAllCheckboxRef.current.checked = true;
                selectAllCheckboxRef.current.indeterminate = false;
            } else {
                selectAllCheckboxRef.current.checked = false;
                selectAllCheckboxRef.current.indeterminate = true;
            }
        }
    }, [selectedReservas, filteredAndSortedReservas]);


    const handleEditClick = (reserva) => {
        setSelectedReserva(reserva);
        setShowEditModal(true);
    };

    const handleDeleteClick = (reserva) => {
        setIsBulkDelete(false);
        setSelectedReserva(reserva);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        setIsBulkDelete(true);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (isBulkDelete) {
            try {
                await Promise.all(Array.from(selectedReservas).map(id => deleteReserva(id)));
                setNotification({ show: true, message: `${selectedReservas.size} reservas eliminadas con éxito.`, type: 'success' });
                setSelectedReservas(new Set());
                loadInitialData();
            } catch (err) {
                setNotification({ show: true, message: 'Error al eliminar las reservas.', type: 'error' });
            }
        } else {
            if (!selectedReserva) return;
            try {
                await deleteReserva(selectedReserva._id);
                setNotification({ show: true, message: 'Reserva eliminada con éxito', type: 'success' });
                loadInitialData();
            } catch (err) {
                setNotification({ show: true, message: 'Error al eliminar la reserva', type: 'error' });
            }
        }
        setShowDeleteModal(false);
        setSelectedReserva(null);
    };
    
    const handleSaveReserva = async (formData) => {
        try {
            if (selectedReserva) {
                await updateReserva(selectedReserva._id, formData);
                setNotification({ show: true, message: 'Reserva actualizada con éxito.', type: 'success' });
            } else {
                await createReservaAdmin(formData);
                setNotification({ show: true, message: 'Reserva creada con éxito.', type: 'success' });
            }
            setShowEditModal(false);
            setSelectedReserva(null);
            loadInitialData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al guardar la reserva.';
            setNotification({ show: true, message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <ConfirmationModal
                show={showDeleteModal}
                title={isBulkDelete ? "Confirmar Eliminación Múltiple" : "Confirmar Eliminación"}
                message={isBulkDelete ? `¿Seguro que quieres eliminar las ${selectedReservas.size} reservas seleccionadas?` : `¿Seguro que quieres eliminar la reserva N°${selectedReserva?.numeroReserva}?`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
            {showEditModal && (
                <ReservaModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveReserva}
                    reserva={selectedReserva}
                />
            )}

            <div className={styles.header}>
                <h1>Gestión de Reservas</h1>
                <button onClick={() => handleEditClick(null)} className={styles.createButton}>Crear Nueva Reserva</button>
            </div>
            
            <div className={`${styles.hotelSelectorContainer} card`}>
                <label htmlFor="hotel-selector">Gestionando Hotel</label>
                <select id="hotel-selector" name="selectedHotel" value={filters.selectedHotel} onChange={handleFilterChange}>
                    <option value="">Todos los hoteles</option>
                    {hoteles.map(hotel => (
                        <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>
                    ))}
                </select>
            </div>

            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.filterBar}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="search">Buscar Reserva</label>
                        <div className={styles.inputIconWrapper}>
                            <SearchIcon />
                            <input id="search" type="text" name="search" placeholder="Buscar por N° Reserva, RUN o Nombre..." value={filters.search} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="estado">Estado de la Reserva</label>
                        <select id="estado" name="estado" value={filters.estado} onChange={handleFilterChange}>
                            <option value="Todos">Todos</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="sortBy">Ordenar por Precio</label>
                        <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="none">Por Defecto</option>
                            <option value="precio_desc">De Mayor a Menor</option>
                            <option value="precio_asc">De Menor a Mayor</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fecha">Buscar por Fecha</label>
                        <input id="fecha" type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} title="Mostrar reservas a partir de esta fecha"/>
                    </div>
                </div>
                <div className={styles.clearButtonWrapper}>
                    <button onClick={handleClearFilters} className={styles.clearFiltersButton}>Borrar Filtros</button>
                </div>
            </div>

            {selectedReservas.size > 0 && (
                <div className={`${styles.bulkActionsBar} card`}>
                    <div className={styles.selectAllGroup}>
                        <input type="checkbox" id="selectAll" ref={selectAllCheckboxRef} onChange={handleSelectAll} />
                        <label htmlFor="selectAll">{selectedReservas.size} seleccionada(s)</label>
                    </div>
                    <div className={styles.bulkActionsButtons}>
                        <button className={styles.bulkDeleteButton} onClick={handleBulkDeleteClick}>
                            <TrashIcon /> Eliminar Selección
                        </button>
                    </div>
                </div>
            )}

            {loading && <p>Cargando...</p>}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {!loading && !error && (
                <div className={styles.reservasGrid}>
                    {filteredAndSortedReservas.map(reserva => (
                        <div key={reserva._id} className={`${styles.reservaCard} card ${selectedReservas.has(reserva._id) ? styles.selectedCard : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerInfo}>
                                    <input 
                                        type="checkbox" 
                                        className={styles.cardCheckbox}
                                        checked={selectedReservas.has(reserva._id)}
                                        onChange={() => handleSelectReserva(reserva._id)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                    <span className={styles.reservaId}><KeyIcon /> Reserva N°{reserva.numeroReserva}</span>
                                </div>
                                <span className={`${styles.status} ${styles[`status_${reserva.estado?.toLowerCase()}`]}`}>{reserva.estado}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <h4>{reserva.cliente_id?.nombre || 'Cliente no especificado'}</h4>
                                <div className={styles.details}>
                                    <span><UserIcon /> {reserva.cliente_id?._id || 'N/A'}</span>
                                    <span><HomeIcon /> {reserva.hotel_id?.nombre || 'N/A'}</span>
                                </div>
                                <div className={styles.details}>
                                    <span><CalendarIcon /> {formatDate(reserva.fecha_inicio)} al {formatDate(reserva.fecha_fin)}</span>
                                    {reserva.servicios_adicionales && reserva.servicios_adicionales.length > 0 && (
                                    <>
                                        <hr className={styles.serviceDivider} />
                                        <div className={styles.servicesInfo}>
                                            <div>
                                                <SparklesIcon />
                                                <ul className={styles.servicesList}>
                                                    {reserva.servicios_adicionales.map(servicio => (
                                                        <li key={servicio._id} className={styles.serviceItem}>{servicio.nombre}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                )}
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={styles.price}><DollarSignIcon /> Total: ${reserva.precio_final?.toLocaleString('es-CL')}</span>
                                <div className={styles.actions}>
                                    <button onClick={() => handleEditClick(reserva)} className={styles.editButton}><EditIcon /></button>
                                    <button onClick={() => handleDeleteClick(reserva)} className={styles.deleteButton}><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && filteredAndSortedReservas.length === 0 && <p className={styles.noResults}>No se encontraron reservas con los filtros actuales.</p>}
        </div>
    );
};

export default ManageReservasPage;