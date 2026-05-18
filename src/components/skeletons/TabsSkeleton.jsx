import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

const TabsSkeleton = ({ tabs = 3, contentHeight = 200 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2.5,
        p: 0.5,
        backgroundColor: alpha(colors.primary, 0.03),
        borderRadius: '10px',
        border: `1px solid ${alpha(colors.border, 0.5)}`,
      }}
    >
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          animation="wave"
          width={`${Math.max(80, 100 / tabs)}%`}
          height={34}
          sx={{ borderRadius: '8px' }}
        />
      ))}
    </Box>

    <Skeleton
      variant="rectangular"
      animation="wave"
      height={contentHeight}
      sx={{ borderRadius: '12px' }}
    />
  </motion.div>
);

export default React.memo(TabsSkeleton);
