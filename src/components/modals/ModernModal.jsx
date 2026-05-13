import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Slide,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Close, Warning } from '@mui/icons-material';
import { colors } from '../../theme/theme';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const ModernModal = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
}) => {
  const sizes = {
    xs: 320,
    sm: 400,
    md: 500,
    lg: 700,
    xl: 900,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={size}
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: `0 25px 50px -12px ${alpha('#000', 0.25)}`,
          overflow: 'hidden',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: alpha('#111827', 0.6),
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          background: variant === 'danger' 
            ? `linear-gradient(135deg, ${colors.danger} 0%, ${alpha(colors.danger, 0.8)} 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: 'white',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {variant === 'danger' && <Warning />}
          <DialogTitle sx={{ color: 'white', p: 0, fontWeight: 600 }}>
            {title}
          </DialogTitle>
        </Box>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: alpha('#fff', 0.1) },
            }}
          >
            <Close />
          </IconButton>
        )}
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}) => {
  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={title}
      variant={variant}
      actions={
        <>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              flex: 1,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
            }}
          >
            {cancelText}
          </IconButton>
          <Box
            component="button"
            onClick={onConfirm}
            disabled={loading}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: '12px',
              border: 'none',
              background: variant === 'danger'
                ? colors.danger
                : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              color: 'white',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Cargando...' : confirmText}
          </Box>
        </>
      }
    >
      {message && (
        <Typography variant="body2" color="textSecondary">
          {message}
        </Typography>
      )}
    </ModernModal>
  );
};

export default ModernModal;
