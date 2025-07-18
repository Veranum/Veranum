import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboardPage.module.css'; // Reutilizamos estilos

const ArrowIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>;

const RestaurantDashboardPage = () => {
    return (
        <div className={`${styles.dashboardContainer} container`}>
            <div className={styles.header}>
                <h1>Gestión de Restaurant</h1>
                <p>Administra los proveedores, categorías y el stock de insumos de la cocina.</p>
            </div>

            <div className={styles.managementSection}>
                <h2>Módulos Disponibles</h2>
                <div className={styles.managementGrid}>
                    <Link to="/admin/restaurant/proveedores" className={`${styles.managementCard} card`}>
                        <div><h3>Gestionar Proveedores</h3><p>Añade, edita o elimina los proveedores de insumos.</p></div>
                        <ArrowIcon />
                    </Link>
                    <Link to="/admin/restaurant/tipos-insumo" className={`${styles.managementCard} card`}>
                        <div><h3>Gestionar Tipos de Insumo</h3><p>Crea las categorías para organizar tu inventario.</p></div>
                        <ArrowIcon />
                    </Link>
                     <Link to="/admin/restaurant/inventario" className={`${styles.managementCard} card`}>
                        <div><h3>Gestionar Inventario</h3><p>Controla el stock de todos tus insumos.</p></div>
                        <ArrowIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboardPage;