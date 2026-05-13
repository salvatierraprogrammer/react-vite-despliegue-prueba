import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Inbox, SearchOff, ErrorOutline } from '@mui/icons-material';
import { colors } from '../../theme/theme';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No hay datos',
  description = 'No se encontró información para mostrar.',
  actionLabel,
  onAction,
}) => {
  const icons = {
    inbox: Inbox,
    search: SearchOff,
    error: ErrorOutline,
  };

  const IconComponent = icons[icon] || icons.inbox;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.secondary, 0.08)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <IconComponent sx={{ fontSize: 48, color: colors.textSecondary }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 320 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
