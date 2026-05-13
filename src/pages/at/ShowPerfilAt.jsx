import React, { useEffect, useState, memo } from 'react';
import { Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, Tabs, Tab, Tooltip, alpha, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Clock, Star, Verified, Edit, MessageCircle,
  Award, Shield, Zap, CalendarDays, School, Target, User,
  Smartphone, Send
} from 'lucide-react';

const ProfileBanner = styled(Box, { shouldForwardProp: (prop) => prop !== 'gradient' })(({ gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  borderRadius: '24px',
  padding: '32px 28px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""', position: 'absolute', top: '-35%', right: '-12%',
    width: 300, height: 300, borderRadius: '50%',
    background: alpha('#fff', 0.07),
  },
  '&::after': {
    content: '""', position: 'absolute', bottom: '-25%', left: '-8%',
    width: 200, height: 200, borderRadius: '50%',
    background: alpha(colors.success, 0.1),
  },
}));

const StatBadge = styled(Box)(({ color }) => ({
  display: 'flex', alignItems: 'center', gap: 1.5,
  padding: '12px 16px', borderRadius: '14px',
  backgroundColor: alpha(color, 0.06),
  border: `1px solid ${alpha(color, 0.1)}`,
  transition: 'all 0.2s ease',
  flex: { xs: 1, sm: 'unset' },
  '&:hover': {
    backgroundColor: alpha(color, 0.1),
    transform: 'translateY(-1px)',
  },
}));

const SectionCard = styled(Paper)({
  borderRadius: '20px',
  overflow: 'hidden',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  transition: 'all 0.25s ease',
  height: 'fit-content',
  '&:hover': {
    boxShadow: `0 8px 28px ${alpha(colors.primary, 0.06)}`,
  },
});

const InfoRow = styled(Box)({
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 20px',
  borderBottom: `1px solid ${colors.border}`,
  '&:last-child': { borderBottom: 'none' },
});

const SkillChip = memo(({ label, color = colors.primary }) => (
  <Chip label={label} size="small" sx={{
    bgcolor: alpha(color, 0.08), color, fontWeight: 500,
    fontSize: '0.75rem', borderRadius: '8px',
    border: `1px solid ${alpha(color, 0.15)}`, height: 28,
    '&:hover': { bgcolor: alpha(color, 0.14) },
  }} />
));

