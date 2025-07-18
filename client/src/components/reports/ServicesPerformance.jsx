import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../../pages/AdminReportsPage.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d'];

const ServicesPerformance = ({ data }) => (
    <div className={`card ${styles.tableCard}`}>
        <h3 className={styles.chartTitle}>Popularidad de Servicios Adicionales</h3>
        <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="contrataciones" nameKey="nombre" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} veces`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default ServicesPerformance;