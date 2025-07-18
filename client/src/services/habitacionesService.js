import api from './api';

// Función para obtener TODAS las habitaciones desde la API
export const getAllHabitaciones = async () => {
  const response = await api.get('/habitaciones');
  return response.data;
};

export const getHabitacionesAdminStatus = async (hotelId) => {
    const response = await api.get(`/habitaciones/admin/status?hotelId=${hotelId || ''}`);
    return response.data;
};