import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme/theme';

export const LoadingSpinner = ({ size = 40, color = 'primary' }) => (
  <CircularProgress 
    size={size} 
    sx={{ color: colors[color] || colors.primary }} 
  />
);

export const LoadingPage = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 3,
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
        },
      }}
    >
      <LoadingSpinner size={50} />
    </Box>
    <Typography variant="body2" color="textSecondary">
      Cargando...
    </Typography>
  </Box>
);

export const PageLoader = ({ message = 'Cargando...' }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
    }}
  >
    <LoadingPage />
  </Box>
);

export default LoadingPage;
