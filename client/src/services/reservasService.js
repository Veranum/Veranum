// src/services/reservasService.js
import api from './api';

export const getAvailableRooms = async (fecha_inicio, fecha_fin, hotelId) => {
  const params = new URLSearchParams({ fecha_inicio, fecha_fin });
  // --- CORRECCIÓN: Se asegura de que hotelId sea una cadena válida antes de añadirlo ---
  if (typeof hotelId === 'string' && hotelId) {
    params.append('hotelId', hotelId);
  }
  const response = await api.get(`/reservas/disponibles?${params.toString()}`);
  return response.data;
};

export const createReservation = async (reservationData) => {
  const response = await api.post('/reservas', reservationData);
  return response.data;
};

export const getServiciosByHotel = async (hotelId) => {
    // --- CORRECCIÓN: Se valida que hotelId sea una cadena válida antes de llamar a la API ---
    if (!hotelId || typeof hotelId !== 'string') {
        console.error("getServiciosByHotel: se intentó llamar con un hotelId inválido.", hotelId);
        return { data: [] }; // Devuelve un array vacío para no romper la aplicación
    }
    const response = await api.get(`/servicios/hotel/${hotelId}`);
    return response.data;
};

export const getMisReservas = async () => {
    const response = await api.get('/reservas/mis-reservas');
    return response.data;
};

export const cancelarReserva = async (reservaId) => {
    const response = await api.patch(`/reservas/mis-reservas/${reservaId}/cancelar`);
    return response.data;
};

export const validarCodigoPromocion = async (codigo) => {
    if (!codigo) return null;
    // --- CAMBIO: Se ajusta la URL para que coincida con la nueva ruta del backend ---
    const response = await api.get(`/promociones/validar/${codigo}`);
    return response.data;
};