import React from 'react';
import { Box, Paper, Typography, Avatar, Chip, Button, IconButton, Collapse, Rating } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  LocationOn,
  AccessTime,
  Work,
  Verified,
  ExpandMore,
  ExpandLess,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { colors } from '../../theme/theme';

export const PublicacionCard = ({ 
  publicacion,
  onVerMas,
  onPostularse,
  onGenerarFlyer,
  showActions = true,
  variant = 'default'
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [liked, setLiked] = React.useState(false);

  const getZonaColor = (zona) => {
    const zonaColors = {
      'CABA': colors.primary,
      'Zona Norte': colors.success,
      'Zona Sur': colors.warning,
      'Zona Oeste': colors.secondary,
    };
    return zonaColors[zona] || colors.primary;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(colors.primary, 0.3),
          boxShadow: `0 8px 30px ${alpha(colors.primary, 0.1)}`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar
            src={publicacion.photo}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              border: `2px solid ${alpha(colors.primary, 0.2)}`,
            }}
          >
            {publicacion.cliente?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>
              {publicacion.cliente}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip
                label={publicacion.zona}
                size="small"
                sx={{
                  bgcolor: alpha(getZonaColor(publicacion.zona), 0.1),
                  color: getZonaColor(publicacion.zona),
                  fontWeight: 500,
                  height: 24,
                }}
              />
              <Chip
                label={publicacion.estado || 'Disponible'}
                size="small"
                sx={{
                  bgcolor: alpha(publicacion.estado === 'Disponible' ? colors.success : colors.textSecondary, 0.1),
                  color: publicacion.estado === 'Disponible' ? colors.success : colors.textSecondary,
                  fontWeight: 500,
                  height: 24,
                }}
              />
            </Box>
          </Box>
          <IconButton onClick={() => setLiked(!liked)} sx={{ alignSelf: 'flex-start' }}>
            {liked ? <Favorite sx={{ color: colors.danger }} /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
          <InfoItem icon="person" label="Paciente" value={publicacion.paciente} />
          <InfoItem icon="cake" label="Edad" value={publicacion.edad} />
          <InfoItem icon="location_on" label="Localidad" value={publicacion.localidad} />
          <InfoItem icon="medical_services" label="Diagnóstico" value={publicacion.diagnostico} />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mb: 2 }}>
            <InfoItem icon="notes" label="Descripción" value={publicacion.descripcion} />
            <InfoItem icon="wc" label="Género AT" value={publicacion.generoAt} />
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ color: colors.textSecondary }}
          >
            {expanded ? 'Menos' : 'Más detalles'}
          </Button>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: colors.primary }}
          >
            {publicacion.sexo}
          </Button>
        </Box>
      </Box>

      {showActions && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            gap: 2,
            bgcolor: alpha(colors.background, 0.5),
          }}
        >
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={onPostularse}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            Postularse
          </Button>
          {onGenerarFlyer && (
            <Button
              variant="outlined"
              size="small"
              onClick={onGenerarFlyer}
            >
              Generar Flyer
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box
      component="span"
      sx={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        bgcolor: alpha(colors.primary, 0.08),
        fontSize: '14px',
      }}
      className="material-icons"
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textPrimary }}>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
);

export const PerfilATCard = ({ perfil, onVerPerfil }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(colors.primary, 0.3),
          boxShadow: `0 8px 30px ${alpha(colors.primary, 0.1)}`,
          transform: 'translateY(-4px)',
        },
      }}
      onClick={onVerPerfil}
    >
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Avatar
          src={perfil.photo}
          sx={{
            width: 72,
            height: 72,
            borderRadius: '16px',
            border: `3px solid ${alpha(colors.primary, 0.15)}`,
          }}
        >
          {perfil.nombreCompleto?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {perfil.nombreCompleto}
            </Typography>
            {perfil.verificado && (
              <Verified sx={{ color: colors.primary, fontSize: 20 }} />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            {perfil.titulo}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<LocationOn sx={{ fontSize: 14 }} />}
              label={perfil.localidad}
              size="small"
              sx={{ height: 24, bgcolor: alpha(colors.primary, 0.08) }}
            />
            <Chip
              icon={<Work sx={{ fontSize: 14 }} />}
              label={perfil.zona}
              size="small"
              sx={{ height: 24, bgcolor: alpha(colors.secondary, 0.08) }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          Experiencia
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {perfil.experiencia} años
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Rating value={perfil.calificacion || 4.5} readOnly size="small" />
        <Button size="small" variant="outlined" sx={{ borderRadius: '10px' }}>
          Ver Perfil
        </Button>
      </Box>
    </Paper>
  );
};

export default PublicacionCard;
