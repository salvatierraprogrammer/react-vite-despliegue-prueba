import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const AvatarSkeleton = ({ size = 48, textWidth = 140, textLines = 2 }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
  >
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      animation="wave"
      sx={{ flexShrink: 0 }}
    />
    <Box sx={{ flex: 1 }}>
      {Array.from({ length: textLines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          animation="wave"
          width={i === 0 ? textWidth : textWidth * 0.7}
          height={i === 0 ? 18 : 14}
          sx={{ mb: i < textLines - 1 ? 0.5 : 0 }}
        />
      ))}
    </Box>
  </Box>
);

export default React.memo(AvatarSkeleton);
