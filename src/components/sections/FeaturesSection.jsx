import React from 'react';
import { Box, Container, Typography, Button, Stack, Grid, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Search, Briefcase, ArrowRight, HeartHandshake, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/theme';

const MotionPaper = motion.create(Paper);

const FeatureCard = ({ icon, iconBg, title, description, buttonText, buttonGradient, to, delay, hoverColor }) => (
  <MotionPaper
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    elevation={0}
    sx={{
      p: { xs: 3, md: 4.5 },
      borderRadius: '24px',
      border: `1px solid ${colors.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 24px 60px ${alpha(hoverColor, 0.1)}`,
        borderColor: alpha(hoverColor, 0.25),
      },
    }}
  >
    {/* Subtle gradient orb */}
    <Box
      sx={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${alpha(iconBg, 0.06)} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />

    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${alpha(iconBg, 0.12)} 0%, ${alpha(iconBg, 0.04)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          border: `1px solid ${alpha(iconBg, 0.08)}`,
        },
      }}
    >
      {icon}
    </Box>

    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: colors.textPrimary, fontSize: '1.25rem' }}>
      {title}
    </Typography>

    <Typography variant="body1" color={colors.textSecondary} sx={{ mb: 4, lineHeight: 1.7, flex: 1, fontSize: '0.9375rem' }}>
      {description}
    </Typography>

    <Button
      component={Link}
      to={to}
      variant="contained"
      endIcon={<ArrowRight size={16} />}
      sx={{
        alignSelf: 'flex-start',
        borderRadius: '12px',
        fontWeight: 700,
        px: 3.5,
        py: 1.25,
        fontSize: '0.875rem',
        background: buttonGradient,
        boxShadow: `0 4px 16px ${alpha(iconBg, 0.2)}`,
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(iconBg, 0.3)}`,
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.25s ease',
      }}
    >
      {buttonText}
    </Button>
  </MotionPaper>
);

const FeaturesSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography
            variant="overline"
            sx={{
              color: colors.primary,
              fontWeight: 700,
              letterSpacing: '0.12em',
              fontSize: '0.6875rem',
            }}
          >
            ¿Qué necesitas?
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              letterSpacing: '-0.02em',
              color: colors.textPrimary,
            }}
          >
            Elige tu camino
          </Typography>
          <Typography
            variant="body1"
            color={colors.textSecondary}
            sx={{ maxWidth: 520, fontSize: '1rem', lineHeight: 1.7 }}
          >
            Ya sea que busques apoyo terapéutico o quieras ofrecer tus servicios
            profesionales, estamos aquí para ayudarte.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 5 }} sx={{ maxWidth: 960, mx: 'auto' }}>
          <Grid item xs={12} md={6}>
            <FeatureCard
              icon={<Search size={24} color={colors.primary} />}
              iconBg={colors.primary}
              title="Busco Acompañante Terapéutico"
              description="Encuentra y conecta con acompañantes terapéuticos calificados. Explora perfiles detallados, revisa su experiencia, especializaciones y disponibilidad para seleccionar al profesional ideal."
              buttonText="Explorar profesionales"
              buttonGradient={`linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`}
              to="/buscar-acompanante"
              delay={0.1}
              hoverColor={colors.primary}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard
              icon={<Briefcase size={24} color={colors.secondary} />}
              iconBg={colors.secondary}
              title="Busco Trabajo como AT"
              description="Crea tu perfil profesional, muestra tu experiencia, especializaciones y disponibilidad. Conecta con reclutadores y familias que buscan tus servicios de acompañamiento terapéutico."
              buttonText="Ver oportunidades"
              buttonGradient={`linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`}
              to="/buscar-trabajo"
              delay={0.2}
              hoverColor={colors.secondary}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
