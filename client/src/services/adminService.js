// src/services/adminService.js
import api from './api';

// --- GESTIÓN DE HOTELES ---
export const getAllHotelesAdmin = async () => {
    const response = await api.get('/hoteles');
    return response.data;
};
export const createHotel = async (hotelData) => {
    const response = await api.post('/hoteles', hotelData);
    return response.data;
};
export const updateHotel = async (id, hotelData) => {
    const response = await api.put(`/hoteles/${id}`, hotelData);
    return response.data;
};
export const deleteHotel = async (id) => {
    const response = await api.delete(`/hoteles/${id}`);
    return response.data;
};


// --- GESTIÓN DE HABITACIONES ---
export const getHabitacionesAdminStatus = async (hotelId) => {
    const response = await api.get(`/habitaciones/admin/status?hotelId=${hotelId || ''}`);
    return response.data;
};

export const getHabitacionesByHotel = async (hotelId, fecha_inicio, fecha_fin) => {
    const params = new URLSearchParams();
    if (hotelId) params.append('hotelId', hotelId);
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);
    
    const response = await api.get(`/habitaciones?${params.toString()}`);
    return response.data;
};

export const createHabitacion = async (data) => {
    const response = await api.post('/habitaciones', data);
    return response.data;
};
// --- CORRECCIÓN: Se elimina el prefijo /admin de la ruta ---
export const updateHabitacion = async (id, data) => {
    const response = await api.put(`/habitaciones/${id}`, data);
    return response.data;
};
// --- CORRECCIÓN: Se elimina el prefijo /admin de la ruta ---
export const deleteHabitacion = async (id) => {
    const response = await api.delete(`/habitaciones/${id}`);
    return response.data;
};

// --- GESTIÓN DE PRECIOS ---
export const setNuevoPrecioHabitacion = async (datosPrecio) => {
    // datosPrecio debe ser un objeto como { habitacion_id: 100, valor: 55000 }
    const response = await api.post('/precios', datosPrecio);
    return response.data;
};


// --- GESTIÓN DE RESERVAS ---
export const getReservas = async () => {
  const response = await api.get('/reservas/admin/all');
  return response.data;
};
export const getReservasByRun = async (run) => {
    const response = await api.get(`/reservas/admin/usuario/${run}`);
    return response.data;
};
export const updateReserva = async (id, data) => {
  const response = await api.put(`/reservas/admin/${id}`, data);
  return response.data;
};
export const deleteReserva = async (id) => {
  const response = await api.delete(`/reservas/admin/${id}`);
  return response.data;
};
export const createReservaAdmin = async (data) => {
  const response = await api.post('/reservas/admin', data);
  return response.data;
};


// --- GESTIÓN DE USUARIOS ---
export const getAllUsers = async (page = 1, limit = 8, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
    }
    if (filters.roleFilter && filters.roleFilter !== 'all') {
        params.append('roleFilter', filters.roleFilter);
    }
    const response = await api.get(`/usuarios/admin/all?${params.toString()}`);
    return response.data;
};
export const createUserAdmin = async (userData) => {
    const response = await api.post('/usuarios/admin/create', userData);
    return response.data;
};
export const updateUserAdmin = async (id, userData) => {
    const response = await api.put(`/usuarios/admin/${id}`, userData);
    return response.data;
};
export const deleteUserAdmin = async (id) => {
    const response = await api.delete(`/usuarios/admin/${id}`);
    return response.data;
};

// --- GESTIÓN DE SERVICIOS (NUEVA SECCIÓN) ---
export const getServiciosByHotelAdmin = async (hotelId) => {
    if (!hotelId) return { data: [] };
    const response = await api.get(`/servicios/hotel/${hotelId}`);
    return response.data;
};
export const createServicio = async (data) => {
    const response = await api.post('/servicios', data);
    return response.data;
};
export const updateServicio = async (id, data) => {
    const response = await api.put(`/servicios/${id}`, data);
    return response.data;
};
export const deleteServicio = async (id) => {
    const response = await api.delete(`/servicios/${id}`);
    return response.data;
};

