import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfg/firebase';
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
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  KeyboardArrowDown,
  Close,
  ChevronRight,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme/theme';
import logo from '../../asset/logo.png';

export const PublicHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) setUserData({ email: user.email });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
    setMobileMenuOpen(false);
  };

  const publicLinks = [
    { label: 'Buscar Trabajo', path: '/buscar-trabajo' },
    { label: 'Buscar AT', path: '/buscar-acompanante' },
    { label: 'Sobre Nosotros', path: '/acompaniante-terapeutico' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(colors.surface, scrolled ? 0.97 : 0.88),
        backdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: `1px solid ${scrolled ? colors.border : alpha(colors.border, 0.3)}`,
        boxShadow: scrolled ? `0 1px 8px ${alpha('#000', 0.04)}` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: colors.textPrimary, mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo + Brand */}
          <Link
            to="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={logo}
                alt="El Canal del AT"
                sx={{
                  height: { xs: 34, md: 38 },
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: colors.textPrimary,
                    lineHeight: 1.1,
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  El Canal del AT
                </Typography>
                <Typography
                  sx={{
                    color: colors.textMuted,
                    fontSize: '0.625rem',
                    lineHeight: 1,
                    display: 'block',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  Conectando profesionales
                </Typography>
              </Box>
            </Box>
          </Link>

          {/* Desktop nav links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, ml: 6 }}>
              {publicLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? 600 : 500,
                      px: 2.25,
                      py: 0.75,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: active ? alpha(colors.primary, 0.08) : 'transparent',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: active ? alpha(colors.primary, 0.12) : alpha(colors.primary, 0.05),
                        color: colors.primary,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop auth */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="contained"
                    sx={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      fontWeight: 700,
                      px: 2.5,
                      py: 0.75,
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(colors.primary, 0.35)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Ir al Panel
                  </Button>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 0.5,
                      pr: 1.5,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
                    }}
                    onClick={handleMenuOpen}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        border: `2px solid ${alpha(colors.primary, 0.12)}`,
                        bgcolor: alpha(colors.primary, 0.08),
                        color: colors.primary,
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {userData?.email?.charAt(0).toUpperCase() || <Person sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <KeyboardArrowDown sx={{ fontSize: 18, color: colors.textMuted, ml: 0.75 }} />
                  </Box>
                </>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontWeight: 600,
                      px: 2.5,
                      py: 0.75,
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: alpha(colors.primary, 0.04),
                      },
                      transition: 'all 0.2s ease',
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
                      fontWeight: 700,
                      px: 2.5,
                      py: 0.75,
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                      '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(colors.primary, 0.35)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Registrarse
                  </Button>
                </Stack>
              )}
            </Box>
          )}

          {/* Mobile auth */}
          {isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="contained"
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: '8px',
                    boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                  }}
                >
                  Ir al Panel
                </Button>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Ingresar
                </Button>
              )}
            </Stack>
          )}
        </Toolbar>
      </Container>

      {/* Desktop user menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '14px',
            boxShadow: `0 24px 60px ${alpha('#000', 0.12)}`,
            border: `1px solid ${colors.border}`,
            minWidth: 200,
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -6,
              right: 22,
              width: 12,
              height: 12,
              backgroundColor: colors.surface,
              borderLeft: `1px solid ${colors.border}`,
              borderTop: `1px solid ${colors.border}`,
              transform: 'rotate(45deg)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {[
          { label: 'Ir al Panel', path: '/dashboard' },
          { label: 'Mi Cuenta', path: '/miCuenta' },
          { label: 'Mi Perfil', path: '/perfilLaboralUpdate' },
          { label: 'Mis Publicaciones', path: '/misPublicaciones' },
        ].map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleNavigate(item.path)}
            sx={{
              py: 1.25,
              px: 2,
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25,
              '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: 300, backgroundColor: colors.surface },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1.5 }} onClick={() => setMobileMenuOpen(false)}>
            <Box component="img" src={logo} alt="" sx={{ height: 34 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.875rem', color: colors.textPrimary }}>
                El Canal del AT
              </Typography>
              <Typography sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 500 }}>
                Conectando profesionales
              </Typography>
            </Box>
          </Link>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: colors.textMuted }}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Drawer nav links */}
        <List sx={{ pt: 1.5, px: 1.5 }}>
          {publicLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    px: 2,
                    backgroundColor: active ? alpha(colors.primary, 0.08) : 'transparent',
                    '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      color: active ? colors.primary : colors.textPrimary,
                      fontSize: '0.9375rem',
                    }}
                  />
                  {active && (
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.primary, flexShrink: 0 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Drawer footer auth */}
        <Box sx={{ p: 2.5, borderTop: `1px solid ${colors.border}` }}>
          {isAuthenticated ? (
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleNavigate('/dashboard')}
                sx={{
                  borderRadius: '8px', py: 1.25, fontWeight: 700, fontSize: '0.8125rem',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                }}
                endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
              >
                Ir al Panel
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleNavigate('/miCuenta')}
                sx={{ borderRadius: '8px', py: 1.25, fontWeight: 600, fontSize: '0.8125rem', borderColor: colors.border, color: colors.textPrimary }}
              >
                Mi Cuenta
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
                sx={{ borderRadius: '8px', py: 1.25, fontWeight: 600, fontSize: '0.8125rem', borderColor: colors.border, color: colors.textPrimary }}
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
                  borderRadius: '8px',
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                }}
              >
                Registrarse
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default PublicHeader;
