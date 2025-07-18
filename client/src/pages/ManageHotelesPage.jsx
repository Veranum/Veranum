// File: client/src/pages/ManageHotelesPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllHotelesAdmin, createHotel, updateHotel, deleteHotel } from '../services/adminService';
import HotelModal from '../components/admin/HotelModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageHotelesPage.module.css'; // <-- NUEVO ARCHIVO CSS

// --- Iconos para la UI ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const ManageHotelesPage = () => {
    const [hoteles, setHoteles] = useState([]);
    const [filteredHoteles, setFilteredHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingHotel, setDeletingHotel] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const fetchHoteles = async () => {
        try {
            setLoading(true);
            const response = await getAllHotelesAdmin();
            setHoteles(response.data);
            setFilteredHoteles(response.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los hoteles.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchHoteles(); }, []);

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const result = hoteles.filter(hotel => 
            hotel.nombre.toLowerCase().includes(lowercasedTerm) ||
            hotel.ubicacion.ciudad.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredHoteles(result);
    }, [searchTerm, hoteles]);

    const handleOpenModal = (hotel = null) => {
        setEditingHotel(hotel);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingHotel(null);
        setIsModalOpen(false);
    };

    const handleSaveHotel = async (formData) => {
        try {
            if (editingHotel) {
                await updateHotel(editingHotel._id, formData);
                setNotification({ show: true, message: 'Hotel actualizado exitosamente.', type: 'success' });
            } else {
                await createHotel(formData);
                setNotification({ show: true, message: 'Hotel creado exitosamente.', type: 'success' });
            }
            fetchHoteles();
            handleCloseModal();
        } catch (err) {
            setNotification({ show: true, message: `Error: ${err.response?.data?.message || err.message}`, type: 'error' });
        }
    };
    
    const handleDeleteClick = (hotel) => {
        setDeletingHotel(hotel);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingHotel) return;
        try {
            await deleteHotel(deletingHotel._id);
            setNotification({ show: true, message: 'Hotel eliminado exitosamente.', type: 'success' });
            fetchHoteles();
        } catch(err) {
            setNotification({ show: true, message: `Error al eliminar: ${err.response?.data?.message || err.message}`, type: 'error' });
        } finally {
            setShowDeleteModal(false);
            setDeletingHotel(null);
        }
    };

    return (
        <>
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <HotelModal show={isModalOpen} onClose={handleCloseModal} onSave={handleSaveHotel} hotel={editingHotel} />
            <ConfirmationModal 
                show={showDeleteModal}
                title="Confirmar Eliminación"
                message={`¿Seguro que quieres eliminar el hotel ${deletingHotel?.nombre}?`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
            <div className="container">
                <div className={styles.header}>
                    <h1>Gestión de Hoteles</h1>
                    <button onClick={() => handleOpenModal(null)} className={styles.createButton}>Crear Nuevo Hotel</button>
                </div>
                
                <div className={`${styles.filtersContainer} card`}>
                    <div className={styles.searchWrapper}>
                        <label htmlFor="search-input">Buscar Hotel</label>
                        <div className={styles.inputIconWrapper}>
                            <SearchIcon />
                            <input id="search-input" type="text" placeholder="Buscar por Nombre o Ciudad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                {loading ? <p>Cargando...</p> : error ? <p className={styles.errorMessage}>{error}</p> : (
                    <div className={styles.hotelGrid}>
                        {filteredHoteles.map(hotel => (
                            <div key={hotel._id} className={`${styles.hotelCard} card`}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.hotelName}><HomeIcon /> {hotel.nombre}</h4>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.details}>
                                        <span><LocationIcon /> {hotel.ubicacion.direccion}, {hotel.ubicacion.ciudad}</span>
                                    </div>
                                    {hotel.servicios_extras && hotel.servicios_extras.length > 0 && (
                                        <div className={styles.services}>
                                            <p><SparklesIcon /> Servicios Extras:</p>
                                            <ul className={styles.servicesList}>
                                                {hotel.servicios_extras.map((servicio, index) => (
                                                    <li key={index}>{servicio}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleOpenModal(hotel)} className={styles.editButton}><EditIcon /> Editar</button>
                                        <button onClick={() => handleDeleteClick(hotel)} className={styles.deleteButton}><TrashIcon /> Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && filteredHoteles.length === 0 && <p className={styles.noResults}>No se encontraron hoteles.</p>}
            </div>
        </>
    );
};

export default ManageHotelesPage;