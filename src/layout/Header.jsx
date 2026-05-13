import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  InputBase,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  Settings,
  Logout,
  Person,
  Dashboard,
  KeyboardArrowDown,
  Close,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { colors } from '../theme/theme';
import logo from '../asset/logo.png';

export const Header = () => {
  const [userRol, setUserRol] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRol(data.userRol);
            setUserData(data);
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

  const handleSignOut = async () => {
    handleMenuClose();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getMenuItems = () => {
    switch (userRol) {
      case 'reclutador':
        return [
          { label: 'Dashboard', path: '/dashboard-reclutador' },
          { label: 'Mis Publicaciones', path: '/misPublicaciones' },
          { label: 'CVs Recibidos', path: '/cv-recibido' },
          { label: 'Buscar AT', path: '/buscar-acompanante' },
        ];
      case 'empleado':
        return [
          { label: 'Inicio', path: '/buscar-trabajo' },
          { label: 'Mi Cuenta', path: '/miCuenta' },
          { label: 'CVs Enviados', path: '/cvEnvidos' },
          { label: 'Mi Perfil', path: '/perfilLaboralUpdate' },
        ];
      case 'administrador':
        return [
          { label: 'Dashboard', path: '/admin' },
          { label: 'Usuarios', path: '/ver-usuario' },
          { label: 'Reportes', path: '/admin' },
        ];
      default:
        return [
          { label: 'Buscar Trabajo', path: '/buscar-trabajo' },
          { label: 'Buscar AT', path: '/buscar-acompanante' },
          { label: 'Sobre Nosotros', path: '/acompaniante-terapeutico' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getInitials = () => {
    if (userData) {
      return `${userData.nombre?.[0] || ''}${userData.apellido?.[0] || ''}`.toUpperCase();
    }
    return '?';
  };

  const renderUserMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          borderRadius: '16px',
          boxShadow: `0 20px 40px ${alpha('#000', 0.15)}`,
          border: `1px solid ${colors.border}`,
          minWidth: 220,
          overflow: 'visible',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 20,
            width: 10,
            height: 10,
            bgcolor: colors.surface,
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
            borderLeft: `1px solid ${colors.border}`,
            borderTop: `1px solid ${colors.border}`,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {userData?.nombre} {userData?.apellido}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {userData?.email}
        </Typography>
      </Box>
      <MenuItem onClick={() => { navigate('/miCuenta'); handleMenuClose(); }} sx={{ py: 1.5 }}>
        <ListItemIcon><Person fontSize="small" /></ListItemIcon>
        Mi Cuenta
      </MenuItem>
      <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }} sx={{ py: 1.5 }}>
        <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
        Dashboard
      </MenuItem>
      <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
        <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
        Configuración
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleSignOut} sx={{ py: 1.5, color: colors.danger }}>
        <ListItemIcon><Logout fontSize="small" sx={{ color: colors.danger }} /></ListItemIcon>
        Cerrar Sesión
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(colors.surface, 0.85),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: colors.textPrimary, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src={logo}
              alt="El Canal del AT"
              sx={{
                height: { xs: 44, md: 52 },
                filter: `drop-shadow(0 2px 4px ${alpha('#000', 0.1)})`,
              }}
            />
          </Link>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 4 }}>
              {menuItems.slice(0, 4).map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: location.pathname === item.path ? colors.primary : colors.textSecondary,
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    px: 2,
                    py: 1,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.06),
                      color: colors.primary,
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {searchOpen ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: alpha(colors.primary, 0.06),
                    borderRadius: '12px',
                    px: 2,
                    py: 0.5,
                    width: 280,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                  <InputBase
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, fontSize: '0.875rem' }}
                    autoFocus
                  />
                  <IconButton size="small" onClick={() => setSearchOpen(false)}>
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ) : (
                <Tooltip title="Buscar">
                  <IconButton onClick={() => setSearchOpen(true)} sx={{ color: colors.textSecondary }}>
                    <Search />
                  </IconButton>
                </Tooltip>
              )}

              {userRol !== 'guest' && (
                <Tooltip title="Notificaciones">
                  <IconButton sx={{ color: colors.textSecondary }}>
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {userRol !== 'guest' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Tooltip title="Cuenta">
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                      <Avatar
                        src={userData?.photo}
                        sx={{
                          width: 40,
                          height: 40,
                          border: `2px solid ${alpha(colors.primary, 0.2)}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: colors.primary,
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {getInitials()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={handleMenuOpen} sx={{ ml: -0.5 }}>
                    <KeyboardArrowDown sx={{ fontSize: 18, color: colors.textSecondary }} />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontWeight: 500,
                      px: 3,
                      '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: alpha(colors.primary, 0.04),
                      },
                    }}
                  >
                    Ingresar
                  </Button>
                  <Button
                    component={Link}
                    to="/crearCuenta"
                    variant="contained"
                    sx={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      fontWeight: 600,
                      px: 3,
                      boxShadow: `0 4px 14px ${alpha(colors.primary, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(colors.primary, 0.4)}`,
                      },
                    }}
                  >
                    Registrarse
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              {userRol !== 'guest' && (
                <Tooltip title="Notificaciones">
                  <IconButton sx={{ color: colors.textSecondary }}>
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              {userRol !== 'guest' ? (
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    src={userData?.photo}
                    sx={{
                      width: 36,
                      height: 36,
                      border: `2px solid ${alpha(colors.primary, 0.2)}`,
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                </IconButton>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: colors.border }}
                >
                  Ingresar
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>

      {renderUserMenu()}

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: colors.surface,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderBottom: `1px solid ${colors.border}` }}>
          <Box component="img" src={logo} alt="El Canal del AT" sx={{ height: 52 }} />
        </Box>

        <List sx={{ pt: 2, px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(colors.primary, 0.1),
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? colors.primary : colors.textPrimary,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {userRol === 'guest' ? (
          <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              fullWidth
              onClick={() => setMobileMenuOpen(false)}
            >
              Ingresar
            </Button>
            <Button
              component={Link}
              to="/crearCuenta"
              variant="contained"
              fullWidth
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Registrarse
            </Button>
          </Box>
        ) : (
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={userData?.photo} sx={{ width: 48, height: 48 }}>
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {userData?.nombre} {userData?.apellido}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {userRol === 'empleado' ? 'Acompañante AT' : userRol}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Logout />}
              onClick={handleSignOut}
              sx={{
                borderColor: colors.danger,
                color: colors.danger,
                '&:hover': {
                  borderColor: colors.danger,
                  backgroundColor: alpha(colors.danger, 0.08),
                },
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  );
};

export default Header;
