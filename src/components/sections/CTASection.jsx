import React from 'react';
import { Box, Container, Typography, Button, Stack, Grid, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { UserPlus, HeartHandshake, Shield, Users, Star, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/theme';

const MotionBox = motion(Box);

const CTASection = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Stats section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          backgroundColor: colors.surfaceSecondary,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 6 }}>
            {[
              { icon: <Users size={20} />, value: '+200', label: 'Acompañantes registrados', color: colors.primary },
              { icon: <HeartHandshake size={20} />, value: '+50', label: 'Familias conectadas', color: colors.secondary },
              { icon: <Star size={20} />, value: '4.8', label: 'Calificación promedio', color: colors.warning },
              { icon: <Award size={20} />, value: '95%', label: 'Satisfacción', color: colors.success },
            ].map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  sx={{ textAlign: { xs: 'center', md: 'left' } }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      backgroundColor: alpha(stat.color, 0.08),
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box
                    sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: alpha(stat.color, 0.08), display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', color: stat.color, mb: 1.5, mx: 'auto' }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, fontSize: { xs: '1.5rem', md: '1.75rem' }, mb: 0.25 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.8125rem' }}>
                    {stat.label}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        sx={{
          py: { xs: 8, md: 14 },
          background: `linear-gradient(160deg, ${alpha(colors.primary, 0.04)} 0%, ${alpha(colors.secondary, 0.03)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 7 },
                borderRadius: '28px',
                border: `1px solid ${colors.border}`,
                background: `linear-gradient(135deg, ${alpha(colors.surface)} 0%, ${alpha(colors.surfaceSecondary)} 100%)`,
                position: 'relative',
                overflow: 'hidden',
                maxWidth: 800,
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              {/* Decorative */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -80,
                  right: -80,
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(colors.primary, 0.06)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -60,
                  left: -60,
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(colors.secondary, 0.05)} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.08)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    mx: 'auto',
                    border: `1px solid ${alpha(colors.primary, 0.08)}`,
                  }}
                >
                  <UserPlus size={28} color={colors.primary} />
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    letterSpacing: '-0.02em',
                    mb: 2,
                    color: colors.textPrimary,
                  }}
                >
                  Comienza hoy, es gratis
                </Typography>
                <Typography
                  variant="body1"
                  color={colors.textSecondary}
                  sx={{ maxWidth: 480, mx: 'auto', mb: 4, lineHeight: 1.7, fontSize: '1rem' }}
                >
                  Regístrate gratis y comienza a conectarte con la comunidad de acompañantes
                  terapéuticos más grande de la región.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="center"
                >
                  <Button
                    component={Link}
                    to="/crearCuenta"
                    variant="contained"
                    size="large"
                    endIcon={<UserPlus size={18} />}
                    sx={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      color: '#fff',
                      fontWeight: 700,
                      px: 5,
                      py: 1.75,
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      boxShadow: `0 8px 28px ${alpha(colors.primary, 0.25)}`,
                      '&:hover': {
                        boxShadow: `0 12px 36px ${alpha(colors.primary, 0.35)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Crear cuenta gratuita
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      fontWeight: 600,
                      px: 5,
                      py: 1.75,
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      '&:hover': {
                        borderColor: colors.primary,
                        backgroundColor: alpha(colors.primary, 0.04),
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Iniciar sesión
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default CTASection;
