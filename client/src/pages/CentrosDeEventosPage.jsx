// src/pages/CentrosDeEventosPage.jsx
import React, { useState, useEffect } from 'react';
import { getAllCentrosEvento } from '../services/adminService';
import Modal from '../components/common/Modal'; // Importamos el nuevo Modal
import styles from './CentrosDeEventosPage.module.css';

// Íconos (sin cambios)
const LocationIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const CentrosDeEventosPage = () => {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para controlar el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllCentrosEvento();
                setCentros(res.data);
            } catch (err) {
                setError("No se pudieron cargar los salones.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Función que abre el modal y guarda el salón seleccionado
    const handleConsultaClick = (centro) => {
        setSelectedCentro(centro);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCentro(null);
    };

    return (
        <div className={styles.eventPage}>
            {/* Renderizamos el Modal aquí */}
            <Modal
              show={isModalOpen}
              onClose={handleCloseModal}
              title={`Consulta sobre "${selectedCentro?.nombre}"`}
            >
                <p>
                    Para obtener más información y cotizar, por favor envía un correo a <strong>eventos@veranum.cl</strong>.
                    <br/><br/>
                    Asegúrate de incluir el nombre del salón en tu consulta.
                </p>
            </Modal>

            <header className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className="container">
                    <h1 className={styles.heroTitle}>Eventos Memorables</h1>
                    <p className={styles.heroSubtitle}>Salones versátiles y un servicio impecable para que tu evento sea un éxito rotundo.</p>
                </div>
            </header>

            <main className="container">
                {loading && <p className={styles.loadingMessage}>Cargando salones disponibles...</p>}
                {error && <p className={styles.errorMessage}>{error}</p>}
                
                {!loading && !error && (
                    <div className={styles.gridContainer}>
                        {centros.map((centro) => (
                            <article key={centro._id} className={styles.eventCard}>
                                <div className={styles.cardImage}>
                                    <img src={centro.imagenUrl || 'https://salonesyeventos.cl/sites/default/files/image_slideshow_salon/Casa-18-Gran-Sal%C3%B3n-5.jpg'} alt={centro.nombre} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h2 className={styles.cardTitle}>{centro.nombre}</h2>
                                    <div className={styles.cardLocation}>
                                        <LocationIcon />
                                        <span>{centro.hotel_id?.nombre}</span>
                                    </div>
                                    <div className={styles.cardStats}>
                                        <UsersIcon />
                                        <span>Hasta {centro.capacidad} personas</span>
                                    </div>
                                    
                                    {centro.equipamiento.length > 0 && (
                                        <div className={styles.equipmentSection}>
                                            <p>Equipamiento incluido:</p>
                                            <ul className={styles.equipmentList}>
                                                {centro.equipamiento.map(item => (
                                                    <li key={item}><CheckIcon />{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.priceInfo}>
                                        Desde <span>${(centro.precio_por_hora || 0).toLocaleString('es-CL')}</span> / hora
                                    </div>
                                    <button 
                                        onClick={() => handleConsultaClick(centro)} 
                                        className={styles.ctaButton}
                                    >
                                        Consultar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CentrosDeEventosPage;