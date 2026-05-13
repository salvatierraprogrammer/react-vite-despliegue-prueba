import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

const publicPaths = ['/buscar-acompanante', '/showPerfil/', '/showPerfilReclutador/'];

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: colors.background,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Cargando...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    const isPublicPath = publicPaths.some(p => 
      p.endsWith('/') ? location.pathname.startsWith(p) : location.pathname === p
    );
    if (isPublicPath) return <Outlet />;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;