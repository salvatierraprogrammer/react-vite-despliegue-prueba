import React, { useState, createContext, useContext, memo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardSidebar } from '../navigation/DashboardSidebar';
import { DashboardHeader } from '../navigation/DashboardHeader';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

const BreadcrumbContext = createContext();
export const useBreadcrumb = () => useContext(BreadcrumbContext);

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const PageContent = memo(({ pathname, children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
));

export const DashboardLayout = () => {
  const { userData, userRol } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();

  const handleToggle = () => setSidebarOpen(!sidebarOpen);
  const handleMobileClose = () => setMobileOpen(false);

  return (
    <BreadcrumbContext.Provider value={{ caseTitle, setCaseTitle }}>
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: colors.background,
      }}
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
        <Box
          sx={{
            flex: 1,
            p: { xs: '16px', sm: '32px' },
          }}
        >
          <PageContent pathname={location.pathname}>
            <Outlet />
          </PageContent>
        </Box>
      </Box>
    </Box>
    </BreadcrumbContext.Provider>
  );
};

export default DashboardLayout;
