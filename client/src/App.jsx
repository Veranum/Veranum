// client/src/App.jsx
import React, { lazy, Suspense } from 'react'; // Importa lazy y Suspense
import { Routes, Route } from 'react-router-dom';

// Componentes y Páginas (Layout y Comunes)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Contexto
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext'; // Asegúrate de que este provider esté en App.jsx si se usa globalmente

// --- Importaciones dinámicas con React.lazy() para Code Splitting ---
// Páginas Públicas
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HabitacionesPage = lazy(() => import('./pages/HabitacionesPage')); 
const NosotrosPage = lazy(() => import('./pages/NosotrosPage'));
const ServiciosPage = lazy(() => import('./pages/ServiciosPage'));
const CentrosDeEventosPage = lazy(() => import('./pages/CentrosDeEventosPage'));

// Páginas de Usuario
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const MisReservasPage = lazy(() => import('./pages/MisReservasPage'));
const MiCuentaPage = lazy(() => import('./pages/MiCuentaPage'));

// Páginas de Administración
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ManageReservasPage = lazy(() => import('./pages/ManageReservasPage'));
const ManageHabitacionesPage = lazy(() => import('./pages/ManageHabitacionesPage'));
const ManageUsuariosPage = lazy(() => import('./pages/ManageUsuariosPage')); 
const ManageHotelesPage = lazy(() => import('./pages/ManageHotelesPage'));
const ManageServiciosPage = lazy(() => import('./pages/ManageServiciosPage'));
const ManagePromocionesPage = lazy(() => import('./pages/ManagePromocionesPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));

const EventosDashboardPage = lazy(() => import('./pages/EventosDashboardPage'));
const ManageArriendosPage = lazy(() => import('./pages/ManageArriendosPage'));
const ManageSalonesPage = lazy(() => import('./pages/ManageSalonesPage')); // Asumo que esta es la página de salones

const RestaurantDashboardPage = lazy(() => import('./pages/RestaurantDashboardPage'));
const ManageProveedoresPage = lazy(() => import('./pages/ManageProveedoresPage'));
const ManageTiposInsumoPage = lazy(() => import('./pages/ManageTiposInsumoPage'));
const ManageInsumosPage = lazy(() => import('./pages/ManageInsumosPage'));

// Páginas de Tipos de Habitación (Si estas son páginas separadas y pesadas)
const RoomDoblePage = lazy(() => import('./pages/RoomDoblePage'));
const RoomIndividualPage = lazy(() => import('./pages/RoomIndividualPage'));
const RoomMatrimonialPage = lazy(() => import('./pages/RoomMatrimonialPage'));

// -------------------------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <ReservationProvider> {/* Envuelve las rutas con ReservationProvider si es global */}
        <div className="App">
          <Navbar />
          <main>
            {/* Envuelve tus Routes en un Suspense fallback para la carga diferida */}
            <Suspense fallback={<div>Cargando...</div>}> {/* Puedes poner un spinner o un componente de carga aquí */}
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/habitaciones" element={<HabitacionesPage />} />
                <Route path="/nosotros" element={<NosotrosPage />} />
                <Route path="/servicios" element={<ServiciosPage />} />
                <Route path="/eventos" element={<CentrosDeEventosPage />} />
                
                {/* Rutas de Detalle de Habitación (si son estáticas y pesadas) */}
                <Route path="/habitaciones/individual" element={<RoomIndividualPage />} />
                <Route path="/habitaciones/doble" element={<RoomDoblePage />} />
                <Route path="/habitaciones/matrimonial" element={<RoomMatrimonialPage />} />


                {/* Rutas de Usuario (Protegidas) */}
                <Route path="/reservar" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
                <Route path="/mis-reservas" element={<ProtectedRoute><MisReservasPage /></ProtectedRoute>} />
                <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuentaPage /></ProtectedRoute>} />

                {/* Rutas de Administración (Protegidas por rol) */}
                <Route path="/admin" element={<ProtectedRoute roles={['admin', 'gerente']}><AdminDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/reservas" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageReservasPage /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageUsuariosPage /></ProtectedRoute>} />
                <Route path="/admin/habitaciones" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageHabitacionesPage /></ProtectedRoute>} />
                <Route path="/admin/servicios" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageServiciosPage /></ProtectedRoute>} />
                <Route path="/admin/hoteles" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageHotelesPage /></ProtectedRoute>} />
                <Route path="/admin/promociones" element={<ProtectedRoute roles={['admin', 'gerente']}><ManagePromocionesPage /></ProtectedRoute>} />
                <Route path="/admin/reportes"element={<ProtectedRoute roles={['admin', 'gerente']}><AdminReportsPage /></ProtectedRoute>} />
                
                <Route path="/admin/eventos" element={<ProtectedRoute roles={['admin', 'gerente']}><EventosDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/eventos/arriendos" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageArriendosPage /></ProtectedRoute>} />
                <Route path="/admin/eventos/salones" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageSalonesPage /></ProtectedRoute>} /> {/* Asumo esta ruta */}


                <Route path="/admin/restaurant" element={<ProtectedRoute roles={['admin', 'gerente']}><RestaurantDashboardPage /></ProtectedRoute>} />
                <Route path="/admin/restaurant/proveedores" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageProveedoresPage /></ProtectedRoute>} />
                <Route path="/admin/restaurant/tipos-insumo" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageTiposInsumoPage /></ProtectedRoute>} />
                <Route path="/admin/restaurant/inventario" element={<ProtectedRoute roles={['admin', 'gerente']}><ManageInsumosPage /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ReservationProvider>
    </AuthProvider>
  );
}

export default App;