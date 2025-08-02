import React, { useState, useEffect } from 'react';
import { getAllCentrosEvento } from '../services/adminService';
import styles from './CentrosDeEventosPage.module.css';

// Íconos
const LocationIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17L4 12"></path></svg>;

const CentrosDeEventosPage = () => {
    const [centros, setCentros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCentro, setSelectedCentro] = useState(null);

    useEffect(() => {
        const fetchCentros = async () => {
            try {
                const response = await getAllCentrosEvento();
                let centrosData = response;

                if (response && response.data && Array.isArray(response.data)) {
                    centrosData = response.data;
                } else if (response && response.centros && Array.isArray(response.centros)) {
                    centrosData = response.centros;
                } else if (Array.isArray(response)) {
                    centrosData = response;
                } else {
                    setError('La respuesta de la API no es un formato de lista válido.');
                    setCentros([]);
                    return;
                }
                setCentros(centrosData);
            } catch (err) {
                setError('Hubo un error al cargar los centros de eventos.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCentros();
    }, []);

    const handleConsultaClick = (centro) => {
        setSelectedCentro(centro);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCentro(null);
    };

    if (loading) {
        return <div className={styles.loadingMessage}>Cargando salones disponibles...</div>;
    }
    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    return (
        <div className={styles.eventPage}>
            <header className={styles.heroSection}>
                <h1 className={styles.heroTitle}>Descubre tu espacio ideal</h1>
                <p className={styles.heroSubtitle}>Salones y centros de eventos para tus celebraciones, seminarios y conferencias.</p>
            </header>

            <main className={styles.mainContent}>
                {centros.length === 0 ? (
                    <div className={styles.noEventsMessage}>No hay centros de eventos disponibles en este momento.</div>
                ) : (
                    <div className={styles.gridContainer}>
                        {centros.map((centro) => (
                            <article key={centro._id} className={styles.card}>
                                <div className={styles.cardImageContainer}>
                                    <img
                                        src={centro.imagenUrl || 'https://salonesyeventos.cl/sites/default/files/image_slideshow_salon/Casa-18-Gran-Sal%C3%B3n-5.jpg'}
                                        alt={`Imagen del salón de eventos ${centro.nombre}`}
                                        className={styles.cardImage}
                                    />
                                </div>
                                <div className={styles.cardBody}>
                                    <h2 className={styles.cardTitle}>{centro.nombre}</h2>
                                    <div className={styles.cardStats}>
                                        {centro.direccion && (
                                            <span className={styles.cardLocation}>
                                                <LocationIcon /> {centro.direccion.comuna}, {centro.direccion.ciudad}
                                            </span>
                                        )}
                                        {centro.capacidad && (
                                            <span className={styles.cardCapacity}>
                                                <UsersIcon /> {centro.capacidad} personas
                                            </span>
                                        )}
                                    </div>
                                    <p className={styles.description}>{centro.descripcion}</p>
                                    {centro.equipamiento && centro.equipamiento.length > 0 && (
                                        <div className={styles.equipmentSection}>
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

            {isModalOpen && selectedCentro && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button onClick={handleCloseModal} className={styles.closeButton}>&times;</button>
                        <h3>Consultar por {selectedCentro.nombre}</h3>
                        <p>Para más información, contáctanos a través del correo electrónico.</p>
                        <a
                            href={`mailto:eventos@veranum.cl?subject=Consulta sobre el Salón de Eventos: ${selectedCentro.nombre}`}
                            className={styles.ctaButton}
                        >
                            Enviar correo a eventos@veranum.cl
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentrosDeEventosPage;