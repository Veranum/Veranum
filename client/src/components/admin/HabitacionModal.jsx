//client\src/components\admin\HabitacionModal.jsx
import React, { useState, useEffect } from 'react';
// --- CAMBIO: Se importa el nuevo archivo de estilos dedicado ---
import styles from './HabitacionModal.module.css';
// Se importa también el CSS del otro modal para estilos compartidos como el overlay
import sharedStyles from './ReservaModal.module.css';


const HabitacionModal = ({ show, onClose, onSave, habitacion, hoteles, defaultHotelId }) => {
    const [formData, setFormData] = useState({
        hotel_id: '',
        nombre: '',
        descripcion: '',
        categoria: 'individual',
        capacidad: '1',
        piso: '1',
        cantidad: '1',
        precio: '',
        servicios: '',
        imagenUrl: ''
    });

    useEffect(() => {
        if (show) {
            if (habitacion) {
                setFormData({
                    hotel_id: habitacion.hotel_id || '',
                    nombre: habitacion.nombre || '',
                    descripcion: habitacion.descripcion || '',
                    categoria: habitacion.categoria || 'individual',
                    capacidad: habitacion.capacidad?.toString() || '1',
                    piso: habitacion.piso?.toString() || '1',
                    cantidad: habitacion.cantidad?.toString() || '1',
                    precio: habitacion.precio || '',
                    servicios: habitacion.servicios ? habitacion.servicios.join(', ') : '',
                    imagenUrl: habitacion.imagenUrl || ''
                });
            } else {
                setFormData({
                    hotel_id: defaultHotelId || (hoteles && hoteles.length > 0 ? hoteles[0]._id : ''),
                    nombre: '',
                    descripcion: '',
                    categoria: 'individual',
                    capacidad: '1',
                    piso: '1',
                    cantidad: '1',
                    precio: '',
                    servicios: '',
                    imagenUrl: ''
                });
            }
        }
    }, [habitacion, show, hoteles, defaultHotelId]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.hotel_id) {
            alert('Error: Debe seleccionar un hotel antes de guardar.');
            return;
        }

        const dataToSave = {
            ...formData,
            capacidad: parseInt(formData.capacidad, 10),
            piso: parseInt(formData.piso, 10),
            cantidad: parseInt(formData.cantidad, 10),
            precio: parseFloat(formData.precio),
            servicios: formData.servicios.split(',').map(s => s.trim()).filter(Boolean)
        };
        
        onSave(dataToSave);
    };

    const isSaveDisabled = !formData.hotel_id || !formData.precio || !formData.nombre;

    return (
        // Se usan los estilos compartidos para el fondo y el contenedor principal
        <div className={sharedStyles.modalOverlay}>
            <div className={`${sharedStyles.modalContent} ${sharedStyles.largeModal}`}>
                <h2 className={sharedStyles.modalTitle}>{habitacion ? `Editar Habitación Nº ${habitacion._id}` : 'Crear Nueva Habitación'}</h2>
                {/* Se usan los estilos específicos para el formulario de habitación */}
                <form onSubmit={handleSubmit} className={sharedStyles.formGrid}>
                    <div className={styles.formColumn}>
                        <div className={styles.imagePreview}>
                            <img 
                                src={formData.imagenUrl || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Imagen'} 
                                alt="Vista previa de la habitación" 
                            />
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>URL de la Imagen</label>
                            <input type="text" name="imagenUrl" value={formData.imagenUrl} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Nombre de la Habitación</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" required />
                        </div>
                    </div>

                    <div className={styles.formColumn}>
                        <div className={sharedStyles.inputGroup}>
                            <label>Hotel de Pertenencia</label>
                            <select name="hotel_id" value={formData.hotel_id} onChange={handleChange} required>
                                {hoteles?.map(hotel => (
                                    <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Categoría</label>
                            <select name="categoria" value={formData.categoria} onChange={handleChange}>
                                <option value="individual">Individual</option>
                                <option value="doble">Doble</option>
                                <option value="matrimonial">Matrimonial</option>
                                <option value="suite-junior">Junior Suite</option>
                                <option value="familiar">Familiar</option>
                            </select>
                        </div>
                         <div className={sharedStyles.inputGroup}>
                            <label>Precio por Noche</label>
                            <input type="number" name="precio" value={formData.precio} onChange={handleChange} required min="0" placeholder="$50000" />
                            {habitacion && <small>Si cambia el precio, se creará un nuevo registro.</small>}
                        </div>
                        <div className={styles.formSubGrid}>
                            <div className={sharedStyles.inputGroup}>
                                <label>Capacidad</label>
                                <select name="capacidad" value={formData.capacidad} onChange={handleChange} required>
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className={sharedStyles.inputGroup}>
                                <label>Piso</label>
                                <select name="piso" value={formData.piso} onChange={handleChange} required>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Inventario (Cantidad)</label>
                            <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} required min="1" />
                            <small>Total de habitaciones físicas de este tipo.</small>
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Servicios (separados por coma)</label>
                            <textarea name="servicios" value={formData.servicios} onChange={handleChange} rows="2" placeholder="WiFi, TV Cable, etc." />
                        </div>
                    </div>
                    
                    <div className={styles.buttonGroupFullWidth}>
                        <button type="button" onClick={onClose} className={sharedStyles.cancelButton}>Cancelar</button>
                        <button type="submit" disabled={isSaveDisabled} className={sharedStyles.saveButton}>Guardar Habitación</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HabitacionModal;