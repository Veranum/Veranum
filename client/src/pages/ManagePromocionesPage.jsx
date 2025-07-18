import React, { useState, useEffect } from 'react';
import { getAllPromociones, createPromocion, updatePromocion, deletePromocion } from '../services/adminService';
import Notification from '../components/common/Notification';
import ConfirmationModal from '../components/common/ConfirmationModal';
import PromocionModal from '../components/admin/PromocionModal';
import styles from './ManagePromocionesPage.module.css';

// --- Iconos para la UI de las tarjetas ---
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PercentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const ManagePromocionesPage = () => {
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingPromo, setDeletingPromo] = useState(null);

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const res = await getAllPromociones();
            setPromociones(res.data);
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar promociones', type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchPromos(); }, []);

    const handleSave = async (data) => {
        try {
            if (editingPromo) {
                await updatePromocion(editingPromo._id, data);
                setNotification({ show: true, message: 'Promoción actualizada', type: 'success' });
            } else {
                await createPromocion(data);
                setNotification({ show: true, message: 'Promoción creada', type: 'success' });
            }
            fetchPromos();
            setIsModalOpen(false);
            setEditingPromo(null);
        } catch (error) {
            setNotification({ show: true, message: `Error al guardar: ${error.response?.data?.message || 'Error inesperado'}`, type: 'error' });
        }
    };
    
    const handleToggleActive = async (promo) => {
        try {
            await updatePromocion(promo._id, { ...promo, activa: !promo.activa });
            setNotification({ show: true, message: `Promoción ${!promo.activa ? 'activada' : 'desactivada'}`, type: 'success' });
            fetchPromos();
        } catch (error) {
             setNotification({ show: true, message: 'Error al cambiar estado', type: 'error' });
        }
    };

    const handleDeleteClick = (promo) => {
        setDeletingPromo(promo);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingPromo) return;
        try {
            await deletePromocion(deletingPromo._id);
            setNotification({ show: true, message: 'Promoción eliminada con éxito', type: 'success' });
            fetchPromos();
        } catch(err) {
            setNotification({ show: true, message: 'Error al eliminar', type: 'error' });
        } finally {
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CL');
    };
    
    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification(p => ({...p, show: false}))} />
            <PromocionModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} promocion={editingPromo} />
            <ConfirmationModal show={showDeleteModal} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar el código "${deletingPromo?.codigo}"?`} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)} />

            <div className={styles.header}>
                <h1>Gestión de Promociones</h1>
                <button onClick={() => { setEditingPromo(null); setIsModalOpen(true); }} className={styles.createButton}>Crear Promoción</button>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className={styles.promoGrid}>
                    {promociones.map(p => (
                        <div key={p._id} className={`${styles.promoCard} card`}>
                            <div className={styles.cardHeader}>
                                <span className={styles.promoCode}><TagIcon /> {p.codigo}</span>
                                <span className={`${styles.status} ${p.activa ? styles.status_activa : styles.status_inactiva}`}>
                                    {p.activa ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.description}>{p.descripcion}</p>
                                <div className={styles.details}>
                                    <span title="Válido Desde"><CalendarIcon /> {formatDate(p.fecha_inicio)}</span>
                                    <span title="Válido Hasta"><CalendarIcon /> {formatDate(p.fecha_fin)}</span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <span className={styles.discount}><PercentIcon /> {p.porcentaje_descuento}% OFF</span>
                                <div className={styles.actions}>
                                    <button className={styles.toggleButton} onClick={() => handleToggleActive(p)}>{p.activa ? 'Desactivar' : 'Activar'}</button>
                                    <button className={styles.editButton} onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} title="Editar"><EditIcon /></button>
                                    <button className={styles.deleteButton} onClick={() => handleDeleteClick(p)} title="Eliminar"><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagePromocionesPage;