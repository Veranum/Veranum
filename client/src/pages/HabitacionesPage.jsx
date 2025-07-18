//client\src/pages\HabitacionesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHabitaciones } from '../services/habitacionesService';
import styles from './HabitacionesPage.module.css';

// --- Iconos para la UI ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;


// --- Componente de Tarjeta de Habitación ---
const RoomSummaryCard = ({ habitacion, onViewDetails }) => {
    const navigate = useNavigate();

    const handleReserveClick = (e) => {
        e.stopPropagation();
        navigate('/reservar', { state: { preselectedRoom: habitacion } });
    };

    return (
        <div className={styles.summaryCard} onClick={() => onViewDetails(habitacion)}>
            <div className={styles.summaryImageContainer}>
                <img src={habitacion.imagenUrl || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Imagen'} alt={habitacion.nombre} />
            </div>
            <div className={styles.summaryInfo}>
                <span className={styles.roomCategory}>{habitacion.categoria}</span>
                <h3>{habitacion.nombre}</h3>
                <div className={styles.roomMeta}>
                    {habitacion.hotel_id && <span><HomeIcon/> {habitacion.hotel_id.nombre}</span>}
                    <span><UsersIcon/> {habitacion.capacidad} Personas</span>
                </div>
                <div className={styles.priceAndAction}>
                    <p className={styles.summaryPrice}>
                        ${(habitacion.precio || 0).toLocaleString('es-CL')}
                        <span>/ noche</span>
                    </p>
                    <button onClick={handleReserveClick} className={styles.reserveNowButton}>
                        Reservar
                    </button>
                </div>
                 <button className={styles.detailsButton} onClick={() => onViewDetails(habitacion)}>
                    Ver Detalles <ArrowRightIcon />
                </button>
            </div>
        </div>
    );
};

// --- Componente Modal de Detalle ---
const RoomDetailModal = ({ habitacion, onClose }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleReserveClick = () => {
        navigate('/reservar', { state: { preselectedRoom: habitacion } });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeModalButton} onClick={onClose}>&times;</button>
                <div className={styles.modalImage}>
                    <img src={habitacion.imagenUrl || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Imagen'} alt={habitacion.nombre} />
                </div>
                <div className={styles.modalInfo}>
                    <h2>{habitacion.nombre}</h2>
                    <p className={styles.modalPrice}>${(habitacion.precio || 0).toLocaleString('es-CL')} / noche</p>
                    <p className={styles.modalDescription}>{habitacion.descripcion}</p>
                    <h3>Servicios Incluidos</h3>
                    <ul className={styles.amenitiesList}>{habitacion.servicios?.map((servicio, index) => (<li key={index}>{servicio}</li>))}</ul>
                    <button className={styles.reserveButton} onClick={handleReserveClick}>
                        Reservar Esta Habitación
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal de la Página ---
const HabitacionesPage = () => {
    const [habitaciones, setHabitaciones] = useState([]);
    const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [ciudad, setCiudad] = useState('todas');
    const [orden, setOrden] = useState('precio-asc');
    
    useEffect(() => {
        const fetchHabitaciones = async () => {
            setLoading(true);
            try {
                const result = await getAllHabitaciones();
                if (result && Array.isArray(result.data)) {
                    setHabitaciones(result.data);
                } else {
                    setError('No se pudo obtener la lista de habitaciones.');
                }
            } catch (err) {
                setError('No se pudieron cargar las habitaciones en este momento.');
            } finally {
                setLoading(false);
            }
        };
        fetchHabitaciones();
    }, []);

    useEffect(() => {
        let result = [...habitaciones];

        if (searchTerm) {
            result = result.filter(hab =>
                hab.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hab.hotel_id?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (ciudad !== 'todas') {
            result = result.filter(hab => hab.hotel_id?.nombre.includes(ciudad));
        }

        switch (orden) {
            case 'precio-asc':
                result.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                result.sort((a, b) => b.precio - a.precio);
                break;
            case 'categoria':
                result.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            default:
                break;
        }

        setFilteredHabitaciones(result);
    }, [searchTerm, ciudad, orden, habitaciones]);

    return (
        <div className="container">
            <div className={styles.header}>
                <h1>Nuestras Habitaciones</h1>
                <p>Encuentra el espacio perfecto diseñado para tu confort y descanso.</p>
            </div>

            <div className={`card ${styles.filterContainer}`}>
                <div className={styles.searchGroup}>
                    <label htmlFor="search-input">Buscar</label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Buscar por nombre o ciudad..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <label htmlFor="ciudad">Ciudad</label>
                    <select id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                        <option value="todas">Todas las ciudades</option>
                        <option value="Santiago">Santiago</option>
                        <option value="Viña del Mar">Viña del Mar</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label htmlFor="orden">Ordenar por</label>
                    <select id="orden" value={orden} onChange={(e) => setOrden(e.target.value)}>
                        <option value="precio-asc">Precio (menor a mayor)</option>
                        <option value="precio-desc">Precio (mayor a menor)</option>
                        <option value="categoria">Categoría (A-Z)</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}><p>Cargando habitaciones...</p></div>
            ) : error ? (
                 <p className={styles.noResults}>{error}</p>
            ) : (
                <div className={styles.roomList}>
                    {filteredHabitaciones.length > 0 ? (
                        filteredHabitaciones.map(h =>
                            <RoomSummaryCard
                                key={h._id}
                                habitacion={h}
                                onViewDetails={setSelectedRoom}
                            />
                        )
                    ) : (
                        <p className={styles.noResults}>No se encontraron habitaciones que coincidan con tus criterios.</p>
                    )}
                </div>
            )}

            {selectedRoom && <RoomDetailModal habitacion={selectedRoom} onClose={() => setSelectedRoom(null)} />}
        </div>
    );
};

export default HabitacionesPage;