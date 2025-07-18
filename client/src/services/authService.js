// src/services/authService.js
import api from './api';
import { jwtDecode } from 'jwt-decode';

export const login = async (identificador, password) => {
  const response = await api.post('/auth/login', { identificador, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', { ...userData, rol: 'cliente' });
   if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
        return jwtDecode(token);
    }
    return null;
  } catch (error) {
    return null;
  }
};