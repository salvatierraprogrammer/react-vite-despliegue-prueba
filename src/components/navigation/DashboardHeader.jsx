import React, { useState, useEffect, memo } from 'react';
import { Box, InputBase, IconButton, Badge, Avatar, Menu, MenuItem, Typography, Divider, ListItemIcon, Tooltip, Breadcrumbs, Link, Chip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfg/firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';
import {
  Search,
  Bell,
  Menu as MenuIcon,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
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

const NotificationItem = memo(({ notification }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      p: 2,
      '&:hover': { backgroundColor: alpha(colors.primary, 0.04) },
      cursor: 'pointer',
    }}
  >
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
        }}
      />
    )}
  </Box>
));

export const DashboardHeader = ({ onMenuClick, sidebarOpen }) => {
  const { userData, userRol } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const notifications = [
    { id: 1, title: 'Nueva postulación recibida', time: 'Hace 5 min', icon: <User size={16} />, read: false },
    { id: 2, title: 'Tu CV fue visto', time: 'Hace 1 hora', icon: <User size={16} />, read: false },
    { id: 3, title: 'Publicación actualizada', time: 'Ayer', icon: <Settings size={16} />, read: true },
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      label: path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <HeaderContainer
      component={motion.header}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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

          <Breadcrumbs separator={<ChevronRight size={14} color={colors.textMuted} />}>
            {breadcrumbs.map((crumb) => (
              <Link
                key={crumb.path}
                underline="hover"
                color={crumb.isLast ? 'textPrimary' : 'textSecondary'}
                onClick={() => !crumb.isLast && navigate(crumb.path)}
                sx={{
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: crumb.isLast ? 600 : 400,
                  '&:hover': { color: colors.primary },
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchContainer
            component={motion.div}
            whileFocus={{ scale: 1.02 }}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <Search size={18} color={colors.textMuted} />
            <InputBase
              placeholder="Buscar..."
              sx={{ ml: 1.5, flex: 1, fontSize: '0.875rem' }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
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
              <span>Ctrl</span>
              <span>K</span>
            </Box>
          </SearchContainer>

          <Tooltip title="Modo oscuro">
            <IconButton
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                color: colors.textSecondary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
              }}
            >
              <Moon size={18} />
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
              <NotificationItem key={notif.id} notification={notif} />
            ))}
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Typography
                variant="body2"
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
              gap: 1.5,
              ml: 1,
              p: '6px 12px 6px 6px',
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
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {userData?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {userData?.userRol || 'Usuario'}
              </Typography>
            </Box>
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
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {userData?.nombre} {userData?.apellido}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {userData?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/miCuenta'); handleProfileClose(); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <User size={18} color={colors.textSecondary} />
              </ListItemIcon>
              Mi Cuenta
            </MenuItem>
            <MenuItem onClick={() => { navigate('/perfilLaboralUpdate'); handleProfileClose(); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <User size={18} color={colors.textSecondary} />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleProfileClose} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Settings size={18} color={colors.textSecondary} />
              </ListItemIcon>
              Configuración
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