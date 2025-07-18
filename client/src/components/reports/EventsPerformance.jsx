import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from '../../pages/AdminReportsPage.module.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (<div className={styles.customTooltip}><p className={styles.tooltipLabel}>{label}</p><p className={styles.tooltipValue}>{`Ingresos: $${payload[0].value.toLocaleString('es-CL')}`}</p></div>);
    }
    return null;
};

const EventsPerformance = ({ data, totalIngresos, totalArriendos }) => (
    <div className={`card ${styles.tableCard}`}>
        <h3 className={styles.chartTitle}>Rendimiento de Centros de Eventos</h3>
        <p>Total de arriendos en el mes: <strong>{totalArriendos}</strong> | Ingresos totales: <strong>${totalIngresos.toLocaleString('es-CL')}</strong></p>
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nombre" fontSize={12} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 95, 115, 0.05)' }} />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Bar dataKey="ingresos" fill="#3f51b5" name="Ingresos por Salón" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default EventsPerformance;