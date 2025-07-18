// File: client/src/pages/ManageServiciosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getAllHotelesAdmin, 
    getServiciosByHotelAdmin,
    createServicio,
    updateServicio,
    deleteServicio
} from '../services/adminService';
import ServicioModal from '../components/admin/ServicioModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageServiciosPage.module.css'; // <-- NUEVO ARCHIVO CSS

// --- Íconos para la UI ---
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"></path></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const ManageServiciosPage = () => {
    const [hoteles, setHoteles] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [servicios, setServicios] = useState([]);
    const [filteredServicios, setFilteredServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServicio, setEditingServicio] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingServicio, setDeletingServicio] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const fetchHoteles = async () => {
        try {
            const response = await getAllHotelesAdmin();
            setHoteles(response.data);
            if (response.data.length > 0) {
                setSelectedHotel(response.data[0]._id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError('No se pudieron cargar los hoteles.');
            setLoading(false);
        }
    };

    const fetchServicios = useCallback(async () => {
        if (!selectedHotel) return;
        setLoading(true);
        try {
            const response = await getServiciosByHotelAdmin(selectedHotel);
            setServicios(response.data);
            setFilteredServicios(response.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los servicios.');
        } finally {
            setLoading(false);
        }
    }, [selectedHotel]);

    useEffect(() => { fetchHoteles(); }, []);
    useEffect(() => { fetchServicios(); }, [fetchServicios]);

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const result = servicios.filter(servicio => 
            servicio.nombre.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredServicios(result);
    }, [searchTerm, servicios]);

    const handleOpenModal = (servicio = null) => {
        setEditingServicio(servicio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingServicio(null);
        setIsModalOpen(false);
    };

    const handleSaveServicio = async (formData) => {
        try {
            if (editingServicio) {
                await updateServicio(editingServicio._id, formData);
                setNotification({ show: true, message: 'Servicio actualizado.', type: 'success' });
            } else {
                await createServicio({ ...formData, hotel_id: selectedHotel });
                setNotification({ show: true, message: 'Servicio creado.', type: 'success' });
            }
            fetchServicios();
            handleCloseModal();
        } catch (err) {
            setNotification({ show: true, message: `Error: ${err.response?.data?.message || err.message}`, type: 'error' });
        }
    };

    const handleDeleteClick = (servicio) => {
        setDeletingServicio(servicio);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingServicio) return;
        try {
            await deleteServicio(deletingServicio._id);
            setNotification({ show: true, message: 'Servicio eliminado.', type: 'success' });
            fetchServicios();
        } catch (err) {
            setNotification({ show: true, message: `Error al eliminar: ${err.response?.data?.message || err.message}`, type: 'error' });
        } finally {
            setShowDeleteModal(false);
            setDeletingServicio(null);
        }
    };

    return (
        <>
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <ServicioModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveServicio}
                servicio={editingServicio}
            />
            <ConfirmationModal
                show={showDeleteModal}
                title="Confirmar Eliminación"
                message={`¿Seguro que quieres eliminar el servicio "${deletingServicio?.nombre}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
            <div className="container">
                <div className={styles.header}>
                    <h1>Gestión de Servicios Adicionales</h1>
                    <button onClick={() => handleOpenModal(null)} className={styles.createButton} disabled={!selectedHotel}>
                        Crear Nuevo Servicio
                    </button>
                </div>

                <div className={`${styles.hotelSelectorContainer} card`}>
                    <label htmlFor="hotel-selector">Gestionando Servicios del Hotel:</label>
                    <select id="hotel-selector" value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
                        {hoteles.map(hotel => (
                            <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className={`${styles.filtersContainer} card`}>
                    <div className={styles.searchWrapper}>
                        <label htmlFor="search-input">Buscar Servicio</label>
                        <div className={styles.inputIconWrapper}>
                            <SearchIcon />
                            <input id="search-input" type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                {loading ? <p>Cargando...</p> : error ? <p className={styles.errorMessage}>{error}</p> : (
                    <div className={styles.serviceGrid}>
                        {filteredServicios.map(s => (
                            <div key={s._id} className={`${styles.serviceCard} card`}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.serviceName}><SparklesIcon /> {s.nombre}</h4>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>{s.descripcion}</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.price}><DollarSignIcon />${s.precio_diario.toLocaleString('es-CL')} / día</span>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleOpenModal(s)} className={styles.editButton}><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(s)} className={styles.deleteButton}><TrashIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && filteredServicios.length === 0 && <p className={styles.noResults}>No se encontraron servicios para el hotel seleccionado.</p>}
            </div>
        </>
    );
};

export default ManageServiciosPage;