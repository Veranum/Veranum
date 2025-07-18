// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes y Páginas
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Contexto
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';

// Páginas Públicas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HabitacionesPage from './pages/HabitacionesPage'; 
import NosotrosPage from './pages/NosotrosPage';
import ServiciosPage from './pages/ServiciosPage';
import CentrosDeEventosPage from './pages/CentrosDeEventosPage';

// Páginas de Usuario
import ReservationsPage from './pages/ReservationsPage';
import MisReservasPage from './pages/MisReservasPage';
import MiCuentaPage from './pages/MiCuentaPage';

// Páginas de Administración
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageReservasPage from './pages/ManageReservasPage';
import ManageHabitacionesPage from './pages/ManageHabitacionesPage';
import ManageUsuariosPage from './pages/ManageUsuariosPage'; // <-- La ruta principal de usuarios
import ManageHotelesPage from './pages/ManageHotelesPage';
import ManageServiciosPage from './pages/ManageServiciosPage';
import ManagePromocionesPage from './pages/ManagePromocionesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ManageEventosPage from './pages/ManageEventosPage';
import ManageArriendosPage from './pages/ManageArriendosPage';
import RestaurantDashboardPage from './pages/RestaurantDashboardPage';
import ManageProveedoresPage from './pages/ManageProveedoresPage';
import ManageTiposInsumoPage from './pages/ManageTiposInsumoPage';
import ManageInsumosPage from './pages/ManageInsumosPage';

function App() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, backgroundColor: 'var(--color-background)' }}>
          <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/habitaciones" element={<HabitacionesPage />} /> 
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/eventos" element={<CentrosDeEventosPage />} />
            
            {/* --- Rutas Protegidas de Usuario --- */}
            <Route path="/reservar" element={<ProtectedRoute><ReservationProvider><ReservationsPage /></ReservationProvider></ProtectedRoute>} />
            <Route path="/mis-reservas" element={<ProtectedRoute><MisReservasPage /></ProtectedRoute>} />
            <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuentaPage /></ProtectedRoute>} />
            
            {/* --- Rutas de Administración --- */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin', 'gerente']}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/reservas" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageReservasPage /></ProtectedRoute>} />
            <Route path="/admin/habitaciones" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageHabitacionesPage /></ProtectedRoute>} />
            <Route path="/admin/servicios" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageServiciosPage /></ProtectedRoute>} />
            {/* --- CAMBIO: La ruta ahora apunta directamente a ManageUsuariosPage --- */}
            <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageUsuariosPage /></ProtectedRoute>} />
            <Route path="/admin/hoteles" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageHotelesPage /></ProtectedRoute>} />
            <Route path="/admin/promociones" element={<ProtectedRoute roles={['admin', 'gerente']}><ManagePromocionesPage /></ProtectedRoute>} />
            <Route path="/admin/reportes"element={<ProtectedRoute roles={['admin', 'gerente']}><AdminReportsPage /></ProtectedRoute>} />
            
            <Route path="/admin/eventos" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageEventosPage /></ProtectedRoute>} />
            <Route path="/admin/eventos/arriendos" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageArriendosPage /></ProtectedRoute>} />

            <Route path="/admin/restaurant" element={<ProtectedRoute roles={['admin', 'gerente']}><RestaurantDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/restaurant/proveedores" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageProveedoresPage /></ProtectedRoute>} />
            <Route path="/admin/restaurant/tipos-insumo" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageTiposInsumoPage /></ProtectedRoute>} />
            <Route path="/admin/restaurant/inventario" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageInsumosPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;