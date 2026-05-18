import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';

const TableSkeleton = ({ rows = 5, columns = 4, hasHeader = true }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${alpha(colors.border, 0.6)}`,
        overflow: 'hidden',
        backgroundColor: colors.surface,
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${alpha(colors.border, 0.6)}`,
            display: 'flex',
            gap: 2,
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              animation="wave"
              width={`${Math.max(60, 100 / columns)}%`}
              height={16}
            />
          ))}
        </Box>
      )}

      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            px: 3,
            py: 2.25,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            borderBottom: rowIdx < rows - 1 ? `1px solid ${alpha(colors.border, 0.4)}` : 'none',
          }}
        >
          <Skeleton variant="circular" width={36} height={36} animation="wave" sx={{ flexShrink: 0 }} />
          {Array.from({ length: columns - 1 }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              variant="text"
              animation="wave"
              width={`${Math.max(50, 80 / columns)}%`}
              height={14}
            />
          ))}
        </Box>
      ))}
    </Paper>
  </motion.div>
);

export default React.memo(TableSkeleton);
