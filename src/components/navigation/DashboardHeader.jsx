import React, { useState, useEffect, memo } from 'react';
import { Box, InputBase, IconButton, Badge, Avatar, Menu, MenuItem, Typography, Divider, ListItemIcon, Tooltip, Chip, Dialog, DialogTitle, DialogContent, List, ListItemButton, ListItemText } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfg/firebase';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { IntelligentBreadcrumb } from '../breadcrumb';
import { colors } from '../../theme/theme';
import {
  Search,
  Bell,
  Menu as MenuIcon,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  HelpCircle,
  LayoutDashboard,
  Keyboard,
  Trash2,
  X,
} from 'lucide-react';

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: alpha(colors.surface, 0.85),
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${colors.border}`,
  transition: 'all 0.2s ease',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: colors.surfaceSecondary,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  padding: '8px 16px',
  minWidth: 320,
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.08)}`,
    backgroundColor: colors.surface,
  },
}));

const NotificationItem = memo(({ notification, onClick, onDelete }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1,
      p: 2,
      '&:hover': { backgroundColor: alpha(colors.primary, 0.04) },
      cursor: 'pointer',
      position: 'relative',
      group: true,
    }}
  >
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          backgroundColor: alpha(colors.primary, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.primary,
          flexShrink: 0,
        }}
      >
        {notification.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textPrimary, lineHeight: 1.4 }}>
          {notification.title}
        </Typography>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          {notification.time}
        </Typography>
      </Box>
      {!notification.read && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: colors.primary,
            flexShrink: 0,
            mt: 0.5,
          }}
        />
      )}
    </Box>
    <IconButton
      onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
      size="small"
      sx={{
        width: 24,
        height: 24,
        borderRadius: '6px',
        color: colors.textMuted,
        opacity: 0,
        transition: 'opacity 0.15s ease',
        '&:hover': { color: colors.danger, backgroundColor: alpha(colors.danger, 0.08) },
        '.MuiBox-root:hover &': { opacity: 1 },
      }}
    >
      <X size={12} />
    </IconButton>
  </Box>
));

