import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/navigation/PublicHeader';
import PublicFooter from '../components/navigation/PublicFooter';

export const PublicLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <PublicHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
};

export default PublicLayout;