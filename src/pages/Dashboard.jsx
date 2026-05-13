import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LoadingPage } from '../components/feedback/LoadingSpinner';
import DashboardAdmin from './admin/DashboardAdmin';
import DashboardReclutador from './reclutador/DashboardReclutador';
import DashboardAT from './at/DashboardAT';
import DashboardFamiliar from './familiar/DashboardFamiliar';
import { colors } from '../theme/theme';

const Dashboard = () => {
  const { userRol, loading } = useAuth();

  if (loading) return <LoadingPage />;

  switch (userRol) {
    case 'administrador':
      return <DashboardAdmin />;
    case 'reclutador':
      return <DashboardReclutador />;
    case 'empleado':
      return <DashboardAT />;
    case 'familiar':
      return <DashboardFamiliar />;
    default:
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: colors.textSecondary }}>
            No tienes acceso a ningún dashboard
          </Typography>
        </Box>
      );
  }
};

export default Dashboard;