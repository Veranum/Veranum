import React, { useState, useEffect, useCallback } from 'react';
import { getReporteGeneral, getAllHotelesAdmin } from '../services/adminService';
import styles from './AdminReportsPage.module.css';

// Componentes
import ConfirmationModal from '../components/common/ConfirmationModal';
import Notification from '../components/common/Notification';
import KpiGrid from '../components/reports/KpiGrid';
import HotelPerformance from '../components/reports/HotelPerformance';
import EventsPerformance from '../components/reports/EventsPerformance';
import ServicesPerformance from '../components/reports/ServicesPerformance';
import InventoryReport from '../components/reports/InventoryReport';

// Iconos y Utilidades
import * as Icons from '../components/common/Icons';
import { exportToXLSX, exportToPDF } from '../utils/exportUtils';

const AdminReportsPage = () => {
    const [filters, setFilters] = useState({
        reportType: 'mensual',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        hotelId: ''
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoteles, setHoteles] = useState([]);
    const [activeTab, setActiveTab] = useState('hotel');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getReporteGeneral(filters);
            setReportData(response.data);
        } catch (err) {
            setReportData(null);
            setNotification({ show: true, message: 'No se pudo cargar el reporte.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    useEffect(() => {
        getAllHotelesAdmin().then(res => setHoteles(res.data));
    }, []);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        { value: 1, name: 'Enero' }, { value: 2, name: 'Febrero' }, { value: 3, name: 'Marzo' },
        { value: 4, name: 'Abril' }, { value: 5, name: 'Mayo' }, { value: 6, name: 'Junio' },
        { value: 7, name: 'Julio' }, { value: 8, name: 'Agosto' }, { value: 9, name: 'Septiembre' },
        { value: 10, name: 'Octubre' }, { value: 11, name: 'Noviembre' }, { value: 12, name: 'Diciembre' },
    ];
    
    const handleExportClick = (format) => {
        if (!reportData) {
            setNotification({ show: true, message: 'No hay datos para exportar.', type: 'error' });
            return;
        }
        setExportFormat(format);
        setShowExportModal(true);
    };

    const confirmExport = () => {
        const meta = {
            hotelName: hoteles.find(h => h._id === filters.hotelId)?.nombre || 'Ambos Hoteles',
            monthName: months.find(m => m.value === parseInt(filters.month, 10))?.name || 'Anual',
            selectedYear: filters.year
        };
        try {
            if (exportFormat === 'xlsx') exportToXLSX(reportData, meta);
            else if (exportFormat === 'pdf') exportToPDF(reportData, meta);
            setNotification({ show: true, message: `Reporte .${exportFormat} generado.`, type: 'success' });
        } catch(e) {
            setNotification({ show: true, message: `Error al generar el reporte: ${e.message}`, type: 'error' });
        } finally {
            setShowExportModal(false);
        }
    };

    const renderContent = () => {
        if (loading) return <div className={styles.loadingState}><div className={styles.spinner}></div></div>;
        if (!reportData) return <p className={styles.noResults}>No hay datos para mostrar para el período seleccionado.</p>;

        const kpis = [
            { label: 'Ingresos Habitaciones', value: `$${Math.round(reportData.ingresosHabitaciones || 0).toLocaleString('es-CL')}`, icon: <Icons.RevenueIcon/>, color: '#e8f5e9', iconColor: '#2e7d32' },
            { label: 'Ingresos Eventos', value: `$${Math.round(reportData.ingresosEventos || 0).toLocaleString('es-CL')}`, icon: <Icons.EventsIcon />, color: '#e8eaf6', iconColor: '#3f51b5' },
            { label: 'Valor Inventario', value: `$${Math.round(reportData.valorTotalInventario || 0).toLocaleString('es-CL')}`, icon: <Icons.InventoryIcon />, color: '#e0f2f1', iconColor: '#00796b' },
            { label: 'Ocupación Promedio', value: `${(reportData.ocupacionPromedioMes || 0).toFixed(1)}%`, icon: <Icons.OccupancyIcon/>, color: '#f3e5f5', iconColor: '#8e24aa', tooltip: 'Porcentaje de habitaciones ocupadas en el período.' },
            { label: 'RevPAR', value: `$${Math.round(reportData.revPAR || 0).toLocaleString('es-CL')}`, icon: <Icons.RevParIcon/>, color: '#e0f2f1', iconColor: '#00897b', tooltip: 'Ingresos por Habitación Disponible.' },
            { label: 'ADR', value: `$${Math.round(reportData.adr || 0).toLocaleString('es-CL')}`, icon: <Icons.AdrIcon/>, color: '#e3f2fd', iconColor: '#1565c0', tooltip: 'Tarifa Diaria Promedio.' },
        ];

        return (
            <div className={styles.mainContent}>
                <KpiGrid kpis={kpis} />
                <div className={styles.tabs}>
                    <button onClick={() => setActiveTab('hotel')} className={activeTab === 'hotel' ? styles.activeTab : ''}>Habitaciones</button>
                    <button onClick={() => setActiveTab('eventos')} className={activeTab === 'eventos' ? styles.activeTab : ''}>Eventos</button>
                    <button onClick={() => setActiveTab('servicios')} className={activeTab === 'servicios' ? styles.activeTab : ''}>Servicios</button>
                    <button onClick={() => setActiveTab('inventario')} className={activeTab === 'inventario' ? styles.activeTab : ''}>Inventario</button>
                </div>
                
                {activeTab === 'hotel' && <HotelPerformance performanceData={reportData.detalleRendimiento} />}
                {activeTab === 'eventos' && <EventsPerformance data={reportData.detalleRendimientoEventos} totalIngresos={reportData.ingresosEventos} totalArriendos={reportData.totalArriendosMes} />}
                {activeTab === 'servicios' && <ServicesPerformance data={reportData.detalleServicios} />}
                {activeTab === 'inventario' && <InventoryReport lowStockItems={reportData.insumosBajoStock} totalValue={reportData.valorTotalInventario} />}
            </div>
        );
    };

    return (
        <div className="container">
            <Notification {...notification} onClose={() => setNotification({ show: false, message: '', type: '' })} />
            <ConfirmationModal show={showExportModal} title={`Confirmar Exportación`} message={`¿Seguro que quieres generar y descargar el reporte en formato .${exportFormat}?`} onConfirm={confirmExport} onCancel={() => setShowExportModal(false)} />
            
            <div className={styles.header}>
                <h1>Dashboard de Reportes</h1>
                <p>Una vista general y dinámica del rendimiento del negocio.</p>
            </div>
            
            <div className={`${styles.filtersContainer} card`}>
                <div className={styles.filterGroup}><label>Tipo de Reporte</label><select name="reportType" value={filters.reportType} onChange={handleFilterChange}><option value="mensual">Mensual</option><option value="anual">Anual</option><option value="diario">Diario</option><option value="rango">Rango de Fechas</option></select></div>
                {filters.reportType === 'mensual' && (<><div className={styles.filterGroup}><label>Año</label><select name="year" value={filters.year} onChange={handleFilterChange}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div><div className={styles.filterGroup}><label>Mes</label><select name="month" value={filters.month} onChange={handleFilterChange}>{months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}</select></div></>)}
                {filters.reportType === 'anual' && (<div className={styles.filterGroup}><label>Año</label><select name="year" value={filters.year} onChange={handleFilterChange}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>)}
                {filters.reportType === 'diario' && (<div className={styles.filterGroup}><label>Día</label><input type="date" name="date" value={filters.date} onChange={handleFilterChange} /></div>)}
                {filters.reportType === 'rango' && (<><div className={styles.filterGroup}><label>Desde</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} /></div><div className={styles.filterGroup}><label>Hasta</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} /></div></>)}
                <div className={styles.filterGroup}><label>Hotel</label><select name="hotelId" value={filters.hotelId} onChange={handleFilterChange}><option value="">Ambos Hoteles</option>{hoteles.map(h => <option key={h._id} value={h._id}>{h.nombre}</option>)}</select></div>
                <div className={styles.exportButtons}><button onClick={() => handleExportClick('xlsx')} className={`${styles.exportButton} ${styles.exportXLSX}`}><Icons.ExportIcon /><span>.XLSX</span></button><button onClick={() => handleExportClick('pdf')} className={`${styles.exportButton} ${styles.exportPDF}`}><Icons.ExportIcon /><span>.PDF</span></button></div>
            </div>
            {renderContent()}
        </div>
    );
};

export default AdminReportsPage;