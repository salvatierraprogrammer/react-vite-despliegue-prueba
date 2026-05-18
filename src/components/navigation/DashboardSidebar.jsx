import React, { useState, useEffect, memo } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Tooltip, IconButton, Divider } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfg/firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';
import {
  LayoutDashboard,
  Users,
  FileText,
  Send,
  User,
  LogOut,
  Home,
  Search,
  Mail,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Clock,
  UserPlus,
  Bell,
  Settings,
  HardDrive,
} from 'lucide-react';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;
const DRAWER_MOBILE = 280;

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'isOpen' && prop !== 'isMobile' })(
  ({ theme, isOpen, isMobile }) => ({
    '& .MuiDrawer-paper': {
      width: isMobile ? DRAWER_MOBILE : isOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowX: 'hidden',
      borderRight: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      boxShadow: isMobile ? 'none' : 'none',
    },
  })
);

const MenuItem = ({ item, isActive, isOpen, isMobile, onNavigate }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(item.path);
    if (isMobile) onNavigate?.();
  };

  const content = (
    <ListItemButton
      onClick={handleClick}
      sx={{
        mx: 1.5,
        mb: 0.5,
        borderRadius: '12px',
        minHeight: 44,
        justifyContent: isOpen ? 'flex-start' : 'center',
        px: isOpen ? 2 : 1.5,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: isActive ? alpha(colors.primary, 0.08) : 'transparent',
        position: 'relative',
        '&::before': isActive ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: 20,
          borderRadius: '0 3px 3px 0',
          backgroundColor: colors.primary,
        } : {},
        '&:hover': {
          backgroundColor: isActive ? alpha(colors.primary, 0.12) : alpha(colors.primary, 0.04),
          transform: isOpen ? 'translateX(2px)' : 'none',
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive ? alpha(colors.primary, 0.1) : 'transparent',
          color: isActive ? colors.primary : colors.textSecondary,
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </Box>
      {isOpen && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? colors.primary : colors.textPrimary,
          }}
          sx={{ ml: 1.5 }}
        />
      )}
      {isOpen && item.badge && (
        <Box
          sx={{
            ml: 'auto',
            minWidth: 20,
            height: 20,
            borderRadius: '10px',
            backgroundColor: colors.danger,
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 0.75,
          }}
        >
          {item.badge}
        </Box>
      )}
    </ListItemButton>
  );

  if (!isOpen && !isMobile) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
};