const TabPanel = ({ children, value, index }) => (
  <AnimatePresence mode="wait">
    {value === index && (
      <motion.div key={`tab-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const ShowPerfilAt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRol } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [acompanante, setAcompanante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const canViewContact = userRol === 'reclutador';
  const canEditProfile = user && (user.uid === acompanante?.userId || userRol === 'administrador');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'perfilLaboral', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAcompanante({ id: docSnap.id, ...docSnap.data() });
        } else {
          const docRef2 = doc(db, 'perfilesLaborales', id);
          const docSnap2 = await getDoc(docRef2);
          if (docSnap2.exists()) {
            setAcompanante({ id: docSnap2.id, ...docSnap2.data() });
          }
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
        <Typography variant="h5" sx={{ color: colors.textSecondary, mb: 2 }}>Perfil no encontrado</Typography>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>Volver</Button>
      </Box>
    );
  }

  const gradients = [
    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    `linear-gradient(135deg, ${colors.success} 0%, ${colors.primary} 100%)`,
    `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.warning} 100%)`,
  ];
  const bgGradient = gradients[Math.floor(Math.random() * gradients.length)];

  const phoneClean = (acompanante.telefono || '').replace(/\D/g, '');

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}
        sx={{ mb: 2.5, color: colors.textSecondary, '&:hover': { color: colors.textPrimary, gap: 0.5 }, fontSize: '0.875rem' }}>
        Volver
      </Button>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Left Column */}
        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Profile Banner */}
            <ProfileBanner gradient={bgGradient}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5 }}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar src={acompanante.images || acompanante.photo}
                      sx={{ width: isMobile ? 80 : 92, height: isMobile ? 80 : 92, border: `4px solid ${alpha('#fff', 0.25)}`, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      {acompanante.nombreCompleto?.charAt(0)}
                    </Avatar>
                    {acompanante.verificado && (
                      <Box sx={{ position: 'absolute', bottom: 2, right: 2, width: 24, height: 24, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <Verified size={13} color={colors.primary} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ pb: 0.5, minWidth: 0, flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.25, fontSize: isMobile ? '1.05rem' : '1.2rem', lineHeight: 1.2 }}>
                      {acompanante.nombreCompleto}
                    </Typography>
                    <Chip label={acompanante.estado === 'Disponible' ? 'Disponible' : acompanante.estado || 'AT'}
                      size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#fff', 0.18), color: '#fff' }} />
                  </Box>
                </Box>

                {canViewContact && (
                  <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
                    {acompanante.email && (
                      <Tooltip title="Email">
                        <IconButton href={`mailto:${acompanante.email}`} sx={{ bgcolor: alpha('#fff', 0.14), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) }, width: 38, height: 38 }}>
                          <Mail size={17} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {acompanante.telefono && (
                      <Tooltip title="Llamar">
                        <IconButton href={`tel:${acompanante.telefono}`} sx={{ bgcolor: alpha('#fff', 0.14), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) }, width: 38, height: 38 }}>
                          <Phone size={17} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {acompanante.telefono && (
                      <Tooltip title="WhatsApp">
                        <IconButton href={`https://wa.me/${phoneClean}`} target="_blank" sx={{ bgcolor: alpha('#fff', 0.14), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) }, width: 38, height: 38 }}>
                          <MessageCircle size={17} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>
            </ProfileBanner>

            {/* Stats - horizontal on tablet+ */}
            <SectionCard elevation={0}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="overline" sx={{ color: colors.textMuted, fontSize: '0.625rem', letterSpacing: '0.08em', mb: 1.5, display: 'block' }}>
                  Estadísticas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 1, flexWrap: 'wrap' }}>
                  <StatBadge color={colors.warning}>
                    <Box sx={{ p: 0.5, borderRadius: '8px', bgcolor: alpha(colors.warning, 0.15), color: colors.warning, display: 'flex' }}><Star size={14} /></Box>
                    <Box><Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{acompanante.calificacion || '4.8'}</Typography>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Calificación</Typography></Box>
                  </StatBadge>
                  <StatBadge color={colors.success}>
                    <Box sx={{ p: 0.5, borderRadius: '8px', bgcolor: alpha(colors.success, 0.15), color: colors.success, display: 'flex' }}><Award size={14} /></Box>
                    <Box><Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{acompanante.experiencia || '0'} años</Typography>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Experiencia</Typography></Box>
                  </StatBadge>
                  <StatBadge color={colors.primary}>
                    <Box sx={{ p: 0.5, borderRadius: '8px', bgcolor: alpha(colors.primary, 0.15), color: colors.primary, display: 'flex' }}><Clock size={14} /></Box>
                    <Box><Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{acompanante.disponibilidad || 'Full-time'}</Typography>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Disponibilidad</Typography></Box>
                  </StatBadge>
                </Box>
              </Box>
            </SectionCard>

            {/* Contact Info */}
            <SectionCard elevation={0}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="overline" sx={{ color: colors.textMuted, fontSize: '0.625rem', letterSpacing: '0.08em', mb: 1.5, display: 'block' }}>
                  Contacto
                </Typography>
                <Box>
                  {canViewContact && (
                    <>
                      <InfoRow>
                        <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.primary }}>
                          <Mail size={15} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Email</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>{acompanante.email || 'No disponible'}</Typography>
                        </Box>
                      </InfoRow>
                      <InfoRow>
                        <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(colors.success, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.success }}>
                          <Smartphone size={15} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Teléfono</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>{acompanante.telefono || 'No disponible'}</Typography>
                        </Box>
                      </InfoRow>
                    </>
                  )}
                  <InfoRow>
                    <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(colors.secondary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: colors.secondary }}>
                      <MapPin size={15} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6rem' }}>Ubicación</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>{acompanante.localidad || ''}{acompanante.zona ? ` - ${acompanante.zona}` : ''}</Typography>
                    </Box>
                  </InfoRow>
                </Box>
              </Box>
            </SectionCard>

            {/* WhatsApp CTA */}
            {canViewContact && phoneClean && (
              <Button fullWidth variant="contained" startIcon={<Send size={16} />}
                href={`https://wa.me/${phoneClean}`} target="_blank"
                sx={{ py: 1.3, borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg, #25D366, #128C7E)', '&:hover': { background: 'linear-gradient(135deg, #20BD5C, #0E7A6B)' } }}>
                Contactar por WhatsApp
              </Button>
            )}
            {canEditProfile && (
              <Button fullWidth variant="outlined" startIcon={<Edit size={16} />}
                onClick={() => navigate(`/editarPerfilLaboral/${id}`)}
                sx={{ py: 1.3, borderRadius: '12px', fontWeight: 600, fontSize: '0.875rem' }}>
                Editar Perfil
              </Button>
            )}
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={7} lg={8}>
          <SectionCard elevation={0}>
            <Box sx={{ borderBottom: `1px solid ${colors.border}`, px: { xs: 1, sm: 2 } }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{ minHeight: 50, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 50, py: 1.2 } }}>
                <Tab label="Perfil" icon={<User size={15} />} iconPosition="start" />
                <Tab label="Experiencia" icon={<Briefcase size={15} />} iconPosition="start" />
                <Tab label="Formación" icon={<GraduationCap size={15} />} iconPosition="start" />
              </Tabs>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), color: colors.primary, display: 'flex' }}><Zap size={17} /></Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Acerca de mí</Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.02), border: `1px solid ${alpha(colors.primary, 0.06)}` }}>
                    <Typography variant="body2" sx={{ lineHeight: 1.7, color: colors.textPrimary }}>{acompanante.sobreMi || 'Este profesional aún no ha completado su descripción.'}</Typography>
                  </Paper>
                </Box>

                <Box sx={{ mb: 3.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.secondary, 0.08), color: colors.secondary, display: 'flex' }}><Target size={17} /></Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Preferencia Laboral</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {acompanante.preferenciaLaboral?.split(',').map((pref, i) => (<SkillChip key={i} label={pref.trim()} color={colors.secondary} />))}
                    <SkillChip label={acompanante.zona || 'CABA'} color={colors.primary} />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.success, 0.08), color: colors.success, display: 'flex' }}><Shield size={17} /></Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Habilidades</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {['Acompañamiento Terapéutico', 'Apoyo Escolar', 'Autismo', 'TEA', 'Discapacidad', 'Rehabilitación'].map(s => (<SkillChip key={s} label={s} color={colors.success} />))}
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha(colors.warning, 0.1), color: colors.warning, display: 'flex' }}><Award size={20} /></Box>
                  <Box><Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{acompanante.experiencia || '0'} años de experiencia</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>En acompañamientos terapéuticos</Typography></Box>
                </Box>
                <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', bgcolor: alpha(colors.warning, 0.02), border: `1px solid ${alpha(colors.warning, 0.08)}` }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>Amplia experiencia en el acompañamiento de pacientes con diversas condiciones, incluyendo trastornos del espectro autista, discapacidad intelectual, y necesidades de rehabilitación. Enfocado en proporcionar apoyo integral tanto al paciente como a su familia.</Typography>
                </Paper>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha(colors.success, 0.1), color: colors.success, display: 'flex' }}><GraduationCap size={20} /></Box>
                  <Box><Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Formación</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>{acompanante.formacion || 'Profesional en área de salud'}</Typography></Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { icon: School, title: 'Certificación en Acompañamiento Terapéutico', sub: 'Instituto de Formación Profesional • 2020', color: colors.success },
                    { icon: CalendarDays, title: 'Taller de Intervención en Crisis', sub: 'Centro de Capacitación en Salud Mental • 2021', color: colors.secondary },
                  ].map((item, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: '14px', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 0.8, borderRadius: '8px', bgcolor: alpha(item.color, 0.08), color: item.color, display: 'flex' }}><item.icon size={17} /></Box>
                      <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600, mb: 0.15, fontSize: '0.8125rem' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>{item.sub}</Typography></Box>
                    </Paper>
                  ))}
                </Box>
              </TabPanel>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShowPerfilAt;
