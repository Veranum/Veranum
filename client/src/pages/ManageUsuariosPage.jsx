import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUserAdmin, updateUserAdmin, deleteUserAdmin } from '../services/adminService'; 
import UserModal from '../components/admin/UserModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import Pagination from '../components/common/Pagination';
import styles from './ManageUsuariosPage.module.css'; // Importamos sus estilos dedicados

const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const ManageUsuariosPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ searchTerm: '', roleFilter: 'all' });
    
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllUsers(currentPage, 8, filters);
            setUsers(response.data);
            setTotalPages(response.totalPages);
        } catch (err) {
            setNotification({ show: true, message: 'No se pudieron cargar los usuarios.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSaveUser = async (formData) => {
        try {
            if (editingUser) await updateUserAdmin(editingUser._id, formData);
            else await createUserAdmin(formData);
            setNotification({ show: true, message: 'Usuario guardado.', type: 'success' });
            fetchUsers();
            setIsUserModalOpen(false);
        } catch (err) {
            setNotification({ show: true, message: `Error: ${err.response?.data?.message}`, type: 'error' });
        }
    };

    const confirmDelete = async () => {
        if (!deletingUser) return;
        try {
            await deleteUserAdmin(deletingUser._id);
            setNotification({ show: true, message: 'Usuario eliminado.', type: 'success' });
            if(currentPage > 1 && users.length === 1) setCurrentPage(currentPage - 1);
            else fetchUsers();
        } catch (err) {
            setNotification({ show: true, message: `Error al eliminar: ${err.response?.data?.message}`, type: 'error' });
        } finally {
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CL');

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <UserModal show={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} user={editingUser} />
            <ConfirmationModal show={showDeleteModal} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar a ${deletingUser?.nombre}?`} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)} />

            <div className={styles.header}>
                <h1>Gestión de Usuarios</h1>
                <button onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }} className={styles.createButton}>Crear Usuario</button>
            </div>
            
            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.filterBar}>
                    <div className={styles.inputGroup}>
                        <label>Buscar por Nombre/Email/RUN</label>
                        <input name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange} placeholder="Escribe para buscar..." />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Filtrar por Rol</label>
                        <select name="roleFilter" value={filters.roleFilter} onChange={handleFilterChange}>
                            <option value="all">Todos los Roles</option>
                            <option value="cliente">Cliente</option>
                            <option value="gerente">Gerente</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? <p>Cargando usuarios...</p> : (
                <>
                    <div className={styles.userGrid}>
                        {users.map(user => (
                            <div key={user._id} className={`${styles.userCard} card`}>
                                <div className={styles.cardHeader}>
                                    <h4 className={styles.userName}>{user.nombre}</h4>
                                    <span className={`${styles.role} ${styles[`role_${user.rol}`]}`}>{user.rol}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.details}>
                                        <span><UserIcon /> {user._id}</span>
                                        <span><MailIcon /> {user.email}</span>
                                        <span><CalendarIcon /> Miembro desde: {formatDate(user.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span className={styles.reservationsInfo}>{user.numeroDeReservas} reservas</span>
                                    <div className={styles.actions}>
                                        <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className={styles.editButton} title="Editar"><EditIcon /></button>
                                        <button onClick={() => { setDeletingUser(user); setShowDeleteModal(true); }} className={styles.deleteButton} title="Eliminar"><TrashIcon /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {users.length === 0 && <p>No se encontraron usuarios con los filtros seleccionados.</p>}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
                </>
            )}
        </div>
    );
};

export default ManageUsuariosPage;  