import React from 'react';
import { Box } from '@mui/material';
import { DashboardSidebar } from '../../components/navigation/DashboardSidebar';
import { colors } from '../../theme/theme';

export const AdminLayout = ({ children, sidebarOpen, onToggleSidebar }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.background }}>
      <DashboardSidebar open={sidebarOpen} onToggle={onToggleSidebar} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          transition: 'margin-left 0.3s ease',
          ml: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;