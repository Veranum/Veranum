// client/src/pages/ManageEventosPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getAllCentrosEvento, 
    getArriendosByCentro, 
    createArriendoEvento, 
    updateArriendoEvento, 
    deleteArriendo 
} from '../services/adminService';
import ArriendoEventoModal from '../components/admin/ArriendoEventoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageEventosPage.module.css';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const ManageEventosPage = () => {
    const [centros, setCentros] = useState([]);
    const [selectedCentro, setSelectedCentro] = useState(null);
    const [arriendos, setArriendos] = useState([]);
    const [loading, setLoading] = useState({ centros: true, arriendos: false });
    const [modal, setModal] = useState({ show: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, data: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const fetchCentros = async () => {
        try {
            setLoading(prev => ({ ...prev, centros: true }));
            const res = await getAllCentrosEvento();
            setCentros(res.data);
            if (res.data.length > 0) {
                setSelectedCentro(res.data[0]);
            }
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar salones', type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, centros: false }));
        }
    };
    
    useEffect(() => {
        fetchCentros();
    }, []);

    const fetchArriendos = useCallback(async () => {
        if (!selectedCentro) return;
        try {
            setLoading(prev => ({ ...prev, arriendos: true }));
            const res = await getArriendosByCentro(selectedCentro._id);
            setArriendos(res.data);
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar arriendos', type: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, arriendos: false }));
        }
    }, [selectedCentro]);

    useEffect(() => {
        fetchArriendos();
    }, [fetchArriendos]);
    
    const handleSave = async (data) => {
        try {
            if (modal.data) {
                await updateArriendoEvento(modal.data._id, data);
            } else {
                await createArriendoEvento(data);
            }
            setNotification({ show: true, message: 'Arriendo guardado exitosamente.', type: 'success' });
            fetchArriendos();
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
            fetchArriendos();
        } catch (error) {
            setNotification({ show: true, message: 'Error al eliminar el arriendo.', type: 'error' });
        } finally {
            setDeleteModal({ show: false, data: null });
        }
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: ''})} />
            
            {modal.show && <ArriendoEventoModal 
                show={modal.show} 
                onClose={() => setModal({ show: false, data: null })} 
                onSave={handleSave} 
                arriendo={modal.data} 
                centros={centros} 
            />}
            
            <ConfirmationModal 
                show={deleteModal.show}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el arriendo para "${deleteModal.data?.cliente_nombre}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ show: false, data: null })}
            />

            <div className={styles.header}>
                <h1>Gestión de Centro de Eventos</h1>
            </div>
            
            <div className={styles.pageLayout}>
                <aside className={styles.sidebar}>
                    <h3>Salones Disponibles</h3>
                    {loading.centros ? <p>Cargando...</p> : (
                        <ul>
                            {centros.map(c => (
                                <li key={c._id}>
                                    <button onClick={() => setSelectedCentro(c)} className={selectedCentro?._id === c._id ? styles.active : ''}>{c.nombre}</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
                <main className={styles.mainContent}>
                    <div className={styles.mainContentHeader}>
                        <h2>Arriendos para "{selectedCentro?.nombre || '...'}"</h2>
                        <button onClick={() => setModal({ show: true, data: null })} disabled={!selectedCentro}>Nuevo Arriendo</button>
                    </div>
                    {loading.arriendos ? <p>Cargando arriendos...</p> : (
                        <div className={styles.arriendosGrid}>
                            {arriendos.map(a => (
                                <div className={`${styles.arriendoCard} card`} key={a._id}>
                                    <div className={styles.cardHeader}>
                                        <h4 className={styles.clienteNombre}>{a.cliente_nombre}</h4>
                                        <span className={`${styles.status} ${styles[`status_${a.estado?.toLowerCase()}`]}`}>{a.estado}</span>
                                    </div>
                                    <div className={styles.cardBody}>
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
                            {arriendos.length === 0 && <p>No hay arriendos registrados para este salón.</p>}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManageEventosPage;