import React, { useEffect, useState, memo } from 'react';
import { Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, Tabs, Tab, Divider, Rating, LinearProgress, Tooltip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import { colors } from '../theme/theme';
import { LoadingPage } from './feedback/LoadingSpinner';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Clock,
  Star,
  Verified,
  Edit,
  MessageCircle,
  ChevronRight,
  Calendar,
  Award,
  Globe,
  FileText,
  Send,
  ExternalLink,
  Shield,
  Zap,
  Users,
} from 'lucide-react';

const ProfileHeader = styled(Box, { shouldForwardProp: (prop) => prop !== 'gradient' })(({ gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  borderRadius: '24px',
  padding: '40px 32px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-60%',
    right: '-20%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-40%',
    left: '-10%',
    width: '300px',
    height: '300px',
    background: `radial-gradient(circle, ${alpha(colors.success, 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const StatCard = styled(Box, { shouldForwardProp: (prop) => prop !== 'color' })(({ color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  padding: 16,
  borderRadius: '16px',
  backgroundColor: alpha(color, 0.08),
  border: `1px solid ${alpha(color, 0.12)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(color, 0.12),
    transform: 'translateY(-2px)',
  },
}));

const InfoCard = memo(({ icon: Icon, label, value, color = colors.primary }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      p: 2.5,
      borderRadius: '16px',
      bgcolor: alpha(color, 0.03),
      border: `1px solid ${alpha(color, 0.08)}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: alpha(color, 0.06),
        borderColor: alpha(color, 0.15),
      },
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        bgcolor: alpha(color, 0.12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}
    >
      <Icon size={20} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }} noWrap>
        {value || 'No especificado'}
      </Typography>
    </Box>
  </Box>
));

const SkillChip = memo(({ label, color }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      bgcolor: alpha(color, 0.1),
      color: color,
      fontWeight: 500,
      fontSize: '0.75rem',
      borderRadius: '8px',
      border: `1px solid ${alpha(color, 0.2)}`,
    }}
  />
));

const ActionButton = memo(({ icon: Icon, label, href, onClick, color = colors.primary }) => (
  <Button
    variant="outlined"
    href={href}
    target={href?.includes('http') ? '_blank' : undefined}
    onClick={onClick}
    startIcon={<Icon size={16} />}
    sx={{
      justifyContent: 'flex-start',
      py: 1.5,
      px: 2.5,
      borderRadius: '14px',
      borderColor: alpha(color, 0.2),
      color: color,
      '&:hover': {
        borderColor: color,
        bgcolor: alpha(color, 0.04),
        transform: 'translateX(4px)',
      },
      transition: 'all 0.2s ease',
    }}
  >
    {label}
  </Button>
));

const TabPanel = ({ children, value, index }) => (
  <AnimatePresence mode="wait">
    {value === index && (
      <motion.div
        key={`tab-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const ShowPerfilAt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acompanante, setAcompanante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'perfilesLaborales', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAcompanante({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <LoadingPage />;

  if (!acompanante) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: colors.textSecondary, mb: 2 }}>
          Perfil no encontrado
        </Typography>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>
    );
  }

  const gradientColors = [
    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    `linear-gradient(135deg, ${colors.success} 0%, ${colors.primary} 100%)`,
    `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.warning} 100%)`,
  ];

  const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ maxWidth: 1200, mx: 'auto' }}
    >
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: colors.textSecondary }}
      >
        Volver
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ProfileHeader gradient={randomGradient}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={acompanante.images || acompanante.photo}
                      sx={{
                        width: 100,
                        height: 100,
                        border: `4px solid ${alpha('#fff', 0.3)}`,
                        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                      }}
                    >
                      {acompanante.nombreCompleto?.charAt(0)}
                    </Avatar>
                    {acompanante.verificado && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Verified size={16} color={colors.primary} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ pb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                      {acompanante.nombreCompleto}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                      {acompanante.titulo}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', gap: 1.5 }}>
                  <Tooltip title="Enviar email">
                    <IconButton
                      href={`mailto:${acompanante.email}`}
                      sx={{
                        bgcolor: alpha('#fff', 0.2),
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) },
                      }}
                    >
                      <Mail size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Llamar">
                    <IconButton
                      href={`tel:${acompanante.telefono}`}
                      sx={{
                        bgcolor: alpha('#fff', 0.2),
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) },
                      }}
                    >
                      <Phone size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="WhatsApp">
                    <IconButton
                      href={`https://wa.me/${acompanante.telefono}`}
                      target="_blank"
                      sx={{
                        bgcolor: alpha('#fff', 0.2),
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) },
                      }}
                    >
                      <MessageCircle size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </ProfileHeader>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Estadísticas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <StatCard color={colors.warning}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.warning, 0.15), color: colors.warning }}>
                    <Star size={16} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {acompanante.calificacion || 4.8}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Calificación
                    </Typography>
                  </Box>
                </StatCard>
                <StatCard color={colors.success}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.success, 0.15), color: colors.success }}>
                    <Award size={16} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {acompanante.experiencia || 3}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Años de experiencia
                    </Typography>
                  </Box>
                </StatCard>
                <StatCard color={colors.primary}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.15), color: colors.primary }}>
                    <Briefcase size={16} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {acompanante.disponibilidad || 'Full-time'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Disponibilidad
                    </Typography>
                  </Box>
                </StatCard>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Contacto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InfoCard icon={Mail} label="Email" value={acompanante.email} />
                <InfoCard icon={Phone} label="Teléfono" value={acompanante.telefono} />
                <InfoCard icon={MapPin} label="Localidad" value={acompanante.localidad} color={colors.secondary} />
                <InfoCard icon={Globe} label="Zona" value={acompanante.zona} color={colors.success} />
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ActionButton
                icon={MessageCircle}
                label="Enviar mensaje"
                href={`https://wa.me/${acompanante.telefono}`}
              />
              <ActionButton
                icon={Heart}
                label="Guardar en favoritos"
                color={colors.danger}
              />
              <Button
                fullWidth
                onClick={() => navigate(`/editarPerfilLaboral/${id}`)}
                sx={{ py: 1.5, borderRadius: '14px' }}
              >
                Editar Perfil
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: `1px solid ${colors.border}`, px: 2 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ minHeight: 56 }}>
                <Tab label="Perfil" />
                <Tab label="Experiencia" />
                <Tab label="Formación" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: colors.textMuted }}>
                    Acerca de mí
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mt: 1.5,
                      borderRadius: '16px',
                      bgcolor: alpha(colors.primary, 0.03),
                      border: `1px solid ${alpha(colors.primary, 0.08)}`,
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: colors.textPrimary }}>
                      {acompanante.sobreMi || 'Este profesional aún no ha completado su descripción.'}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: colors.textMuted, mb: 2, display: 'block' }}>
                    Preferencia Laboral
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {acompanante.preferenciaLaboral?.split(',').map((pref, i) => (
                      <SkillChip key={i} label={pref.trim()} color={colors.secondary} />
                    ))}
                    {['CABA', 'Zona Norte', 'Zona Sur'].map(zone => (
                      <SkillChip key={zone} label={zone} color={colors.primary} />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: colors.textMuted, mb: 2, display: 'block' }}>
                    Habilidades
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Acompañamiento Terapéutico', 'Apoyo Escolar', 'Autismo', 'TEA', 'Discapacidad', 'Rehabilitación'].map(skill => (
                      <SkillChip key={skill} label={skill} color={colors.success} />
                    ))}
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(colors.warning, 0.1), color: colors.warning }}>
                      <Award size={20} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {acompanante.experiencia || 3} años de experiencia
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        En acompañamientos terapéuticos
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: alpha(colors.primary, 0.03),
                    border: `1px solid ${alpha(colors.primary, 0.08)}`,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    Amplia experiencia en el acompañamiento de pacientes con diversas condiciones, incluyendo trastornos del espectro autista, discapacidad intelectual, y necesidades de rehabilitación. Enfocado en proporcionar apoyo integral tanto al paciente como a su familia.
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(colors.success, 0.1), color: colors.success }}>
                      <GraduationCap size={20} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Formación
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        {acompanante.formacion || 'Profesional en área de salud'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: `1px solid ${colors.border}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Certificación en Acompañamiento Terapéutico
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Instituto de Formación Profesional • 2020
                    </Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', border: `1px solid ${colors.border}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Taller de Intervención en Crisis
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Centro de Capacitación en Salud Mental • 2021
                    </Typography>
                  </Paper>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShowPerfilAt;