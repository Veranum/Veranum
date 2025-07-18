import React, { useState, useEffect } from 'react';
import { getAllHotelesAdmin, getAllCentrosEvento, createCentroEvento, updateCentroEvento, deleteCentroEvento } from '../services/adminService';
import CentroEventoModal from '../components/admin/CentroEventoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageHotelesPage.module.css'; // Reutilizamos estilos

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const ManageSalonesPage = () => {
    const [salones, setSalones] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, data: null });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [salonesRes, hotelesRes] = await Promise.all([getAllCentrosEvento(), getAllHotelesAdmin()]);
            setSalones(salonesRes.data);
            setHoteles(hotelesRes.data);
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar datos', type: 'error' });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (data) => {
        try {
            if (modal.data) await updateCentroEvento(modal.data._id, data);
            else await createCentroEvento(data);
            setNotification({ show: true, message: 'Salón guardado con éxito.', type: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ show: true, message: `Error: ${error.response?.data?.message}`, type: 'error' });
        } finally { setModal({ show: false, data: null }); }
    };
    
    const handleDelete = async () => {
        try {
            await deleteCentroEvento(deleteModal.data._id);
            setNotification({ show: true, message: 'Salón eliminado con éxito.', type: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ show: true, message: 'Error al eliminar salón.', type: 'error' });
        } finally { setDeleteModal({ show: false, data: null }); }
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <CentroEventoModal show={modal.show} onClose={() => setModal({ show: false, data: null })} onSave={handleSave} hotel={modal.data} hoteles={hoteles} />
            <ConfirmationModal show={deleteModal.show} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar el salón "${deleteModal.data?.nombre}"?`} onConfirm={handleDelete} onCancel={() => setDeleteModal({ show: false, data: null })} />

            <div className={styles.header}>
                <h1>Gestión de Salones de Eventos</h1>
                <button className={styles.createButton} onClick={() => setModal({ show: true, data: null })}>Nuevo Salón</button>
            </div>
            
            {loading ? <p>Cargando...</p> : (
                <div className={styles.hotelGrid}>
                    {salones.map(salon => (
                        <div key={salon._id} className={`${styles.hotelCard} card`}>
                            <div className={styles.cardHeader}><h4 className={styles.hotelName}>{salon.nombre}</h4></div>
                            <div className={styles.cardBody}>
                                <p><strong>Hotel:</strong> {salon.hotel_id?.nombre}</p>
                                <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
                                <p><strong>Precio por Hora:</strong> ${salon.precio_por_hora.toLocaleString('es-CL')}</p>
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.actions}>
                                    <button onClick={() => setModal({ show: true, data: salon })} className={styles.editButton}><EditIcon /> Editar</button>
                                    <button onClick={() => setDeleteModal({ show: true, data: salon })} className={styles.deleteButton}><TrashIcon /> Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageSalonesPage;