import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminDashboardPage.module.css'; // Reutilizamos los estilos del dashboard principal

const ArrowIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>;

const EventosDashboardPage = () => {
    return (
        <div className={`${styles.dashboardContainer} container`}>
            <div className={styles.header}>
                <h1>Gestión de Centro de Eventos</h1>
                <p>Administra los salones y sus respectivos arriendos desde esta sección.</p>
            </div>

            <div className={styles.managementSection}>
                <h2>Módulos de Eventos</h2>
                <div className={styles.managementGrid}>
                    <Link to="/admin/eventos/salones" className={`${styles.managementCard} card`}>
                        <div><h3>Gestionar Salones</h3><p>Crea, edita o elimina los salones de eventos disponibles.</p></div>
                        <ArrowIcon />
                    </Link>
                    <Link to="/admin/eventos/arriendos" className={`${styles.managementCard} card`}>
                        <div><h3>Gestionar Arriendos</h3><p>Administra las reservas y la disponibilidad de los salones.</p></div>
                        <ArrowIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventosDashboardPage;