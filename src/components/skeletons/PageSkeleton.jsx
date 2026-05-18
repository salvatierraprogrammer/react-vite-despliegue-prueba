import React from 'react';
import { Box, Skeleton, Container, Grid, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const ShimmerBlock = ({ height = 20, width = '100%', sx = {} }) => (
  <Box
    sx={{
      height,
      width,
      borderRadius: '8px',
      background: `linear-gradient(90deg, ${alpha(colors.border, 0.04)} 25%, ${alpha(colors.primary, 0.03)} 50%, ${alpha(colors.border, 0.04)} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.8s ease-in-out infinite',
      ...sx,
    }}
  />
);

const PageSkeleton = ({
  variant = 'default',
  header = true,
  sidebar = false,
  tabs = false,
}) => {
  const renderDefault = () => (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      <style>{shimmerKeyframes}</style>

      {header && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rounded" width={36} height={36} animation="wave" sx={{ borderRadius: '10px' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" animation="wave" width={200} height={28} />
              <Skeleton variant="text" animation="wave" width={140} height={16} sx={{ mt: 0.25 }} />
            </Box>
          </Box>
        </motion.div>
      )}

      {tabs && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              p: 0.5,
              backgroundColor: alpha(colors.primary, 0.03),
              borderRadius: '10px',
              border: `1px solid ${alpha(colors.border, 0.5)}`,
              mb: 2,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                animation="wave"
                width={`${100 / 3}%`}
                height={34}
                sx={{ borderRadius: '8px' }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Grid container spacing={2.5}>
        {sidebar && (
          <Grid item xs={12} md={4.5} lg={3.8}>
            {[1, 2].map((i) => (
              <Box key={i} sx={{ mb: 2.5 }}>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={i === 1 ? 240 : 160}
                  sx={{ borderRadius: '16px' }}
                />
              </Box>
            ))}
          </Grid>
        )}

        <Grid item xs={12} md={sidebar ? 7.5 : 12} lg={sidebar ? 8.2 : 12}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${alpha(colors.border, 0.6)}`,
              overflow: 'hidden',
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <ShimmerBlock width={32} height={32} sx={{ borderRadius: '8px', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <ShimmerBlock width="35%" height={10} sx={{ mb: 0.5 }} />
                    <ShimmerBlock width="75%" height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  const renderFullPage = () => (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{shimmerKeyframes}</style>
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.secondary, 0.08)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.05)', opacity: 0.7 },
            },
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: `3px solid ${alpha(colors.primary, 0.15)}`,
              borderTopColor: colors.primary,
              animation: 'spin 0.8s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
        <ShimmerBlock width={180} height={18} sx={{ mx: 'auto' }} />
      </Box>
    </Box>
  );

  switch (variant) {
    case 'full':
      return renderFullPage();
    default:
      return renderDefault();
  }
};

export default React.memo(PageSkeleton);
