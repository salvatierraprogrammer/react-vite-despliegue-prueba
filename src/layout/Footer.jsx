import React from 'react';
import { Box, Container, Typography, Grid, IconButton, Link, Divider } from '@mui/material';
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
} from '@mui/icons-material';
import { colors } from '../theme/theme';
import logo from '../asset/logo.png';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        pt: 6,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="El Canal del AT"
                sx={{ height: 48 }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
                  El Canal del AT
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Conectando acompañantes terapéuticos
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 300 }}>
              La plataforma que conecta acompañantes terapéuticos con familias y reclutadores. 
              Construyendo puentes para un cuidado más humano.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <Facebook sx={{ fontSize: 20 }} />, href: '#', color: '#1877F2' },
                { icon: <Twitter sx={{ fontSize: 20 }} />, href: '#', color: '#1DA1F2' },
                { icon: <Instagram sx={{ fontSize: 20 }} />, href: '#', color: '#E4405F' },
                { icon: <LinkedIn sx={{ fontSize: 20 }} />, href: '#', color: '#0A66C2' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: alpha(social.color, 0.1),
                    color: social.color,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(social.color, 0.2),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
              Navegación
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Inicio', 'Buscar Trabajo', 'Buscar AT', 'Iniciar Sesión'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  sx={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: colors.primary },
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
              Recursos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Sobre Nosotros', 'Cómo Funciona', 'Preguntas Frecuentes', 'Blog'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  sx={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: colors.primary },
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: colors.textPrimary }}>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: alpha(colors.primary, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Email sx={{ fontSize: 18, color: colors.primary }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    elcanaldeat@gmail.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: alpha(colors.success, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone sx={{ fontSize: 18, color: colors.success }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    +54 11 3275 2125
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    backgroundColor: alpha(colors.warning, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocationOn sx={{ fontSize: 18, color: colors.warning }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                    Ubicación
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Buenos Aires, Argentina
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3, borderColor: colors.border }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} El Canal del AT. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
              Hecho con
            </Typography>
            <Favorite sx={{ fontSize: 16, color: colors.danger }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
              en Buenos Aires
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