const UserSection = ({ userData, isOpen, userRol }) => {
  const roleLabels = {
    administrador: 'Administrador',
    reclutador: 'Reclutador',
    empleado: 'Acompañante AT',
    familiar: 'Familiar',
  };

  return (
    <Box sx={{ px: isOpen ? 2 : 1, py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: '14px',
          backgroundColor: alpha(colors.primary, 0.04),
          border: `1px solid ${alpha(colors.primary, 0.08)}`,
          cursor: 'default',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(colors.primary, 0.06),
            borderColor: alpha(colors.primary, 0.12),
          },
        }}
      >
        <Avatar
          src={userData?.photo || userData?.photoURL}
          sx={{
            width: isOpen ? 40 : 36,
            height: isOpen ? 40 : 36,
            border: `2px solid ${alpha(colors.primary, 0.2)}`,
            transition: 'all 0.2s ease',
          }}
        >
          {userData?.nombre?.charAt(0) || userData?.displayName?.charAt(0) || 'U'}
        </Avatar>
        {isOpen && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }}
              noWrap
            >
              {userData?.nombre || userData?.displayName || (userRol ? 'Usuario' : 'Invitado')}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6875rem' }}>
              {roleLabels[userRol] || userRol || (userRol ? 'Usuario' : 'Visitante')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const DashboardSidebar = ({ open, onToggle, mobileOpen, onMobileClose }) => {
  const { userData, userRol } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [hasPerfilLaboral, setHasPerfilLaboral] = useState(false);
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1200);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkPerfilLaboral = async () => {
      if (userRol === 'empleado') {
        setLoadingPerfil(true);
        try {
          const user = auth.currentUser;
          if (user) {
            const perfilSnap = await getDocs(query(
              collection(db, 'perfilesLaborales'),
              where('userId', '==', user.uid)
            ));
            setHasPerfilLaboral(!perfilSnap.empty);
          }
        } catch (error) {
          console.error('Error checking perfil laboral:', error);
        } finally {
          setLoadingPerfil(false);
        }
      }
    };

    checkPerfilLaboral();
  }, [userRol]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getMenuGroups = () => {
    switch (userRol) {
      case 'administrador':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Publicaciones', icon: FileText, path: '/misPublicaciones' },
              { label: 'Nueva Publicación', icon: Briefcase, path: '/nuevaPublicacion' },
            ],
          },
          {
            title: 'Gestión',
            items: [
              { label: 'Registros AT', icon: Sparkles, path: '/at-registrados' },
              { label: 'Pendientes', icon: Clock, path: '/usuarios-nuevos' },
            ],
          },
          {
            title: 'Comunicaciones',
            items: [
              { label: 'CVs Recibidos', icon: Mail, path: '/cv-recibido' },
              { label: 'CVs Enviados', icon: Send, path: '/cvEnvidos' },
            ],
          },
          {
            title: 'Sistema',
            items: [
              { label: 'Notificaciones', icon: Bell, path: '/notificaciones' },
              { label: 'Almacenamiento', icon: HardDrive, path: '/almacenamiento' },
              { label: 'Mi Perfil', icon: User, path: '/miCuenta' },
            ],
          },
        ];
      case 'reclutador':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Mis Publicaciones', icon: Briefcase, path: '/misPublicaciones' },
              { label: 'Nueva Publicación', icon: FileText, path: '/nuevaPublicacion' },
              { label: 'CVs Recibidos', icon: Mail, path: '/cv-recibido' },
            ],
          },
          {
            title: 'Búsqueda',
            items: [
              { label: 'Buscar AT', icon: Search, path: '/buscar-acompanante' },
            ],
          },
          {
            title: 'Perfil',
            items: [
              { label: 'Mi Cuenta', icon: User, path: '/miCuenta' },
            ],
          },
          {
            title: 'Sistema',
            items: [
              { label: 'Notificaciones', icon: Bell, path: '/notificaciones' },
            ],
          },
        ];
      case 'empleado':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Buscar Trabajo', icon: Search, path: '/buscar-trabajo' },
              { label: 'CVs Enviados', icon: Send, path: '/cvEnvidos' },
            ],
          },
          {
            title: 'Perfil',
            items: [
              { label: 'Mi Perfil Laboral', icon: User, path: '/perfilLaboralUpdate' },
              { label: 'Mi Cuenta', icon: Settings, path: '/miCuenta' },
            ],
          },
          {
            title: 'Sistema',
            items: [
              { label: 'Notificaciones', icon: Bell, path: '/notificaciones' },
            ],
          },
        ];
      case 'familiar':
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Inicio', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Mis Casos', icon: FileText, path: '/misPublicaciones' },
              { label: 'Publicar Caso', icon: Briefcase, path: '/nuevaPublicacion' },
              { label: 'CVs Recibidos', icon: Mail, path: '/cv-recibido' },
            ],
          },
          {
            title: 'Búsqueda',
            items: [
              { label: 'Buscar AT', icon: Search, path: '/buscar-acompanante' },
            ],
          },
          {
            title: 'Perfil',
            items: [
              { label: 'Mi Cuenta', icon: User, path: '/miCuenta' },
            ],
          },
          {
            title: 'Sistema',
            items: [
              { label: 'Notificaciones', icon: Bell, path: '/notificaciones' },
            ],
          },
        ];
      default:
        return [
          {
            title: 'Principal',
            items: [
              { label: 'Inicio', icon: Home, path: '/' },
              { label: 'Buscar Trabajo', icon: Search, path: '/buscar-trabajo' },
              { label: 'Buscar AT', icon: Users, path: '/buscar-acompanante' },
            ],
          },
          {
            title: 'Sistema',
            items: [
              { label: 'Notificaciones', icon: Bell, path: '/notificaciones' },
            ],
          },
        ];
    }
  };

  const menuGroups = getMenuGroups();
  const isCollapsed = !open && !isMobile;

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: colors.surface,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${colors.border}`,
          minHeight: 64,
        }}
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Sparkles size={18} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                El Canal del AT
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        <IconButton
          onClick={isMobile ? onMobileClose : onToggle}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            backgroundColor: alpha(colors.primary, 0.06),
            color: colors.textSecondary,
            '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
          }}
        >
          {isMobile ? <X size={16} /> : open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </IconButton>
      </Box>

      <UserSection userData={userData} isOpen={open} userRol={userRol} />

      <Box sx={{ flex: 1, px: 1, py: 1, overflowY: 'auto' }}>
        {mounted && menuGroups.map((group) => (
          <Box key={group.title} sx={{ mb: 2 }}>
            <Box sx={{ px: 1, py: 0.5 }}>
              <Typography
                variant="overline"
                sx={{
                  color: colors.textMuted,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  display: open ? 'block' : 'none',
                }}
              >
                {group.title}
              </Typography>
            </Box>
            <List sx={{ px: 0.5 }}>
              {group.items.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 }}
                >
                  <ListItem disablePadding>
                    <MenuItem
                      item={item}
                      isActive={location.pathname === item.path}
                      isOpen={open}
                      isMobile={isMobile}
                      onNavigate={onMobileClose}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ px: 1, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={userRol ? handleSignOut : () => navigate('/login')}
            sx={{
              mx: 1.5,
              mb: 0.5,
              borderRadius: '12px',
              minHeight: 44,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              px: isCollapsed ? 1.5 : 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(colors.danger, 0.06),
                transform: open ? 'translateX(2px)' : 'none',
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.danger,
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <LogOut size={20} strokeWidth={2} />
            </Box>
            {open && (
              <ListItemText
                primary={userRol ? 'Cerrar Sesión' : 'Iniciar Sesión'}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: colors.danger,
                }}
                sx={{ ml: 1.5 }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        isMobile={true}
      >
        {drawerContent}
      </StyledDrawer>
    );
  }

  return (
    <StyledDrawer variant="permanent" open={open} isOpen={open}>
      {drawerContent}
    </StyledDrawer>
  );
};

export default DashboardSidebar;
