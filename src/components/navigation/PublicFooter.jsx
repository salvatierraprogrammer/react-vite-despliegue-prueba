import React from 'react';
import { Box, Container, Typography, IconButton, Link, Stack, Grid, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Email,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Favorite,
  LocationOn,
  ArrowUpward,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import logo from '../../asset/logo.png';

const footerLinks = {
  navigation: [
    { label: 'Inicio', path: '/' },
    { label: 'Buscar Trabajo', path: '/buscar-trabajo' },
    { label: 'Buscar AT', path: '/buscar-acompanante' },
    { label: 'Sobre Nosotros', path: '/acompaniante-terapeutico' },
  ],
  resources: [
    { label: 'Crear Cuenta', path: '/crearCuenta' },
    { label: 'Iniciar Sesión', path: '/login' },
    { label: '¿Cómo funciona?', path: '/acompaniante-terapeutico' },
  ],
  contact: [
    { icon: <Email sx={{ fontSize: 18 }} />, label: 'Email', value: 'elcanaldeat@gmail.com', color: colors.primary },
    { icon: <Phone sx={{ fontSize: 18 }} />, label: 'Teléfono', value: '+54 11 3275 2125', color: colors.success },
    { icon: <LocationOn sx={{ fontSize: 18 }} />, label: 'Ubicación', value: 'Buenos Aires, Argentina', color: colors.warning },
  ],
  social: [
    { icon: <Facebook sx={{ fontSize: 18 }} />, href: '#', color: '#1877F2' },
    { icon: <Twitter sx={{ fontSize: 18 }} />, href: '#', color: '#1DA1F2' },
    { icon: <Instagram sx={{ fontSize: 18 }} />, href: '#', color: '#E4405F' },
    { icon: <LinkedIn sx={{ fontSize: 18 }} />, href: '#', color: '#0A66C2' },
  ],
};

const FooterColumn = ({ title, children }) => (
  <Box>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 700,
        mb: 2.5,
        color: colors.textPrimary,
        fontSize: '0.8125rem',
        letterSpacing: '0.02em',
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const PublicFooter = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        position: 'relative',
      }}
    >
      {/* Gradient accent bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${alpha(colors.success, 0.6)} 100%)`,
        }}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Box component="img" src={logo} alt="El Canal del AT" sx={{ height: 42 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2, fontSize: '0.9375rem' }}>
                  El Canal del AT
                </Typography>
                <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500 }}>
                  Conectando acompañantes terapéuticos
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, mb: 3, maxWidth: 320, lineHeight: 1.7, fontSize: '0.8125rem' }}
            >
              La plataforma que conecta acompañantes terapéuticos con familias y
              reclutadores. Construyendo puentes para un cuidado más humano y profesional.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {footerLinks.social.map((social, i) => (
                <IconButton
                  key={i}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: alpha(social.color, 0.06),
                    color: social.color,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: social.color,
                      color: '#fff',
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 16px ${alpha(social.color, 0.3)}`,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Navigation */}
          <Grid item xs={6} md={2}>
            <FooterColumn title="Navegación">
              <Stack spacing={1.25}>
                {footerLinks.navigation.map((item) => (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: colors.textSecondary,
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      transition: 'all 0.2s ease',
                      '&:hover': { color: colors.primary, paddingLeft: '4px' },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </FooterColumn>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <FooterColumn title="Recursos">
              <Stack spacing={1.25}>
                {footerLinks.resources.map((item) => (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: colors.textSecondary,
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      transition: 'all 0.2s ease',
                      '&:hover': { color: colors.primary, paddingLeft: '4px' },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </FooterColumn>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <FooterColumn title="Contacto">
              <Stack spacing={2}>
                {footerLinks.contact.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '10px',
                        backgroundColor: alpha(item.color, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { fontSize: 16, color: item.color } })}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 500, lineHeight: 1.2, mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3, color: colors.textPrimary, fontSize: '0.8125rem' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </FooterColumn>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            pt: { xs: 3, md: 3.5 },
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.75rem', order: { xs: 2, sm: 1 } }}>
            © {new Date().getFullYear()} El Canal del AT. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, order: { xs: 1, sm: 2 } }}>
            <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.75rem' }}>
              Hecho con
            </Typography>
            <Favorite sx={{ fontSize: 14, color: colors.danger }} />
            <Typography variant="body2" sx={{ color: colors.textMuted, fontSize: '0.75rem' }}>
              en Buenos Aires
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={scrollToTop}
            sx={{
              minWidth: 34,
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: alpha(colors.primary, 0.06),
              color: colors.primary,
              '&:hover': { backgroundColor: alpha(colors.primary, 0.12) },
              order: { xs: 3, sm: 3 },
            }}
          >
            <ArrowUpward sx={{ fontSize: 16 }} />
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicFooter;
