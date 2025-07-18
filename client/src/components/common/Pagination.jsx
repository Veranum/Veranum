import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return null; // No mostrar paginación si solo hay una página
    }

    return (
        <nav className={styles.paginationContainer}>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className={styles.pageButton}
            >
                Anterior
            </button>
            {pageNumbers.map(number => (
                <button 
                    key={number} 
                    onClick={() => onPageChange(number)}
                    className={`${styles.pageButton} ${currentPage === number ? styles.active : ''}`}
                >
                    {number}
                </button>
            ))}
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className={styles.pageButton}
            >
                Siguiente
            </button>
        </nav>
    );
};

export default Pagination;