export const DashboardHeader = ({ onMenuClick, sidebarOpen }) => {
  const { userData, userRol } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const searchItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Buscar Acompañante', path: '/buscar-acompanante', icon: Search },
    { label: 'Buscar Trabajo', path: '/buscar-trabajo', icon: Search },
    { label: 'Mis Publicaciones', path: '/misPublicaciones', icon: Settings },
    { label: 'Nueva Publicación', path: '/nuevaPublicacion', icon: Settings },
    { label: 'CVs Enviados', path: '/cvEnvidos', icon: Settings },
    { label: 'CVs Recibidos', path: '/cv-recibido', icon: Settings },
    { label: 'Mi Cuenta', path: '/miCuenta', icon: User },
    { label: 'Mi Perfil Laboral', path: '/perfilLaboralUpdate', icon: User },
    { label: 'AT Registrados', path: '/at-registrados', icon: User },
    { label: 'Usuarios Pendientes', path: '/usuarios-nuevos', icon: User },
  ];

  const filteredSearch = searchItems.filter(i =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSelect = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const roleNotifications = {
    empleado: [
      { id: 1, title: 'Nueva postulación recibida', time: 'Hace 5 min', icon: <User size={16} />, read: false, route: '/cvEnvidos' },
      { id: 2, title: 'Tu CV fue visto por un reclutador', time: 'Hace 1 hora', icon: <User size={16} />, read: false, route: '/cvEnvidos' },
      { id: 3, title: 'Perfil actualizado', time: 'Ayer', icon: <Settings size={16} />, read: true, route: '/miCuenta' },
    ],
    reclutador: [
      { id: 1, title: 'Nuevo postulante para tu caso', time: 'Hace 10 min', icon: <User size={16} />, read: false, route: '/cv-recibido' },
      { id: 2, title: 'CV recibido de acompañante', time: 'Hace 2 horas', icon: <User size={16} />, read: false, route: '/cv-recibido' },
      { id: 3, title: 'Publicación actualizada', time: 'Ayer', icon: <Settings size={16} />, read: true, route: '/misPublicaciones' },
    ],
    administrador: [
      { id: 1, title: 'Nuevo usuario registrado', time: 'Hace 15 min', icon: <User size={16} />, read: false, route: '/usuarios-nuevos' },
      { id: 2, title: 'AT pendiente de verificación', time: 'Hace 30 min', icon: <User size={16} />, read: false, route: '/at-registrados' },
      { id: 3, title: 'Reporte semanal disponible', time: 'Ayer', icon: <Settings size={16} />, read: true, route: '/admin' },
    ],
    familiar: [
      { id: 1, title: 'Postulación a tu caso', time: 'Hace 20 min', icon: <User size={16} />, read: false, route: '/dashboard' },
      { id: 2, title: 'Actualización de caso', time: 'Hace 1 día', icon: <Settings size={16} />, read: true, route: '/dashboard' },
    ],
  };

  const [notifications, setNotifications] = useState(roleNotifications[userRol] || roleNotifications.empleado);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);
  const handleNotifClick = (event) => setNotifAnchor(event.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <HeaderContainer
      component={motion.header}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          minHeight: 64,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { lg: 'none' },
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: alpha(colors.primary, 0.06),
              '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
            }}
          >
            <MenuIcon size={18} />
          </IconButton>

          <IntelligentBreadcrumb />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchContainer
            onClick={() => setSearchOpen(true)}
            sx={{ display: { xs: 'none', md: 'flex' }, cursor: 'pointer' }}
          >
            <Search size={18} color={colors.textMuted} />
            <InputBase
              placeholder="Buscar..."
              sx={{ ml: 1.5, flex: 1, fontSize: '0.875rem' }}
              inputProps={{ readOnly: true }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                backgroundColor: colors.gray[100],
                color: colors.textMuted,
                fontSize: '0.6875rem',
                fontWeight: 500,
              }}
            >
              <Keyboard size={12} />
              <span>K</span>
            </Box>
          </SearchContainer>

          <Dialog
            open={searchOpen}
            onClose={handleSearchClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: { borderRadius: '20px', position: 'fixed', top: '15%', m: 0, alignSelf: 'flex-start' },
            }}
          >
            <Box sx={{ p: 2, pb: 0 }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.5, borderRadius: '12px',
                border: `2px solid ${alpha(colors.primary, 0.3)}`,
                bgcolor: alpha(colors.primary, 0.04),
              }}>
                <Search size={20} color={colors.textMuted} />
                <InputBase
                  placeholder="Buscar páginas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  sx={{ flex: 1, fontSize: '1rem' }}
                />
              </Box>
            </Box>
            <DialogContent sx={{ px: 2, pb: 2, mt: 1 }}>
              {filteredSearch.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 4, color: colors.textMuted }}>
                  Sin resultados para "{searchQuery}"
                </Typography>
              ) : (
                <List sx={{ p: 0 }}>
                  {filteredSearch.map((item) => (
                    <ListItemButton
                      key={item.path}
                      onClick={() => handleSearchSelect(item.path)}
                      sx={{
                        borderRadius: '10px', mb: 0.5,
                        '&:hover': { bgcolor: alpha(colors.primary, 0.06) },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: colors.textSecondary }}>
                        <item.icon size={18} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>

          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                color: colors.textSecondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
              }}
            >
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Ayuda">
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                color: colors.textSecondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
              }}
            >
              <HelpCircle size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton
              onClick={handleNotifClick}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                color: colors.textSecondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
              }}
            >
              <Badge
                badgeContent={notifications.filter(n => !n.read).length}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.625rem',
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <Bell size={18} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 400,
                borderRadius: '16px',
                boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.15)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notificaciones
              </Typography>
            </Box>
            {notifications.map((notif) => (
              <NotificationItem key={notif.id} notification={notif} onClick={() => { handleNotifClose(); navigate(notif.route); }} onDelete={(id) => { setNotifications(prev => prev.filter(n => n.id !== id)); }} />
            ))}
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Typography
                variant="body2"
                onClick={() => { handleNotifClose(); navigate('/notificaciones'); }}
                sx={{
                  textAlign: 'center',
                  color: colors.primary,
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Ver todas las notificaciones
              </Typography>
            </Box>
          </Menu>

          <Box
            onClick={handleProfileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 1,
              p: '6px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: alpha(colors.primary, 0.04) },
            }}
          >
            <Avatar
              src={userData?.photo || userData?.photoURL}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${alpha(colors.primary, 0.2)}`,
              }}
            >
              {userData?.nombre?.charAt(0) || 'U'}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            PaperProps={{
              sx: {
                width: 240,
                borderRadius: '16px',
                boxShadow: '0 20px 40px -12px rgb(0 0 0 / 0.15)',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleProfileClose(); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LayoutDashboard size={18} color={colors.primary} />
              </ListItemIcon>
              <Typography sx={{ fontWeight: 600, color: colors.primary }}>Ir al Panel</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/miCuenta'); handleProfileClose(); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <User size={18} color={colors.textSecondary} />
              </ListItemIcon>
              Mi Cuenta
            </MenuItem>
            <MenuItem onClick={() => {
              const perfilPath = userRol === 'empleado' ? '/perfilLaboralUpdate' : '/miCuenta';
              navigate(perfilPath); handleProfileClose();
            }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <User size={18} color={colors.textSecondary} />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut} sx={{ py: 1.5, color: colors.danger }}>
              <ListItemIcon>
                <LogOut size={18} color={colors.danger} />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </HeaderContainer>
  );
};

export default DashboardHeader;