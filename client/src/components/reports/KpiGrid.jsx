import React from 'react';
import { Tooltip } from 'react-tooltip';
import styles from '../../pages/AdminReportsPage.module.css';
import { InfoIcon } from '../common/Icons';

const KpiGrid = ({ kpis }) => {
    return (
        <>
            <Tooltip id="kpi-tooltip" />
            <div className={styles.statsGrid}>
                {kpis.map((kpi, index) => (
                    <div key={kpi.label} className={`card ${styles.statCard}`} style={{ animationDelay: `${index * 100}ms` }}>
                        <div className={styles.statIcon} style={{ backgroundColor: kpi.color, color: kpi.iconColor }}>{kpi.icon}</div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>{kpi.value}</span>
                            <span className={styles.statLabel}>
                                {kpi.label}
                                {kpi.tooltip && (
                                    <span data-tooltip-id="kpi-tooltip" data-tooltip-content={kpi.tooltip}>
                                        <InfoIcon />
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default KpiGrid;