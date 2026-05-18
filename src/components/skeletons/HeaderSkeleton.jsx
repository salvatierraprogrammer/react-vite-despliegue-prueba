import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const HeaderSkeleton = ({ titleWidth = 220, subtitle = true, action = false }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Skeleton
          variant="text"
          animation="wave"
          width={titleWidth}
          height={32}
          sx={{ mb: subtitle ? 0.5 : 0 }}
        />
        {subtitle && (
          <Skeleton
            variant="text"
            animation="wave"
            width={titleWidth * 0.65}
            height={16}
          />
        )}
      </Box>
      {action && (
        <Skeleton
          variant="rounded"
          animation="wave"
          width={120}
          height={40}
          sx={{ borderRadius: '10px', flexShrink: 0, ml: 2 }}
        />
      )}
    </Box>
  </motion.div>
);

export default React.memo(HeaderSkeleton);
