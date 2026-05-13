import React from 'react';
import { Box, Container, Typography, Button, Stack, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/theme';

const HeroSection = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${alpha(colors.primary, 0.04)} 0%, ${alpha(colors.secondary, 0.06)} 50%, ${alpha(colors.background, 1)} 100%)`,
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 14 },
      }}
    >
      {/* Glow backgrounds */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colors.primary, 0.08)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colors.secondary, 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={{ xs: 6, lg: 8 }}
          alignItems="center"
        >
          {/* Left: Text content */}
          <Box sx={{ flex: '1 1 55%', maxWidth: 640 }}>
            <Stack
              component={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              spacing={3}
            >
              <Chip
                icon={<Sparkles size={14} />}
                label="Plataforma de Conexión Terapéutica"
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: alpha(colors.primary, 0.08),
                  color: colors.primary,
                  fontWeight: 600,
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  height: 28,
                  border: `1px solid ${alpha(colors.primary, 0.12)}`,
                }}
              />

              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' },
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    color: colors.textPrimary,
                  }}
                >
                  Conectamos{' '}
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Acompañantes Terapéuticos
                  </Box>{' '}
                  con quienes los necesitan
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    color: colors.textSecondary,
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.7,
                    maxWidth: 540,
                  }}
                >
                  La plataforma que facilita la conexión entre profesionales de la salud mental y familias,
                  instituciones o reclutadores que buscan acompañamiento terapéutico de calidad.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ pt: 1 }}
              >
                <Button
                  component={Link}
                  to="/buscar-acompanante"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    color: '#fff',
                    fontWeight: 700,
                    px: 4,
                    py: 1.75,
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    boxShadow: `0 8px 28px ${alpha(colors.primary, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 36px ${alpha(colors.primary, 0.4)}`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Buscar Acompañante
                </Button>
                <Button
                  component={Link}
                  to="/buscar-trabajo"
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontWeight: 600,
                    px: 4,
                    py: 1.75,
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    '&:hover': {
                      borderColor: colors.primary,
                      backgroundColor: alpha(colors.primary, 0.04),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Buscar Trabajo
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={{ xs: 2, sm: 4 }}
                sx={{ pt: 2, flexWrap: 'wrap', rowGap: 2 }}
              >
                {[
                  { icon: <Shield size={16} />, value: '+200', label: 'Profesionales verificados' },
                  { icon: <Users size={16} />, value: '+50', label: 'Familias conectadas' },
                  { icon: <Star size={16} />, value: '4.8', label: 'Calificación promedio' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: alpha(colors.primary, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Box sx={{ color: colors.primary, display: 'flex' }}>{item.icon}</Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.1, color: colors.textPrimary }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>

          {/* Right: Visual Mockup */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              flex: '1 1 45%',
              maxWidth: 520,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Decorative gradient blob */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 420,
                height: 420,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(colors.secondary, 0.1)} 0%, ${alpha(colors.primary, 0.05)} 50%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            {/* Main mockup card */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                backgroundColor: colors.surface,
                borderRadius: '20px',
                border: `1px solid ${colors.border}`,
                boxShadow: `0 32px 80px ${alpha('#000', 0.08)}`,
                p: { xs: 3, md: 4 },
              }}
            >
              {/* Mockup header */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F43F5E' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
              </Stack>

              {/* Mockup search bar */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: colors.surfaceSecondary,
                  border: `1px solid ${colors.border}`,
                  mb: 3,
                }}
              >
                <Typography variant="body2" color={colors.textMuted} sx={{ fontSize: '0.8125rem' }}>
                  Buscar acompañantes por zona, especialidad...
                </Typography>
              </Box>

              {/* Mockup profile cards */}
              <Stack spacing={2}>
                {[
                  {
                    name: 'María García',
                    specialty: 'Acompañante Terapéutico',
                    badge: 'Verificado',
                    color: colors.primary,
                  },
                  {
                    name: 'Carlos López',
                    specialty: 'AT Especializado en Niños',
                    badge: 'Verificado',
                    color: colors.secondary,
                  },
                ].map((profile, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: alpha(profile.color, 0.3), backgroundColor: alpha(profile.color, 0.02) },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${alpha(profile.color, 0.15)} 0%, ${alpha(profile.color, 0.05)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: profile.color,
                        }}
                      >
                        {profile.name.charAt(0)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {profile.name}
                          </Typography>
                          <Chip
                            label={profile.badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.5625rem',
                              fontWeight: 700,
                              bgcolor: alpha(colors.success, 0.1),
                              color: colors.success,
                              borderRadius: '4px',
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color={colors.textSecondary}>
                          {profile.specialty}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          backgroundColor: alpha(colors.primary, 0.06),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary,
                          flexShrink: 0,
                        }}
                      >
                        <ArrowRight size={14} />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              {/* Gradient accent */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
                  border: `1px solid ${alpha(colors.primary, 0.1)}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                  +200 profesionales disponibles
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  Encuentra el acompañante ideal para ti
                </Typography>
              </Box>
            </Box>

            {/* Decorative floating element */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -16,
                right: -16,
                zIndex: 0,
                width: 120,
                height: 120,
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${alpha(colors.primary, 0.06)} 0%, ${alpha(colors.secondary, 0.04)} 100%)`,
                border: `1px solid ${alpha(colors.border, 0.5)}`,
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={32} color={alpha(colors.primary, 0.15)} />
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
