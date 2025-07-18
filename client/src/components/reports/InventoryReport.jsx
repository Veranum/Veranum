import React from 'react';
import styles from '../../pages/AdminReportsPage.module.css';

const InventoryReport = ({ lowStockItems, totalValue }) => {
    return (
        <div className={`card ${styles.tableCard}`}>
            <h3 className={styles.chartTitle}>Reporte de Inventario</h3>
            <p>Valor total estimado del inventario: <strong>${(totalValue || 0).toLocaleString('es-CL')}</strong></p>
            <h4 className={styles.subChartTitle}>Insumos con Bajo Stock (Menos de 10 unidades)</h4>
            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead><tr><th>Insumo</th><th>Stock Actual</th><th>Unidad</th></tr></thead>
                    <tbody>
                        {lowStockItems?.length > 0 ? lowStockItems.map((item) => (
                            <tr key={item._id} className={item.stock < 5 ? styles.stockCritico : styles.stockBajo}>
                                <td>{item.nombre}</td>
                                <td>{item.stock}</td>
                                <td>{item.unidad_medida}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3">No hay insumos con bajo stock.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryReport;