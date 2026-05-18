import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

const CardSkeleton = ({
  height = 180,
  variant = 'rectangular',
  avatar = false,
  lines = 3,
  lineWidths = ['70%', '90%', '50%'],
  borderRadius = '16px',
  shimmer = true,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius,
        border: `1px solid ${alpha(colors.border, 0.6)}`,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        position: 'relative',
        ...(shimmer && {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent, ${alpha(colors.primary, 0.02)}, transparent)`,
            animation: 'shimmer 1.8s infinite',
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
          },
        }),
      }}
    >
      {avatar && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" animation="wave" width="50%" height={16} />
            <Skeleton variant="text" animation="wave" width="30%" height={12} sx={{ mt: 0.25 }} />
          </Box>
        </Box>
      )}

      <Skeleton
        variant={variant}
        animation="wave"
        height={height}
        sx={{ borderRadius: '12px', mb: avatar ? 0 : 0 }}
      />

      {lines > 0 && (
        <Box sx={{ mt: 2 }}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              animation="wave"
              width={lineWidths[i] || '80%'}
              height={14}
              sx={{ mb: i < lines - 1 ? 0.75 : 0 }}
            />
          ))}
        </Box>
      )}
    </Paper>
  </motion.div>
);

export default React.memo(CardSkeleton);