// --- NUEVA FUNCIÓN REPORTES ---
// --- CAMBIO: La función ahora acepta el mes y el año como parámetros ---
export const getReporteGeneral = async (filters) => {
    const params = new URLSearchParams();
    
    // Añade todos los filtros que tengan un valor al objeto de parámetros
    for (const key in filters) {
        if (filters[key]) {
            params.append(key, filters[key]);
        }
    }

    const response = await api.get(`/reportes/general?${params.toString()}`);
    return response.data;
};



// --- GESTIÓN DE CENTROS DE EVENTOS ---
export const getAllCentrosEvento = async () => {
    const response = await api.get('/eventos/centros');
    return response.data;
};

export const createCentroEvento = async (data) => {
    const response = await api.post('/eventos/centros', data);
    return response.data;
};

export const updateCentroEvento = async (id, data) => {
    const response = await api.put(`/eventos/centros/${id}`, data);
    return response.data;
};

export const deleteCentroEvento = async (id) => {
    const response = await api.delete(`/eventos/centros/${id}`);
    return response.data;
};

export const getArriendosByCentro = async (centroId) => {
    if (!centroId) return { data: [] };
    const response = await api.get(`/eventos/arriendos/centro/${centroId}`);
    return response.data;
};

// --- AÑADIR ESTA FUNCIÓN ---
export const updateArriendoEvento = async (id, data) => {
    const response = await api.put(`/eventos/arriendos/${id}`, data);
    return response.data;
}

// --- FUNCIÓN QUE FALTABA ---
export const deleteArriendo = async (id) => {
    const response = await api.delete(`/eventos/arriendos/${id}`);
    return response.data;
};

export const createArriendoEvento = async (data) => {
    const response = await api.post('/eventos/arriendos', data);
    return response.data;
};

export const getAllArriendos = async () => {
    const response = await api.get('/eventos/arriendos');
    return response.data;
};

// --- GESTIÓN DE PROMOCIONES ---
export const getAllPromociones = async () => {
    const response = await api.get('/promociones');
    return response.data;
};
export const createPromocion = async (data) => {
    const response = await api.post('/promociones', data);
    return response.data;
};
export const updatePromocion = async (id, data) => {
    const response = await api.put(`/promociones/${id}`, data);
    return response.data;
};
export const deletePromocion = async (id) => {
    const response = await api.delete(`/promociones/${id}`);
    return response.data;
};

// --- GESTIÓN DE RESTAURANT ---

// Proveedores
export const getAllProveedores = async () => {
    const response = await api.get('/restaurant/proveedores');
    return response.data;
};
export const createProveedor = async (data) => {
    const response = await api.post('/restaurant/proveedores', data);
    return response.data;
};
export const updateProveedor = async (id, data) => {
    const response = await api.put(`/restaurant/proveedores/${id}`, data);
    return response.data;
};
export const deleteProveedor = async (id) => {
    const response = await api.delete(`/restaurant/proveedores/${id}`);
    return response.data;
};

// Tipos de Insumo
export const getAllTiposInsumo = async (hotelId = '') => {
    const response = await api.get(`/restaurant/tipos-insumo?hotelId=${hotelId}`);
    return response.data;
};
export const createTipoInsumo = async (data) => {
    const response = await api.post('/restaurant/tipos-insumo', data);
    return response.data;
};
export const updateTipoInsumo = async (id, data) => {
    const response = await api.put(`/restaurant/tipos-insumo/${id}`, data);
    return response.data;
};
export const deleteTipoInsumo = async (id) => {
    const response = await api.delete(`/restaurant/tipos-insumo/${id}`);
    return response.data;
};

// Insumos (Inventario)
export const getAllInsumos = async (hotelId) => { // Ahora acepta hotelId
    let url = '/restaurant/insumos';
    if (hotelId) {
        url += `?hotelId=${hotelId}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const createInsumo = async (data) => {
    const response = await api.post('/restaurant/insumos', data);
    return response.data;
};
export const updateInsumo = async (id, data) => {
    const response = await api.put(`/restaurant/insumos/${id}`, data);
    return response.data;
};
export const deleteInsumo = async (id) => {
    const response = await api.delete(`/restaurant/insumos/${id}`);
    return response.data;
};
export const updateInsumoStock = async (id, cantidad) => {
    const response = await api.patch(`/restaurant/insumos/${id}/stock`, { cantidad });
    return response.data;
};
