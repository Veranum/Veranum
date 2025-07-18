// client/src/pages/ManageArriendosPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    getAllCentrosEvento, 
    getAllArriendos, 
    createArriendoEvento, 
    updateArriendoEvento, 
    deleteArriendo 
} from '../services/adminService';
import ArriendoEventoModal from '../components/admin/ArriendoEventoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import Pagination from '../components/common/Pagination';
import styles from './ManageEventosPage.module.css';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;


const ManageArriendosPage = () => {
    const [arriendos, setArriendos] = useState([]);
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', centroId: 'all' });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [modal, setModal] = useState({ show: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, data: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const resArriendos = await getAllArriendos(currentPage, 6);
            setArriendos(resArriendos.data);
            setTotalPages(resArriendos.totalPages);
            
            if (centros.length === 0) {
                const resCentros = await getAllCentrosEvento();
                setCentros(resCentros.data);
            }
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar los datos.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, centros.length]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredArriendos = useMemo(() => {
        return arriendos.filter(a => {
            const matchSearch = a.cliente_nombre.toLowerCase().includes(filters.search.toLowerCase());
            const matchCentro = filters.centroId === 'all' || a.centro_evento_id?._id === filters.centroId;
            return matchSearch && matchCentro;
        });
    }, [arriendos, filters]);

    const handleSave = async (data) => {
        try {
            if (modal.data) {
                await updateArriendoEvento(modal.data._id, data);
            } else {
                await createArriendoEvento(data);
            }
            setNotification({ show: true, message: 'Arriendo guardado exitosamente.', type: 'success' });
            fetchData();
            setModal({ show: false, data: null });
        } catch (error) {
            setNotification({ show: true, message: `Error: ${error.response?.data?.message || 'Error inesperado'}`, type: 'error' });
        }
    };
    
    const handleDeleteClick = (arriendo) => {
        setDeleteModal({ show: true, data: arriendo });
    };

    const confirmDelete = async () => {
        if (!deleteModal.data) return;
        try {
            await deleteArriendo(deleteModal.data._id);
            setNotification({ show: true, message: 'Arriendo eliminado correctamente.', type: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ show: true, message: 'Error al eliminar el arriendo.', type: 'error' });
        } finally {
            setDeleteModal({ show: false, data: null });
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: ''})} />
            <ArriendoEventoModal show={modal.show} onClose={() => setModal({ show: false, data: null })} onSave={handleSave} arriendo={modal.data} centros={centros} />
            <ConfirmationModal show={deleteModal.show} title="Confirmar Eliminación" message={`¿Estás seguro de que quieres eliminar el arriendo para "${deleteModal.data?.cliente_nombre}"?`} onConfirm={confirmDelete} onCancel={() => setDeleteModal({ show: false, data: null })}/>

            <div className={styles.header}>
                <h1>Gestión de Arriendos de Eventos</h1>
                <button className={styles.createButton} onClick={() => setModal({ show: true, data: null })} disabled={centros.length === 0}>Nuevo Arriendo</button>
            </div>
            
            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.inputGroup}>
                    <label>Buscar por Cliente</label>
                    <div className={styles.inputIconWrapper}>
                        <SearchIcon/>
                        <input name="search" onChange={handleFilterChange} placeholder="Nombre de cliente..." />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label>Filtrar por Salón</label>
                    <select name="centroId" onChange={handleFilterChange}>
                        <option value="all">Todos los Salones</option>
                        {centros.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                    </select>
                </div>
            </div>

            {loading ? <p style={{textAlign: 'center', padding: '2rem'}}>Cargando arriendos...</p> : (
                <>
                    <div className={styles.arriendosGrid}>
                        {filteredArriendos.map(a => (
                            <div className={`${styles.arriendoCard} card`} key={a._id}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.clienteNombre}>{a.cliente_nombre}</h4>
                                    <span className={`${styles.status} ${styles[`status_${a.estado?.toLowerCase()}`]}`}>{a.estado}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.detailRow}><BuildingIcon/> <span>{a.centro_evento_id?.nombre}</span></div>
                                    <div className={styles.detailRow}><CalendarIcon/> <span>{new Date(a.fecha_evento).toLocaleDateString('es-CL', {timeZone: 'UTC'})}</span></div>
                                    <div className={styles.detailRow}><ClockIcon/> <span>{a.hora_inicio} - {a.hora_fin}</span></div>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.price}>${a.precio_total?.toLocaleString('es-CL')}</span>
                                    <div className={styles.actions}>
                                        <button className={styles.editButton} onClick={() => setModal({ show: true, data: a })}><EditIcon/></button>
                                        <button className={styles.deleteButton} onClick={() => handleDeleteClick(a)}><TrashIcon/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredArriendos.length === 0 && <p style={{textAlign: 'center', padding: '2rem'}}>No se encontraron arriendos con los filtros actuales.</p>}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default ManageArriendosPage;