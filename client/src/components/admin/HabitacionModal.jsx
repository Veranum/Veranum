//client\\src/components\\admin\\HabitacionModal.jsx
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
    const [inputErrors, setInputErrors] = useState({});

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
                    precio: habitacion.precio?.toString() || '',
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
            setInputErrors({}); // Limpiar errores al abrir el modal
        }
    }, [habitacion, show, hoteles, defaultHotelId]);

    if (!show) return null;

    const validateField = (name, value) => {
        let errorMessage = '';
        if (!value && ['hotel_id', 'nombre', 'descripcion', 'categoria', 'capacidad', 'piso', 'cantidad', 'precio'].includes(name)) {
            errorMessage = 'Este campo es obligatorio.';
        } else if (['capacidad', 'piso', 'cantidad', 'precio'].includes(name)) {
            const numValue = Number(value);
            if (value === '' || isNaN(numValue) || numValue <= 0) { // Manejar string vacío y 0 para números
                errorMessage = 'Debe ser un número positivo.';
            }
            if (name === 'cantidad' && numValue < 1) {
                errorMessage = 'Debe haber al menos 1 habitación de este tipo.';
            }
        } else if (name === 'imagenUrl' && value && !/^https?:\\+\\.(png|jpe?g|gif|webp)$/i.test(value)) {
            // Se corrigió la expresión regular escapando las barras inclinadas dobles
            errorMessage = 'URL de imagen no válida.';
        }
        setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
        return errorMessage === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validar todos los campos al enviar
        const fieldsToValidate = ['hotel_id', 'nombre', 'descripcion', 'categoria', 'capacidad', 'piso', 'cantidad', 'precio', 'imagenUrl'];
        let formIsValid = true;
        fieldsToValidate.forEach(field => {
            if (!validateField(field, formData[field])) {
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            alert('Por favor, corrija los errores en el formulario.');
            return;
        }

        const { precio, ...detallesHabitacion } = formData;
        const dataToSave = {
            ...detallesHabitacion,
            capacidad: parseInt(formData.capacidad, 10),
            piso: parseInt(formData.piso, 10),
            cantidad: parseInt(formData.cantidad, 10),
            precio: parseFloat(precio), // Asegúrate de que el precio se envíe como número
            servicios: formData.servicios.split(',').map(s => s.trim()).filter(Boolean)
        };
        
        onSave(dataToSave);
    };

    const isSaveDisabled = Object.values(inputErrors).some(err => err !== '') ||
                           !formData.hotel_id || !formData.precio || !formData.nombre || 
                           !formData.descripcion || !formData.capacidad || !formData.piso || !formData.cantidad ||
                           Number(formData.precio) <= 0 || Number(formData.capacidad) <= 0 || Number(formData.piso) <= 0 || Number(formData.cantidad) <= 0;

    return (
        <div className={sharedStyles.modalOverlay}>
            <div className={`${sharedStyles.modalContent} ${sharedStyles.largeModal}`}>
                <h2 className={sharedStyles.modalTitle}>{habitacion ? `Editar Habitación Nº ${habitacion._id}` : 'Crear Nueva Habitación'}</h2>
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
                            <input 
                                type="text" 
                                name="imagenUrl" 
                                value={formData.imagenUrl} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                placeholder="https://ejemplo.com/imagen.jpg" 
                                className={inputErrors.imagenUrl ? sharedStyles.inputError : (formData.imagenUrl && !inputErrors.imagenUrl ? sharedStyles.inputSuccess : '')}
                            />
                            {inputErrors.imagenUrl && <p className={sharedStyles.inputErrorMessage}>{inputErrors.imagenUrl}</p>}
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Nombre de la Habitación</label>
                            <input 
                                type="text" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.nombre ? sharedStyles.inputError : (formData.nombre && !inputErrors.nombre ? sharedStyles.inputSuccess : '')}
                            />
                            {inputErrors.nombre && <p className={sharedStyles.inputErrorMessage}>{inputErrors.nombre}</p>}
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Descripción</label>
                            <textarea 
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                rows="4" 
                                required 
                                className={inputErrors.descripcion ? sharedStyles.inputError : (formData.descripcion && !inputErrors.descripcion ? sharedStyles.inputSuccess : '')}
                            />
                            {inputErrors.descripcion && <p className={sharedStyles.inputErrorMessage}>{inputErrors.descripcion}</p>}
                        </div>
                    </div>

                    <div className={styles.formColumn}>
                        <div className={sharedStyles.inputGroup}>
                            <label>Hotel de Pertenencia</label>
                            <select 
                                name="hotel_id" 
                                value={formData.hotel_id} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                className={inputErrors.hotel_id ? sharedStyles.inputError : (formData.hotel_id && !inputErrors.hotel_id ? sharedStyles.inputSuccess : '')}
                            >
                                <option value="">Seleccione un hotel</option>
                                {hoteles?.map(hotel => (
                                    <option key={hotel._id} value={hotel._id}>{hotel.nombre}</option>
                                ))}
                            </select>
                            {inputErrors.hotel_id && <p className={sharedStyles.inputErrorMessage}>{inputErrors.hotel_id}</p>}
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Categoría</label>
                            <select 
                                name="categoria" 
                                value={formData.categoria} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                className={inputErrors.categoria ? sharedStyles.inputError : ''}
                            >
                                <option value="individual">Individual</option>
                                <option value="doble">Doble</option>
                                <option value="matrimonial">Matrimonial</option>
                                <option value="suite-junior">Junior Suite</option>
                                <option value="familiar">Familiar</option>
                            </select>
                            {inputErrors.categoria && <p className={sharedStyles.inputErrorMessage}>{inputErrors.categoria}</p>}
                        </div>
                         <div className={sharedStyles.inputGroup}>
                            <label>Precio por Noche</label>
                            <input 
                                type="number" 
                                name="precio" 
                                value={formData.precio} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="0" 
                                placeholder="$50000" 
                                className={inputErrors.precio ? sharedStyles.inputError : (formData.precio && !inputErrors.precio ? sharedStyles.inputSuccess : '')}
                            />
                            {inputErrors.precio && <p className={sharedStyles.inputErrorMessage}>{inputErrors.precio}</p>}
                            {habitacion && <small>Si cambia el precio, se creará un nuevo registro.</small>}
                        </div>
                        <div className={styles.formSubGrid}>
                            <div className={sharedStyles.inputGroup}>
                                <label>Capacidad</label>
                                <select 
                                    name="capacidad" 
                                    value={formData.capacidad} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    required 
                                    className={inputErrors.capacidad ? sharedStyles.inputError : (formData.capacidad && !inputErrors.capacidad ? sharedStyles.inputSuccess : '')}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                {inputErrors.capacidad && <p className={sharedStyles.inputErrorMessage}>{inputErrors.capacidad}</p>}
                            </div>
                            <div className={sharedStyles.inputGroup}>
                                <label>Piso</label>
                                <select 
                                    name="piso" 
                                    value={formData.piso} 
                                    onChange={handleChange} 
                                    onBlur={handleBlur}
                                    required 
                                    className={inputErrors.piso ? sharedStyles.inputError : (formData.piso && !inputErrors.piso ? sharedStyles.inputSuccess : '')}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                {inputErrors.piso && <p className={sharedStyles.inputErrorMessage}>{inputErrors.piso}</p>}
                            </div>
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Inventario (Cantidad)</label>
                            <input 
                                type="number" 
                                name="cantidad" 
                                value={formData.cantidad} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                required 
                                min="1" 
                                className={inputErrors.cantidad ? sharedStyles.inputError : (formData.cantidad && !inputErrors.cantidad ? sharedStyles.inputSuccess : '')}
                            />
                            {inputErrors.cantidad && <p className={sharedStyles.inputErrorMessage}>{inputErrors.cantidad}</p>}
                            <small>Total de habitaciones físicas de este tipo.</small>
                        </div>
                        <div className={sharedStyles.inputGroup}>
                            <label>Servicios (separados por coma)</label>
                            <textarea 
                                name="servicios" 
                                value={formData.servicios} 
                                onChange={handleChange} 
                                onBlur={handleBlur}
                                rows="2" 
                                placeholder="WiFi, TV Cable, etc." 
                                className={inputErrors.servicios ? sharedStyles.inputError : ''}
                            />
                            {inputErrors.servicios && <p className={sharedStyles.inputErrorMessage}>{inputErrors.servicios}</p>}
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