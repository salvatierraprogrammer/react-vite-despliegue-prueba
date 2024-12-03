import './App.css';
import Show from './components/Show';
import Create from './components/Create';
import Edit from './components/Edit';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BuscarTrabajo from './components/BuscarTrabajo';
import BuscarAcompanante from './components/BuscarAcompanante';
import ShowPerfilAt from './components/ShowPerfilAt';
import MisPublicaciones from './components/MisPublicaciones';
import NuevaPublicacion from './components/NuevaPublicacion';
import MiCuenta from './components/MiCuenta';
import CvEnviados from './components/CvEnviados';
import PerfilLaboralUpdate from './components/PerfilLaboralUpdate';
import Login from './auth/Login';
import CrearCuenta from './auth/CrearCuenta';
import EditarPerfilLaboral from './components/EditarPerfilLaboral';
import CrearPerfilLaboral from './components/CrearPerfilLaboral';
import Header from './layout/Header';
import Footer from './layout/Footer';
import VerCaso from './components/VerCaso';
import Administrador from './components/Administrador';
import UsuariosNuevos from './components/UsuariosNuevos';
import VerUsuarios from './components/VerUsuarios';
import CvRecibido from './components/CvRecibido';
import Iniciar from './components/Iniciar';
import GenerarFlyer from './components/GenerarFlyer';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // o 'dark', dependiendo de tu preferencia
    primary: {
      main: '#1976d2',
    
    },
    secondary: {
      main: '#dc004e',
    },
    default: {
      main: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

function App() {
  return (
    <div className="App" >
      <Router>
      {/* <Router basename="/acompaniante-terapeutico"> */}
        <ThemeProvider theme={theme}>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path='/' element={<Show />} />
              <Route path='/acompaniante-terapeutico' element={<Iniciar />} />
              <Route path='/buscar-trabajo' element={<BuscarTrabajo />} />
              <Route path='/buscar-acompanante' element={<BuscarAcompanante />} />
              <Route path='/showPerfil/:id' element={<ShowPerfilAt />} />
              <Route path='/misPublicaciones' element={<MisPublicaciones />} />
              <Route path='/nuevaPublicacion' element={<NuevaPublicacion />} />
              <Route path='/perfilLaboralUpdate' element={<PerfilLaboralUpdate />} />
              <Route path='/cvEnvidos' element={<CvEnviados />} />
              <Route path='/login' element={<Login />} />
              <Route path='/crearCuenta' element={<CrearCuenta />} />
              <Route path='/editarPerfilLaboral' element={<EditarPerfilLaboral />} />
              <Route path="/crear-perfil-laboral" element={<CrearPerfilLaboral />} />
              <Route path='/miCuenta' element={<MiCuenta />} />
              <Route path='/admin' element={<Administrador />} />
              <Route path='/usuarios-nuevos' element={<UsuariosNuevos />} />
              <Route path='/generarFlyer/:id' element={<GenerarFlyer />} />
              <Route path='/verCaso/:id' element={<VerCaso />} />
              <Route path='/ver-usuario/:id' element={<VerUsuarios />} />
              <Route path='/cv-recibido' element={<CvRecibido />} />
              <Route path='/create' element={<Create />} />
              <Route path='/edit/:id' element={<Edit />} />
            </Routes>
          </main>
          <Footer />
        </ThemeProvider>
      </Router>
    </div>
  );
}

export default App;
