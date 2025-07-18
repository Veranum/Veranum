// client/src/pages/ManageInsumosPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    getAllInsumos, createInsumo, updateInsumo, deleteInsumo, updateInsumoStock,
    getAllTiposInsumo, getAllProveedores, getAllHotelesAdmin
} from '../services/adminService';
import InsumoModal from '../components/admin/InsumoModal';
import StockUpdateModal from '../components/admin/StockUpdateModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import styles from './ManageInsumosPage.module.css';

const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const ManageInsumosPage = () => {
    const [insumos, setInsumos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [hoteles, setHoteles] = useState([]);
    
    const [filters, setFilters] = useState({ search: '', tipo: 'all', proveedor: 'all', hotelId: '' });
    
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const [insumoModal, setInsumoModal] = useState({ show: false, data: null });
    const [stockModal, setStockModal] = useState({ show: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, data: null });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resTipos, resProveedores, resHoteles] = await Promise.all([
                    getAllTiposInsumo(), getAllProveedores(), getAllHotelesAdmin()
                ]);
                setTipos(resTipos.data);
                setProveedores(resProveedores.data);
                setHoteles(resHoteles.data);
            } catch (error) {
                setNotification({ show: true, message: 'Error al cargar datos iniciales', type: 'error' });
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchInsumos = async () => {
            setLoading(true);
            try {
                const resInsumos = await getAllInsumos(filters.hotelId);
                setInsumos(resInsumos.data);
            } catch (error) {
                setNotification({ show: true, message: 'Error al cargar inventario', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchInsumos();
    }, [filters.hotelId]);

    const filteredInsumos = useMemo(() => {
        return insumos.filter(i => {
            const matchSearch = i.nombre.toLowerCase().includes(filters.search.toLowerCase());
            const matchTipo = filters.tipo === 'all' || i.tipo_insumo_id?._id === filters.tipo;
            const matchProveedor = filters.proveedor === 'all' || i.proveedor_id?._id === filters.proveedor;
            return matchSearch && matchTipo && matchProveedor;
        });
    }, [insumos, filters.search, filters.tipo, filters.proveedor]);

    const handleSave = async (data) => {
        try {
            if (insumoModal.data) await updateInsumo(insumoModal.data._id, data);
            else await createInsumo(data);
            setNotification({ show: true, message: 'Insumo guardado correctamente', type: 'success' });
            const resInsumos = await getAllInsumos(filters.hotelId);
            setInsumos(resInsumos.data);
            setInsumoModal({ show: false, data: null });
        } catch (error) { setNotification({ show: true, message: `Error: ${error.response?.data?.message}`, type: 'error' }); }
    };

    const handleDelete = async () => {
        try {
            await deleteInsumo(deleteModal.data._id);
            setNotification({ show: true, message: 'Insumo eliminado', type: 'success' });
            const resInsumos = await getAllInsumos(filters.hotelId);
            setInsumos(resInsumos.data);
        } catch (error) { setNotification({ show: true, message: 'Error al eliminar el insumo', type: 'error' });
        } finally { setDeleteModal({ show: false, data: null }); }
    };

    const handleStockUpdate = async (cantidad) => {
        try {
            await updateInsumoStock(stockModal.data._id, cantidad);
            setNotification({ show: true, message: 'Stock actualizado', type: 'success' });
            const resInsumos = await getAllInsumos(filters.hotelId);
            setInsumos(resInsumos.data);
        } catch (error) { setNotification({ show: true, message: 'Error al actualizar stock', type: 'error' });
        } finally { setStockModal({ show: false, data: null }); }
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification(p => ({...p, show: false}))} />
            <InsumoModal show={insumoModal.show} onClose={() => setInsumoModal({ show: false, data: null })} onSave={handleSave} insumo={insumoModal.data} tipos={tipos} proveedores={proveedores} hoteles={hoteles} />
            <StockUpdateModal show={stockModal.show} onClose={() => setStockModal({ show: false, data: null })} onUpdate={handleStockUpdate} insumo={stockModal.data} />
            <ConfirmationModal show={deleteModal.show} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar "${deleteModal.data?.nombre}"?`} onConfirm={handleDelete} onCancel={() => setDeleteModal({ show: false, data: null })} />

            <div className={styles.header}>
                <h1>Inventario de Insumos</h1>
                <button className={styles.createButton} onClick={() => setInsumoModal({ show: true, data: null })}>Nuevo Insumo</button>
            </div>
            
            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.inputGroup}><label>Filtrar por Hotel</label><select name="hotelId" value={filters.hotelId} onChange={handleFilterChange}><option value="">Todos los Hoteles</option>{hoteles.map(h=><option key={h._id} value={h._id}>{h.nombre}</option>)}</select></div>
                <div className={styles.inputGroup}><label>Buscar por Nombre</label><input name="search" onChange={handleFilterChange} placeholder="Buscar..." /></div>
                <div className={styles.inputGroup}><label>Filtrar por Tipo</label><select name="tipo" value={filters.tipo} onChange={handleFilterChange}><option value="all">Todos los Tipos</option>{tipos.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}</select></div>
                <div className={styles.inputGroup}><label>Filtrar por Proveedor</label><select name="proveedor" value={filters.proveedor} onChange={handleFilterChange}><option value="all">Todos los Proveedores</option>{proveedores.map(p=><option key={p._id} value={p._id}>{p.nombre}</option>)}</select></div>
            </div>

            {loading ? <p style={{textAlign: 'center', padding: '2rem'}}>Cargando inventario...</p> : (
                <div className={styles.insumoGrid}>
                    {filteredInsumos.map(i => (
                        <div key={i._id} className={`${styles.insumoCard} card ${i.stock < 10 ? styles.stockBajo : ''} ${i.stock < 5 ? styles.stockCritico : ''}`}>
                            <div className={styles.cardHeader}><h4 className={styles.insumoNombre}>{i.nombre}</h4></div>
                            <div className={styles.cardBody}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Categoría:</span> 
                                    <span className={styles.detailValue}>{i.tipo_insumo_id?.nombre}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Proveedor:</span> 
                                    <span className={styles.detailValue}>{i.proveedor_id?.nombre}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Hotel:</span> 
                                    <span className={styles.detailValue}>{i.hotel_id?.nombre}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Precio:</span> 
                                    <span className={styles.detailValue}>${i.precio_unitario?.toLocaleString('es-CL')} / {i.unidad_medida}</span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.stockInfo}>{i.stock} <span>{i.unidad_medida}</span></div>
                                <div className={styles.actions}>
                                    <button className={styles.stockButton} onClick={() => setStockModal({ show: true, data: i })}>Ajustar</button>
                                    <button className={styles.editButton} onClick={() => setInsumoModal({ show: true, data: i })}><EditIcon /></button>
                                    <button className={styles.deleteButton} onClick={() => setDeleteModal({ show: true, data: i })}><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageInsumosPage;