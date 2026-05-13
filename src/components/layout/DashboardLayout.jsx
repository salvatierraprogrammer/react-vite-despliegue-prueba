import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '../navigation/DashboardSidebar';
import { DashboardHeader } from '../navigation/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

const MainLayout = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: colors.background,
});

const MainContent = styled('main')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

const ContentArea = styled(Box)({
  flex: 1,
  padding: '32px',
  '@media (max-width: 900px)': {
    padding: '16px',
  },
});

export const DashboardLayout = () => {
  const { userData, userRol } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleToggle = () => setSidebarOpen(!sidebarOpen);
  const handleMobileClose = () => setMobileOpen(false);

  return (
    <MainLayout
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardSidebar
        open={sidebarOpen}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: isMobile ? 0 : `${sidebarOpen ? 260 : 72}px`,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          sidebarOpen={sidebarOpen}
          userData={userData}
          userRol={userRol}
        />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </Box>
    </MainLayout>
  );
};

export default DashboardLayout;
