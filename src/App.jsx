import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Show from './pages/public/Show';
import Iniciar from './pages/public/Iniciar';
import BuscarTrabajo from './pages/at/BuscarTrabajo';
import BuscarAcompanante from './pages/public/BuscarAcompanante';
import ShowPerfilAt from './pages/at/ShowPerfilAt';
import ShowPerfilReclutador from './pages/reclutador/ShowPerfilReclutador';
import Login from './auth/Login';
import CrearCuenta from './auth/CrearCuenta';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import MisPublicaciones from './pages/reclutador/MisPublicaciones';
import NuevaPublicacion from './pages/reclutador/NuevaPublicacion';
import CvEnviados from './pages/at/CvEnviados';
import CvRecibido from './pages/reclutador/CvRecibido';
import MiCuenta from './pages/at/MiCuenta';
import PerfilLaboralUpdate from './pages/at/PerfilLaboralUpdate';
import EditarPerfilLaboral from './pages/at/EditarPerfilLaboral';
import CrearPerfilLaboral from './pages/at/CrearPerfilLaboral';
import VerCaso from './pages/familiar/VerCaso';
import Administrador from './pages/admin/Administrador';
import UsuariosNuevos from './pages/admin/UsuariosNuevos';
import VerUsuarios from './pages/admin/VerUsuarios';
import ATRegistrados from './pages/admin/ATRegistrados';
import ATDetalle from './pages/admin/ATDetalle';
import GenerarFlyer from './pages/familiar/GenerarFlyer';
import EditarPublicacion from './pages/reclutador/EditarPublicacion';
import DashboardAT from './pages/at/DashboardAT';
import DashboardReclutador from './pages/reclutador/DashboardReclutador';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import { useAuth } from './context/AuthContext';

function RoleDashboard() {
  const { user, userRol, loading } = useAuth();
  if (loading || !user) return null;
  try {
    if (userRol === 'administrador') return <DashboardAdmin />;
    if (userRol === 'reclutador') return <DashboardReclutador />;
    return <DashboardAT />;
  } catch (e) {
    console.error('Dashboard error:', e);
    return <DashboardAT />;
  }
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Show />} />
              <Route path="/acompaniante-terapeutico" element={<Iniciar />} />
              <Route path="/showPerfilReclutador/:id" element={<ShowPerfilReclutador />} />
              <Route path="/login" element={<Login />} />
              <Route path="/crearCuenta" element={<CrearCuenta />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<RoleDashboard />} />
                <Route path="/buscar-trabajo" element={<BuscarTrabajo />} />
                <Route path="/buscar-acompanante" element={<BuscarAcompanante />} />
                <Route path="/showPerfil/:id" element={<ShowPerfilAt />} />
                <Route path="/showPerfilReclutador/:id" element={<ShowPerfilReclutador />} />
                <Route path="/admin" element={<Administrador />} />
                <Route path="/misPublicaciones" element={<MisPublicaciones />} />
                <Route path="/nuevaPublicacion" element={<NuevaPublicacion />} />
                <Route path="/editar-publicacion/:id" element={<EditarPublicacion />} />
                <Route path="/cvEnvidos" element={<CvEnviados />} />
                <Route path="/miCuenta" element={<MiCuenta />} />
                <Route path="/perfilLaboralUpdate" element={<PerfilLaboralUpdate />} />
                <Route path="/editarPerfilLaboral" element={<EditarPerfilLaboral />} />
                <Route path="/editarPerfilLaboral/:id" element={<EditarPerfilLaboral />} />
                <Route path="/crear-perfil-laboral" element={<CrearPerfilLaboral />} />
                <Route path="/usuarios-nuevos" element={<UsuariosNuevos />} />
                <Route path="/ver-usuario/:id" element={<VerUsuarios />} />
                <Route path="/at-registrados" element={<ATRegistrados />} />
                <Route path="/at-registrados/:id" element={<ATDetalle />} />
                <Route path="/verCaso/:id" element={<VerCaso />} />
                <Route path="/cv-recibido" element={<CvRecibido />} />
                <Route path="/generarFlyer/:id" element={<GenerarFlyer />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;