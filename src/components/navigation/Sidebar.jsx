import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Button, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { colors } from '../../theme/theme';
import {
  Dashboard,
  People,
  Description,
  Campaign,
  Settings,
  Logout,
  ChevronLeft,
  ChevronRight,
  Home,
} from '@mui/icons-material';

const drawerWidth = 280;

export const Sidebar = ({ open, onToggle, userData, userRol }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    switch (userRol) {
      case 'administrador':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
          { label: 'Usuarios', icon: <People />, path: '/ver-usuarios' },
          { label: 'Publicaciones', icon: <Campaign />, path: '/moderar-publicaciones' },
          { label: 'Reportes', icon: <Description />, path: '/reportes' },
        ];
      case 'reclutador':
        return [
          { label: 'Dashboard', icon: <Home />, path: '/dashboard-reclutador' },
          { label: 'Mis Publicaciones', icon: <Campaign />, path: '/misPublicaciones' },
          { label: 'CVs Recibidos', icon: <Description />, path: '/cv-recibido' },
          { label: 'Buscar AT', icon: <People />, path: '/buscar-acompanante' },
        ];
      case 'empleado':
        return [
          { label: 'Dashboard', icon: <Home />, path: '/buscar-trabajo' },
          { label: 'Mi Perfil', icon: <People />, path: '/perfilLaboralUpdate' },
          { label: 'CVs Enviados', icon: <Description />, path: '/cvEnvidos' },
          { label: 'Buscar Trabajo', icon: <Campaign />, path: '/buscar-trabajo' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 72,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
            El Canal del AT
          </Typography>
        )}
        <Button
          onClick={onToggle}
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: '12px',
            backgroundColor: alpha(colors.primary, 0.08),
            '&:hover': { backgroundColor: alpha(colors.primary, 0.12) },
          }}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </Box>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Avatar
          src={userData?.photo}
          sx={{
            width: open ? 56 : 40,
            height: open ? 56 : 40,
            border: `2px solid ${alpha(colors.primary, 0.2)}`,
            transition: 'all 0.3s ease',
          }}
        >
          {userData?.nombre?.charAt(0)}
        </Avatar>
      </Box>

      {open && userData && (
        <Box sx={{ px: 2, pb: 2, textAlign: open ? 'left' : 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {userData.nombre} {userData.apellido}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {userRol === 'empleado' ? 'Acompañante AT' : userRol}
          </Typography>
        </Box>
      )}

      <List sx={{ px: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '12px',
                minHeight: 48,
                justifyContent: open ? 'flex-start' : 'center',
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(colors.primary, 0.1),
                  '&:hover': { backgroundColor: alpha(colors.primary, 0.15) },
                },
                '&:hover': { backgroundColor: alpha(colors.primary, 0.05) },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? 40 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? colors.primary : colors.textSecondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? colors.primary : colors.textPrimary,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '12px',
              minHeight: 48,
              justifyContent: open ? 'flex-start' : 'center',
              px: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: colors.textSecondary }}>
              <Settings />
            </ListItemIcon>
            {open && <ListItemText primary="Configuración" />}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '12px',
              minHeight: 48,
              justifyContent: open ? 'flex-start' : 'center',
              px: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', color: colors.danger }}>
              <Logout />
            </ListItemIcon>
            {open && <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: colors.danger }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
