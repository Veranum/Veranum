// client/src/pages/ManageProveedoresPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/adminService';
import ProveedorModal from '../components/admin/ProveedorModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageHotelesPage.module.css';

// --- Iconos para la UI ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
// --- NUEVOS ICONOS ---
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const ManageProveedoresPage = () => {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProveedor, setDeletingProveedor] = useState(null);

    const fetchProveedores = async () => {
        try { setLoading(true); const res = await getAllProveedores(); setProveedores(res.data); } 
        catch (error) { setNotification({ show: true, message: 'Error al cargar proveedores', type: 'error' }); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProveedores(); }, []);

    const handleSave = async (data) => {
        try {
            if (editingProveedor) {
                await updateProveedor(editingProveedor._id, data);
                setNotification({ show: true, message: 'Proveedor actualizado', type: 'success' });
            } else {
                await createProveedor(data);
                setNotification({ show: true, message: 'Proveedor creado', type: 'success' });
            }
            fetchProveedores();
            setIsModalOpen(false);
        } catch (error) {
            setNotification({ show: true, message: `Error: ${error.response?.data?.message}`, type: 'error' });
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteProveedor(deletingProveedor._id);
            setNotification({ show: true, message: 'Proveedor eliminado', type: 'success' });
            fetchProveedores();
        } catch (error) {
            setNotification({ show: true, message: 'Error al eliminar', type: 'error' });
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification(p => ({...p, show: false}))} />
            <ProveedorModal show={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} proveedor={editingProveedor} />
            <ConfirmationModal show={showDeleteModal} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar a ${deletingProveedor?.nombre}?`} onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />

            <div className={styles.header}>
                <h1>Gestión de Proveedores</h1>
                <button className={styles.createButton} onClick={() => { setEditingProveedor(null); setIsModalOpen(true); }}>Nuevo Proveedor</button>
            </div>
            
            {loading ? <p>Cargando...</p> : (
                <div className={styles.hotelGrid}>
                    {proveedores.map(p => (
                        <div key={p._id} className={`${styles.hotelCard} card`}>
                            <div className={styles.cardHeader}>
                                <h4 className={styles.hotelName}>{p.nombre}</h4>
                            </div>
                            <div className={styles.cardBody}>
                                {/* --- CAMBIO: Se añaden íconos a cada campo --- */}
                                <p><ContactIcon /> <span>{p.contacto.nombre}</span></p>
                                <p><EmailIcon /> <span>{p.contacto.email}</span></p>
                                <p><PhoneIcon /> <span>{p.contacto.telefono}</span></p>
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.actions}>
                                    <button className={styles.editButton} onClick={() => { setEditingProveedor(p); setIsModalOpen(true); }}><EditIcon /> Editar</button>
                                    <button className={styles.deleteButton} onClick={() => { setDeletingProveedor(p); setShowDeleteModal(true); }}><TrashIcon /> Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageProveedoresPage;
