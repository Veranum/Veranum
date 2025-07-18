// client/src/pages/ManageTiposInsumoPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // --- 1. Se importa useCallback ---
import { 
    getAllTiposInsumo, 
    createTipoInsumo, 
    updateTipoInsumo, 
    deleteTipoInsumo,
    getAllHotelesAdmin
} from '../services/adminService';
import TipoInsumoModal from '../components/admin/TipoInsumoModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageTiposInsumoPage.module.css';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

const ManageTiposInsumoPage = () => {
    const [tipos, setTipos] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    const [filteredTipos, setFilteredTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTipo, setEditingTipo] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTipo, setDeletingTipo] = useState(null);

    const [selectedHotel, setSelectedHotel] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- 2. Se envuelve la función en useCallback ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [tiposRes, hotelesRes] = await Promise.all([
                getAllTiposInsumo(selectedHotel),
                getAllHotelesAdmin()
            ]);
            setTipos(tiposRes.data);
            setHoteles(hotelesRes.data);
        } catch (error) {
            setNotification({ show: true, message: 'Error al cargar los datos', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [selectedHotel]); // La función solo se recreará si 'selectedHotel' cambia

    // --- 3. Ahora el useEffect puede depender de fetchData de forma segura ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = tipos;
        if (searchTerm) {
            result = result.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredTipos(result);
    }, [tipos, searchTerm]);

    const handleSave = async (data) => {
        try {
            if (editingTipo) {
                await updateTipoInsumo(editingTipo._id, data);
                setNotification({ show: true, message: 'Tipo actualizado con éxito', type: 'success' });
            } else {
                await createTipoInsumo(data);
                setNotification({ show: true, message: 'Tipo creado con éxito', type: 'success' });
            }
            fetchData();
            setIsModalOpen(false);
            setEditingTipo(null);
        } catch (error) {
            setNotification({ show: true, message: `Error: ${error.response?.data?.message || 'Ocurrió un error'}`, type: 'error' });
        }
    };
    
    const handleDeleteClick = (tipo) => {
        setDeletingTipo(tipo);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteTipoInsumo(deletingTipo._id);
            setNotification({ show: true, message: 'Tipo eliminado con éxito', type: 'success' });
            fetchData();
        } catch (error) {
            setNotification({ show: true, message: 'Error al eliminar el tipo de insumo', type: 'error' });
        } finally {
            setShowDeleteModal(false);
            setDeletingTipo(null);
        }
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification(p => ({...p, show: false}))} />
            <TipoInsumoModal 
                show={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                tipoInsumo={editingTipo} 
                hoteles={hoteles} 
                defaultHotelId={selectedHotel} 
            />
            <ConfirmationModal 
                show={showDeleteModal} 
                title="Confirmar Eliminación" 
                message={`¿Seguro que quieres eliminar la categoría "${deletingTipo?.nombre}"?`} 
                onConfirm={confirmDelete} 
                onCancel={() => setShowDeleteModal(false)} 
            />

            <div className={styles.header}>
                <h1>Gestión de Tipos de Insumo</h1>
                <button className={styles.createButton} onClick={() => { setEditingTipo(null); setIsModalOpen(true); }}>Nuevo Tipo</button>
            </div>
            
            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.inputGroup}>
                    <label>Filtrar por Hotel</label>
                    <select value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)}>
                        <option value="">Todos los Hoteles</option>
                        {hoteles.map(hotel => <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>)}
                    </select>
                </div>
                <div className={styles.inputGroup}>
                    <label>Buscar por Nombre</label>
                    <div className={styles.inputIconWrapper}>
                        <SearchIcon />
                        <input type="text" placeholder="Buscar categoría..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>
            
            {loading ? <p>Cargando...</p> : (
                <div className={styles.grid}>
                    {filteredTipos.map(t => (
                        <div key={t._id} className={styles.tipoCard}>
                            <span className={styles.tipoName}>{t.nombre}</span>
                            <div className={styles.actions}>
                                <button className={styles.editButton} onClick={() => { setEditingTipo(t); setIsModalOpen(true); }}><EditIcon /></button>
                                <button className={styles.deleteButton} onClick={() => handleDeleteClick(t)}><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && filteredTipos.length === 0 && <p className={styles.noResults}>No se encontraron tipos de insumo con los filtros actuales.</p>}
        </div>
    );
};

export default ManageTiposInsumoPage;