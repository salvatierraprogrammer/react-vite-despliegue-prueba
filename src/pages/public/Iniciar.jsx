import React from 'react';
import { Box, Container, Typography, Button, Stack, Grid, Avatar, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, Target, Shield, Users, Sparkles, ArrowRight,
  Quote, Globe, BookOpen, Award, Star
} from 'lucide-react';
import { colors } from '../../theme/theme';

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const SobreNosotros = () => {
  return (
    <Box>
      {/* ===== HERO ===== */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 14 },
          pb: { xs: 10, md: 18 },
          background: `linear-gradient(165deg, ${alpha(colors.primary, 0.04)} 0%, ${alpha(colors.secondary, 0.06)} 40%, ${colors.background} 100%)`,
        }}
      >
        {/* Decorative glows */}
        <Box sx={{ position: 'absolute', top: '-15%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(colors.primary, 0.07)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-8%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(colors.secondary, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Decorative grid pattern */}
        <Box
          sx={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `linear-gradient(${colors.primary} 1px, transparent 1px), linear-gradient(90deg, ${colors.primary} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg">
          <MotionBox {...fadeUp(0)} sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Chip
              icon={<HeartHandshake size={14} />}
              label="Sobre Nosotros"
              size="small"
              sx={{
                bgcolor: alpha(colors.primary, 0.08),
                color: colors.primary,
                fontWeight: 700, borderRadius: '20px', fontSize: '0.75rem', height: 28, mb: 3,
                border: `1px solid ${alpha(colors.primary, 0.12)}`,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800, fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
                lineHeight: 1.08, letterSpacing: '-0.03em', color: colors.textPrimary, mb: 3,
              }}
            >
              Conectamos{' '}
              <Box component="span" sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                personas
              </Box>
              ,{' '}creamos{' '}
              <Box component="span" sx={{ background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                bienestar
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: colors.textSecondary, fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.7, maxWidth: 640, mx: 'auto' }}
            >
              Somos una plataforma dedicada a facilitar la conexión entre acompañantes terapéuticos 
              y quienes necesitan de su apoyo. Creemos en el poder transformador del acompañamiento 
              profesional para construir una sociedad más inclusiva y humana.
            </Typography>
          </MotionBox>

          {/* Stats row */}
          <MotionBox {...fadeUp(0.15)} sx={{ mt: { xs: 6, md: 10 } }}>
            <Stack direction="row" spacing={{ xs: 2, md: 6 }} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 3 }}>
              {[
                { value: '+200', label: 'Profesionales verificados', icon: <Users size={20} /> },
                { value: '+50', label: 'Familias conectadas', icon: <HeartHandshake size={20} /> },
                { value: '4.8', label: 'Calificación promedio', icon: <Star size={20} /> },
                { value: '+30', label: 'Municipios alcanzados', icon: <Globe size={20} /> },
              ].map((stat, i) => (
                <Box key={i} sx={{ textAlign: 'center', px: { xs: 2, md: 3 } }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.06)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, border: `1px solid ${alpha(colors.primary, 0.06)}` }}>
                    <Box sx={{ color: colors.primary, display: 'flex' }}>{stat.icon}</Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, lineHeight: 1.1, fontSize: '1.5rem' }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: 500 }}>{stat.label}</Typography>
                </Box>
              ))}
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      {/* ===== MISIÓN ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
        <Grid container spacing={{ xs: 4, md: 10 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox {...fadeUp(0)}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'relative', zIndex: 1,
                    borderRadius: '24px', overflow: 'hidden',
                    background: `linear-gradient(160deg, ${alpha(colors.primary, 0.04)} 0%, ${alpha(colors.secondary, 0.04)} 100%)`,
                    border: `1px solid ${colors.border}`,
                    p: { xs: 3, md: 5 },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                    {['#F43F5E', '#F59E0B', '#10B981'].map((c, i) => (
                      <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                    ))}
                  </Box>
                  <Quote size={32} style={{ color: alpha(colors.primary, 0.2), marginBottom: 16 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary, lineHeight: 1.5, fontSize: { xs: '1.125rem', md: '1.35rem' }, fontStyle: 'italic', mb: 2 }}>
                    "Creemos que cada persona merece acceso a un acompañamiento terapéutico de calidad, y cada profesional merece un espacio donde su trabajo sea valorado."
                  </Typography>
                  <Box sx={{ pt: 2, borderTop: `1px solid ${colors.border}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary }}>— Equipo de El Canal del AT</Typography>
                  </Box>
                </Box>
                {/* Decorative element behind */}
                <Box sx={{ position: 'absolute', bottom: -12, right: -12, width: '100%', height: '100%', borderRadius: '24px', border: `1px solid ${alpha(colors.primary, 0.08)}`, zIndex: 0 }} />
              </Box>
            </MotionBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionBox {...fadeUp(0.1)}>
              <Typography variant="overline" sx={{ color: colors.primary, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.6875rem', mb: 1.5, display: 'block' }}>
                Nuestra Misión
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' }, letterSpacing: '-0.02em', color: colors.textPrimary, mb: 3, lineHeight: 1.2 }}>
                Facilitar el acceso al acompañamiento terapéutico
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textSecondary, fontSize: '1rem', lineHeight: 1.8, mb: 4 }}>
                En <strong>El Canal del AT</strong> trabajamos para derribar las barreras que dificultan la conexión 
                entre profesionales de la salud mental y quienes requieren de su apoyo. Nuestra plataforma 
                nace de la necesidad de crear un puente directo, transparente y humano entre ambas partes.
              </Typography>
              <Stack spacing={2.5}>
                {[
                  { icon: <Target size={20} />, title: 'Visibilidad profesional', desc: 'Damos a los acompañantes terapéuticos las herramientas para mostrar su perfil, experiencia y especialidades.' },
                  { icon: <Shield size={20} />, title: 'Conexiones seguras', desc: 'Verificamos perfiles y facilitamos la comunicación para que cada conexión sea confiable y profesional.' },
                  { icon: <BookOpen size={20} />, title: 'Crecimiento continuo', desc: 'Promovemos la formación y el desarrollo profesional de los acompañantes terapéuticos en todo el país.' },
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.06)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                      <Box sx={{ color: colors.primary, display: 'flex' }}>{item.icon}</Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.25 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.6 }}>{item.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>

      {/* ===== VALORES ===== */}
      <Box sx={{ background: `linear-gradient(180deg, ${colors.background} 0%, ${alpha(colors.primary, 0.02)} 50%, ${colors.background} 100%)`, py: { xs: 8, md: 14 }, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <Container maxWidth="lg">
          <MotionBox {...fadeUp(0)} sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="overline" sx={{ color: colors.primary, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.6875rem', mb: 1.5, display: 'block' }}>
              Nuestros Valores
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' }, letterSpacing: '-0.02em', color: colors.textPrimary, mb: 2 }}>
              Lo que nos define
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, maxWidth: 540, mx: 'auto', fontSize: '1rem', lineHeight: 1.7 }}>
              Estos principios guían cada decisión que tomamos y cada funcionalidad que construimos.
            </Typography>
          </MotionBox>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              { icon: <HeartHandshake size={28} />, title: 'Humanidad', desc: 'Ponemos a las personas en el centro. Cada conexión es única y merece ser tratada con respeto, empatía y calidez.', color: colors.primary },
              { icon: <Award size={28} />, title: 'Excelencia', desc: 'Promovemos los más altos estándares profesionales. Trabajamos para que cada acompañante pueda mostrar su mejor versión.', color: colors.secondary },
              { icon: <Shield size={28} />, title: 'Confianza', desc: 'La seguridad y transparencia son la base de nuestra plataforma. Construimos relaciones duraderas basadas en la confianza mutua.', color: colors.success },
              { icon: <Sparkles size={28} />, title: 'Innovación', desc: 'Buscamos constantemente nuevas formas de mejorar la experiencia, simplificar procesos y crear más oportunidades para todos.', color: colors.warning },
            ].map((value, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <MotionBox {...fadeUp(0.1 * i)}>
                  <Box
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: '20px',
                      border: `1px solid ${colors.border}`,
                      height: '100%',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: `0 24px 60px ${alpha(value.color, 0.08)}`,
                        borderColor: alpha(value.color, 0.2),
                      },
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(value.color, 0.06)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                    <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: `linear-gradient(135deg, ${alpha(value.color, 0.12)} 0%, ${alpha(value.color, 0.04)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, border: `1px solid ${alpha(value.color, 0.08)}` }}>
                      <Box sx={{ color: value.color, display: 'flex' }}>{value.icon}</Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1, fontSize: '1.1rem' }}>{value.title}</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>{value.desc}</Typography>
                  </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===== CTA ===== */}
      <Box sx={{ py: { xs: 8, md: 14 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(colors.primary, 0.04)} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <MotionBox {...fadeUp(0)}>
            <Box sx={{ width: 64, height: 64, borderRadius: '16px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.06)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, border: `1px solid ${alpha(colors.primary, 0.08)}` }}>
              <HeartHandshake size={28} style={{ color: colors.primary }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '2.25rem' }, letterSpacing: '-0.02em', color: colors.textPrimary, mb: 2 }}>
              ¿Te gustaría ser parte?
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 5, fontSize: '1rem', lineHeight: 1.7 }}>
              Ya sea que busques acompañamiento terapéutico o quieras ofrecer tus servicios 
              profesionales, te invitamos a sumarte a nuestra comunidad.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                to="/buscar-acompanante"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={18} />}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  fontWeight: 700, px: 4, py: 1.75, borderRadius: '12px', fontSize: '0.9375rem',
                  boxShadow: `0 8px 28px ${alpha(colors.primary, 0.3)}`,
                  '&:hover': { boxShadow: `0 12px 36px ${alpha(colors.primary, 0.4)}`, transform: 'translateY(-2px)' },
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
                sx={{
                  borderColor: colors.border, color: colors.textPrimary, fontWeight: 600,
                  px: 4, py: 1.75, borderRadius: '12px', fontSize: '0.9375rem',
                  '&:hover': { borderColor: colors.primary, backgroundColor: alpha(colors.primary, 0.04), transform: 'translateY(-2px)' },
                  transition: 'all 0.25s ease',
                }}
              >
                Quiero Trabajar
              </Button>
            </Stack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
};

export default SobreNosotros;
