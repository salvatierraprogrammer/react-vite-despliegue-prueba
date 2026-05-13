import React from 'react';
import { Box, Typography, Paper, Icon } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../theme/theme';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

export const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  loading = false 
}) => {
  const colorValue = colors[color] || colors.primary;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(colorValue, 0.3),
          boxShadow: `0 8px 30px ${alpha(colorValue, 0.12)}`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(colorValue, 0.1)} 0%, ${alpha(colorValue, 0.05)} 100%)`,
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.textSecondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${alpha(colorValue, 0.15)} 0%, ${alpha(colorValue, 0.08)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: colorValue, fontSize: 24 }}>{icon}</Icon>
          </Box>
        </Box>
        
        {loading ? (
          <LoadingSpinner size={24} />
        ) : (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.textPrimary,
              mb: 1,
            }}
          >
            {value}
          </Typography>
        )}
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: trend === 'up' ? colors.success : colors.danger,
                fontWeight: 600,
              }}
            >
              {trend === 'up' ? '+' : '-'}{trendValue}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              vs mes anterior
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default StatCard;
