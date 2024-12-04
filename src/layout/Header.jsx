import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import '../components/css/NavBar.css';
import logo from '../asset/logo.png';
const MySwal = withReactContent(Swal);

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userRol, setUserRol] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRol(userData.userRol);
          } else {
            setUserRol('guest');
          }
        } catch (error) {
          setUserRol('guest');
        }
      } else {
        setUserRol('guest');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOutConfirmation = () => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        handleSignOut();
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
<AppBar className="app-bar" sx={{ backgroundColor: '#F3F3F3', boxShadow: 'none' }}>
  <Container maxWidth="lg">
    <Toolbar>
      {isMobile && (
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileMenu}
          className="menu-icon"
        >
          <MenuIcon sx={{ color: '#504683' }} />
        </IconButton>
      )}

      {/* Navegación */}
      {!isMobile && (
       <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
       <Typography variant="h4" className="logo">
         <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
           <img
             src={logo}
             alt="Logo"
             style={{
               background: 'transparent',
               maxHeight: '99px',
               filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))' // Corrected filter property
             }}
           />
         </Link>
       </Typography>
     </Box>
      )}

      {!isMobile && (
        <Box className="nav-links">
          {userRol === 'guest' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-trabajo"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Buscar Trabajo
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-acompanante"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Buscar AT
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/login"
                startIcon={<AccountCircle sx={{ color: '#504683' }} />}
              >
                Ingresar
              </Button>
            </>
          )}
          {userRol === 'reclutador' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-acompanante"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Inicio
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/misPublicaciones"
                startIcon={<EditIcon sx={{ color: '#504683' }} />}
              >
                Mis Publicaciones
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/cv-recibido"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                CV Recibidos
              </Button>
            </>
          )}
          {userRol === 'empleado' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-trabajo"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Inicio
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/miCuenta"
                startIcon={<AccountCircle sx={{ color: '#504683' }} />}
              >
                Mi Cuenta
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/cvEnvidos"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                CV Enviados
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/perfilLaboralUpdate"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                Mi Perfil Laboral
              </Button>
            </>
          )}
          {userRol !== 'guest' && (
            <Button
              color="primary"
              onClick={handleSignOutConfirmation}
              startIcon={<ExitToAppIcon sx={{ color: '#504683' }} />}
              sx={{ fontSize: '0.875rem', padding: '8px' }}
            >
              Cerrar Sesión
            </Button>
          )}
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={toggleMobileMenu}>
      <div style={{
  display: 'flex',
  justifyContent: 'center',  // Centra el contenido horizontalmente
  alignItems: 'center',      // Centra el contenido verticalmente
}}>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',  // Centra el contenido horizontalmente
      alignItems: 'center',      // Centra el contenido verticalmente
      borderRadius: '50%',       // Asegura que sea un círculo perfecto
      backgroundColor: '#F3F3F3',
      padding: '16px',           // Ajuste el padding para margen uniforme
      width: '120px',            // Tamaño del círculo
      height: '120px',           // Tamaño del círculo
      boxSizing: 'border-box',
      marginTop: 1,   // Asegura que el padding no afecte el tamaño total
    }}
  >
    <Link to="/" style={{ textDecoration: 'none' }}>
      <img
        src={logo}
        alt="Logo"
        style={{
          background: 'transparent',
          maxHeight: '99px',       // Controla la altura máxima de la imagen
          width: 'auto',           // Asegura que la imagen mantenga la proporción
        }}
      />
    </Link>
  </Box>
</div>
        <Box sx={{ width: 250, display: 'flex', flexDirection: 'column', padding: 2 }}>
          {userRol === 'guest' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-trabajo"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Buscar Trabajo
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-acompanante"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Buscar AT
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/login"
                startIcon={<AccountCircle sx={{ color: '#504683' }} />}
              >
                Ingresar
              </Button>
            </>
          )}
          {userRol === 'reclutador' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-acompanante"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Inicio
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/misPublicaciones"
                startIcon={<EditIcon sx={{ color: '#504683' }} />}
              >
                Mis Publicaciones
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/cv-recibido"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                CV Recibidos
              </Button>
            </>
          )}
          {userRol === 'empleado' && (
            <>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/buscar-trabajo"
                startIcon={<SearchIcon sx={{ color: '#504683' }} />}
              >
                Inicio
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/miCuenta"
                startIcon={<AccountCircle sx={{ color: '#504683' }} />}
              >
                Mi Cuenta
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/cvEnvidos"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                CV Enviados
              </Button>
              <Button
                color="primary"
                sx={{ color: '#504683', fontSize: '0.875rem', padding: '8px' }}
                component={Link}
                to="/perfilLaboralUpdate"
                startIcon={<VisibilityIcon sx={{ color: '#504683' }} />}
              >
                Mi Perfil Laboral
              </Button>
            </>
          )}
          {userRol !== 'guest' && (
            <Button
              color="primary"
              onClick={handleSignOutConfirmation}
              startIcon={<ExitToAppIcon sx={{ color: '#504683' }} />}
              sx={{ fontSize: '0.875rem', padding: '8px' }}
            >
              Cerrar Sesión
            </Button>
          )}
        </Box>
      </Drawer>
    </Toolbar>
  </Container>
</AppBar>
  );
};

export default Header;