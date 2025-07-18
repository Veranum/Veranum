import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from '../../pages/AdminReportsPage.module.css';

// Componente para un Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue}>{`Ingresos: $${payload[0].value.toLocaleString('es-CL')}`}</p>
        </div>
      );
    }
    return null;
};

const HotelPerformance = ({ performanceData }) => {
    return (
        <div className={`card ${styles.tableCard}`}>
            <h3 className={styles.chartTitle}>Rendimiento de Habitaciones (Ingresos)</h3>
            <div className={styles.chartContainer}>
                {/* El ResponsiveContainer ahora usa altura del 100% */}
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="nombre" fontSize={12} tick={{ fill: '#6c757d' }} />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 95, 115, 0.05)' }}/>
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                        <Bar 
                            dataKey="ingresos" 
                            fill="#005f73" 
                            name="Ingresos" 
                            barSize={40}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HotelPerformance;