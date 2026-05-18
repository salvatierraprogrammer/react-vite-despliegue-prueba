import React, { useEffect, useState, memo, useMemo } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button, Badge,
  Tabs, Tab, alpha, useMediaQuery, useTheme, Container, Stack,
  Divider, Skeleton
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, limit as fLimit } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { generarPerfilSlug } from '../../utils/slugUtils';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

import { useBreadcrumb } from '../../components/layout/DashboardLayout';
import {
  Mail, Phone, MapPin, Briefcase, GraduationCap,
  Clock, Star, Verified, Edit, MessageCircle,
  Award, Shield, Users, CheckCircle,
  Heart, Building, FileText, Globe, BookOpen,
  Activity, Sparkles, Quote, Eye
} from 'lucide-react';
import FilePreviewModal from '../../components/feedback/FilePreviewModal';

const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.2); }
  70% { box-shadow: 0 0 0 12px rgba(79, 70, 229, 0); }
  100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
`;

const Root = styled(Box)({
  minHeight: 'calc(100vh - 64px)',
  position: 'relative',
});

const CoverGradient = styled(Box)({
  position: 'absolute',
  inset: 0,
  borderRadius: '24px',
  overflow: 'hidden',
  background: `
    linear-gradient(160deg,
      ${colors.primary} 0%,
      ${alpha(colors.primary, 0.7)} 40%,
      ${alpha('#7C3AED', 0.35)} 70%,
      ${alpha('#D97706', 0.08)} 100%
    )
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 100% 70% at 0% 100%, rgba(255,255,255,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 100% 0%, rgba(245,158,11,0.08) 0%, transparent 50%)
    `,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '128px 128px',
    opacity: 0.5,
  },
});

const MetricCard = styled(Paper)({
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.border, 0.7)}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: `0 1px 3px ${alpha(colors.primary, 0.04)}`,
  '&:hover': {
    boxShadow: `0 8px 28px ${alpha(colors.primary, 0.07)}`,
    transform: 'translateY(-1px)',
  },
});

const InfoRow = styled(Box)(({ accent }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: alpha(accent || colors.primary, 0.03),
  border: `1px solid ${alpha(accent || colors.primary, 0.06)}`,
  transition: 'all 0.25s ease',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    background: `linear-gradient(180deg, ${accent || colors.primary}, ${alpha(accent || colors.primary, 0.3)})`,
    borderRadius: '0 2px 2px 0',
  },
  '&:hover': {
    backgroundColor: alpha(accent || colors.primary, 0.06),
    transform: 'translateX(3px)',
  },
}));

const PillTabs = styled(Tabs)({
  minHeight: 40,
  padding: '3px',
  backgroundColor: alpha(colors.primary, 0.04),
  borderRadius: '10px',
  border: `1px solid ${alpha(colors.border, 0.6)}`,
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});

const PillTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.71875rem',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  minHeight: 34,
  padding: '4px 12px',
  borderRadius: '8px',
  color: colors.textSecondary,
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    color: '#fff',
    backgroundColor: colors.primary,
    boxShadow: `0 2px 6px ${alpha(colors.primary, 0.2)}`,
  },
  '& .MuiTab-iconWrapper': {
    marginRight: 4,
  },
  '&:not(.Mui-selected):hover': {
    color: colors.primary,
    backgroundColor: alpha(colors.primary, 0.06),
  },
});

const TabPanel = ({ children, value, index }) => (
  value === index && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Box sx={{ pt: 1 }}>{children}</Box>
    </motion.div>
  )
);

const SectionIcon = ({ icon, color: accent }) => (
  <Box sx={{
    borderRadius: '8px',
    bgcolor: alpha(accent || colors.primary, 0.08),
    color: accent || colors.primary,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, flexShrink: 0,
  }}>
    {icon}
  </Box>
);

const SectionTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: colors.textPrimary,
  fontFamily: '"Plus Jakarta Sans", sans-serif',
});

const SkillChip = memo(({ label, color: accent = colors.primary }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      bgcolor: alpha(accent, 0.07), color: accent, fontWeight: 500,
      fontSize: '0.6875rem', borderRadius: '6px',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      border: `1px solid ${alpha(accent, 0.12)}`, height: 26,
      transition: 'all 0.2s ease',
      '&:hover': { bgcolor: alpha(accent, 0.12), transform: 'translateY(-1px)' },
    }}
  />
));

const ProfileSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{ position: 'relative', height: { xs: 100, md: 130 }, borderRadius: '24px', mb: { xs: 2, md: 3 }, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" animation="wave" sx={{ width: '100%', height: '100%', borderRadius: '24px', bgcolor: alpha(colors.primary, 0.04) }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-end' }, gap: { xs: 2, md: 3 }, mb: 3, mt: { xs: -10, md: -12 }, position: 'relative', zIndex: 2 }}>
        <Skeleton variant="circular" animation="wave" sx={{ width: { xs: 100, md: 130 }, height: { xs: 100, md: 130 }, border: `4px solid ${colors.surface}` }} />
        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, pb: { xs: 0, md: 0.5 } }}>
          <Skeleton animation="wave" width="55%" height={32} sx={{ mb: 0.5, mx: { xs: 'auto', md: 0 } }} />
          <Skeleton animation="wave" width="35%" height={18} sx={{ mb: 1.25, mx: { xs: 'auto', md: 0 } }} />
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
            <Skeleton animation="wave" variant="rounded" width={90} height={24} sx={{ borderRadius: '8px' }} />
            <Skeleton animation="wave" variant="rounded" width={140} height={24} sx={{ borderRadius: '8px' }} />
          </Stack>
        </Box>
      </Box>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4.5} lg={3.8}>
          <Stack spacing={2}>
            <Skeleton animation="wave" variant="rectangular" height={220} sx={{ borderRadius: '16px' }} />
            <Skeleton animation="wave" variant="rectangular" height={260} sx={{ borderRadius: '16px' }} />
            <Skeleton animation="wave" variant="rectangular" height={80} sx={{ borderRadius: '14px' }} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={7.5} lg={8.2}>
          <Skeleton animation="wave" variant="rectangular" height={420} sx={{ borderRadius: '16px' }} />
        </Grid>
      </Grid>
    </Box>
  </motion.div>
);

function formatWhatsAppNumber(phone) {
  const clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('549')) return clean;
  if (clean.startsWith('54')) return '549' + clean.slice(2);
  if (clean.startsWith('0')) return '549' + clean.slice(1);
  return '549' + clean;
}

function normalizeProfile(data) {
  const nombreCompleto = data.nombreCompleto || (data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : data.nombre || data.nombreCompleto || '');
  const sobreMi = data.sobreMi || data.descripcion || '';
  const preferenciaLaboral = data.preferenciaLaboral || data.prefereciaLaboral || data.especialidades || data.poblacion || '';
  const experiencia = data.experiencia || '';
  const formacion = data.formacion || data.estudios || '';
  const formacionDetalle = data.formacionDetalle && data.formacionDetalle !== data.formacion ? data.formacionDetalle : '';
  const calificacion = data.calificacion || data.valoracion || '';
  const imgSrc = data.images || data.imagenes || data.photo || data.photoURL || '';
  const images = Array.isArray(imgSrc) ? (imgSrc[0] || '') : imgSrc;
  const disponibilidad = data.disponibilidad || data.horarios || '';
  const habilidades = data.habilidades || data.modalidades || '';
  const instituciones = data.instituciones || '';
  const idiomas = data.idiomas || '';
  const cvUrl = data.cvURL || data.cvUrl || '';
  const cvName = data.cvName || '';
  const cvType = data.cvType || '';
  const cvSize = data.cvSize || 0;
  return { ...data, nombreCompleto, sobreMi, preferenciaLaboral, experiencia, formacion, formacionDetalle, calificacion, images, disponibilidad, habilidades, instituciones, idiomas, cvUrl, cvName, cvType, cvSize };
}

function extractYears(text) {
  if (!text || text === '--') return null;
  if (/^\d+$/.test(text.trim())) return parseInt(text.trim(), 10);
  const m = text.match(/(\d+)\s*(años?|años)/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

const EMPTY_MESSAGES = {
  sobreMi: 'Contá tu enfoque de trabajo y tu experiencia clínica. Las familias buscan profesionales que transmitan seguridad y compromiso.',
  experiencia: 'Compartí tu trayectoria en acompañamientos. Cada caso atendido construye la confianza de quien necesita contención profesional.',
  formacion: 'Tu formación académica y certificaciones son el pilar de tu credibilidad profesional. Agregalas para que las familias conozcan tu preparación.',
  habilidades: 'Las familias valoran conocer tus fortalezas terapéuticas. Contá qué herramientas y enfoques utilizás en tu práctica diaria.',
  disponibilidad: 'Informá tu disponibilidad horaria para conectar con casos que se adapten a tu agenda.',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const ShowPerfilAt = () => {
  const { slug, id } = useParams();
  const paramId = slug || id;
  const navigate = useNavigate();
  const { user, userRol } = useAuth();
  const { setCaseTitle } = useBreadcrumb();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [viewerComplete, setViewerComplete] = useState(true);

  useEffect(() => {
    const checkViewerProfile = async () => {
      if (!user) return;
      if (userRol === 'reclutador' || userRol === 'familiar') {
        try {
          const viewerSnap = await getDoc(doc(db, 'usuarios', user.uid));
          if (viewerSnap.exists()) {
            const data = viewerSnap.data();
            const hasPhone = !!data.phoneNumber;
            const hasNombreEntidad = userRol === 'familiar' ? true : !!data.nombreEntidad;
            const hasEmailLaboral = userRol === 'reclutador' ? !!data.emailLaboral : true;
            setViewerComplete(hasPhone && hasNombreEntidad && hasEmailLaboral);
          }
        } catch (err) {
          console.error('Error checking viewer profile:', err);
        }
      }
    };
    checkViewerProfile();
  }, [user, userRol]);

  const isOwner = user && user.uid === profile?.userId;
  const canViewContact = userRol === 'reclutador' || userRol === 'administrador' || userRol === 'familiar' || isOwner;
  const canEditProfile = isOwner || userRol === 'administrador';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let found = null;
        let foundId = null;
        let foundRef = null;

        if (slug) {
          const perfilRef = collection(db, 'perfilLaboral');
          const q = query(perfilRef, where('slug', '==', slug), fLimit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            found = snap.docs[0].data();
            foundId = snap.docs[0].id;
            foundRef = doc(db, 'perfilLaboral', foundId);
          } else {
            const q2 = query(collection(db, 'perfilesLaborales'), where('slug', '==', slug), fLimit(1));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
              found = snap2.docs[0].data();
              foundId = snap2.docs[0].id;
              foundRef = doc(db, 'perfilesLaborales', foundId);
            }
          }
        }

        if (!found) {
          const snap = await getDoc(doc(db, 'perfilLaboral', paramId));
          if (snap.exists()) {
            found = snap.data();
            foundId = snap.id;
            foundRef = doc(db, 'perfilLaboral', foundId);
          } else {
            const snap2 = await getDoc(doc(db, 'perfilesLaborales', paramId));
            if (snap2.exists()) {
              found = snap2.data();
              foundId = snap2.id;
              foundRef = doc(db, 'perfilesLaborales', foundId);
            }
          }
        }

        if (found) {
          found = normalizeProfile(found);
        }

        if (found && !found.slug && found.nombreCompleto) {
          const newSlug = generarPerfilSlug(found.nombreCompleto);
          await updateDoc(foundRef, { slug: newSlug });
          found.slug = newSlug;
        }

        if (found && found.slug && found.slug !== slug) {
          navigate(`/perfil/${found.slug}`, { replace: true });
          return;
        }

        if (found) {
          setProfile({ id: foundId, ...found });
          setCaseTitle(found.nombreCompleto || 'Perfil');
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    return () => setCaseTitle(null);
  }, [slug, paramId, setCaseTitle, navigate]);

  const habilidadesList = useMemo(() => {
    const raw = profile?.habilidades;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }, [profile?.habilidades]);

  const preferencias = useMemo(() => {
    if (!profile?.preferenciaLaboral) return [];
    return profile.preferenciaLaboral.split(',').map(s => s.trim()).filter(Boolean);
  }, [profile?.preferenciaLaboral]);

  const formacionDetalle = useMemo(() => {
    const raw = profile?.formacionDetalle;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return [{ title: raw }];
    return [];
  }, [profile?.formacionDetalle]);

  const hasUniqueFormacionDetalle = formacionDetalle.length > 0 && profile?.formacionDetalle !== profile?.formacion;

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const p = profile;
    const fields = [
      p.sobreMi, p.experiencia, p.formacion,
      p.telefono, p.email, p.localidad, p.images, p.titulo, p.habilidades, p.preferenciaLaboral,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const nombreCompleto = profile?.nombreCompleto || 'Sin nombre';
  const titulo = profile?.titulo || 'Acompañante Terapéutico';
  const estado = profile?.estado || 'Disponible';
  const localidad = profile?.localidad || '';
  const zona = profile?.zona || '';
  const ubicacion = localidad + (zona ? ` - ${zona}` : '');
  const calificacion = profile?.calificacion || '--';
  const experiencia = profile?.experiencia || '';
  const experienciaAnios = extractYears(experiencia);
  const disponibilidad = profile?.disponibilidad || 'Consultar';

  const statusConfig = {
    Disponible: { color: colors.success, bgColor: alpha(colors.success, 0.1), label: 'Disponible', icon: CheckCircle },
    'En caso': { color: '#D97706', bgColor: alpha('#D97706', 0.1), label: 'En caso', icon: Clock },
    Consultar: { color: colors.textSecondary, bgColor: alpha(colors.textSecondary, 0.1), label: 'Consultar', icon: Clock },
  };
  const statusInfo = statusConfig[estado] || statusConfig.Disponible;
  const StatusIcon = statusInfo.icon;

  const waNumber = formatWhatsAppNumber(profile?.telefono);
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent('¡Hola! 👋 Vi tu perfil en El Canal del AT. Me interesa tu perfil profesional. ¿Podemos coordinar? 😊')}` : '';

  if (loading) {
    return (
      <Root>
        <ProfileSkeleton />
      </Root>
    );
  }

  if (!profile) {
    return (
      <Root>
        <Container maxWidth="sm" sx={{ py: 12 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{
                width: 96, height: 96, borderRadius: '24px',
                background: alpha(colors.primary, 0.06),
                border: `1px solid ${alpha(colors.primary, 0.1)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3.5,
              }}>
                <Activity size={38} color={alpha(colors.primary, 0.4)} />
              </Box>
              <Typography variant="h4" sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 700, fontSize: '1.75rem',
                color: colors.textPrimary, mb: 1.5,
              }}>
                Perfil no encontrado
              </Typography>
              <Typography variant="body2" sx={{
                color: colors.textSecondary, mb: 4,
                maxWidth: 380, mx: 'auto', lineHeight: 1.8,
                fontSize: '0.875rem',
              }}>
                El perfil que buscás no existe o fue eliminado. Si pensás que hay un error, comunicate con nosotros.
              </Typography>
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: '12px', fontWeight: 600, px: 4.5, py: 1.3,
                  fontSize: '0.875rem',
                }}
              >
                Volver al inicio
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Root>
    );
  }

  return (
    <Root>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* ═══════ COVER BANNER ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Box sx={{ position: 'relative', height: { xs: 100, md: 130 }, borderRadius: '24px', mb: { xs: 2, md: 3 } }}>
              <CoverGradient />
            </Box>
          </motion.div>

          {/* ═══════ PROFILE HEADER (inline avatar + info) ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          >
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-end' },
              gap: { xs: 2, md: 3 },
              mb: 3,
              mt: { xs: -10, md: -12 },
              position: 'relative',
              zIndex: 2,
            }}>
              {/* Avatar */}
              <Box sx={{ flexShrink: 0, position: 'relative' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box sx={{
                      width: 30, height: 30,
                      borderRadius: '50%',
                      background: profile.verificado
                        ? `linear-gradient(135deg, ${colors.primary}, #7C3AED)`
                        : colors.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 2px 8px ${alpha(colors.primary, 0.15)}`,
                      border: `2px solid ${colors.surface}`,
                    }}>
                      {profile.verificado ? (
                        <Verified size={14} color="#FFFFFF" />
                      ) : (
                        <CheckCircle size={13} color={alpha(colors.textSecondary, 0.4)} />
                      )}
                    </Box>
                  }
                >
                  <Avatar
                    src={profile.images}
                    slotProps={{ img: { referrerPolicy: 'no-referrer' } }}
                    sx={{
                      width: { xs: 100, md: 130 },
                      height: { xs: 100, md: 130 },
                      fontSize: { xs: '2.25rem', md: '3rem' },
                      fontWeight: 700,
                      color: colors.primary,
                      bgcolor: alpha(colors.primary, 0.06),
                      border: `4px solid ${colors.surface}`,
                      boxShadow: `0 12px 40px ${alpha(colors.primary, 0.18)}`,
                      transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                      '&:hover': { transform: 'scale(1.03)', boxShadow: `0 16px 48px ${alpha(colors.primary, 0.25)}` },
                    }}
                  >
                    {nombreCompleto.charAt(0)}
                  </Avatar>
                </Badge>
              </Box>

              {/* Info */}
              <Box sx={{
                flex: 1,
                textAlign: { xs: 'center', md: 'left' },
                pb: { xs: 0, md: 0.5 },
              }}>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: { xs: '1.55rem', md: '1.95rem' },
                    color: colors.textPrimary,
                    lineHeight: 1.15,
                    mb: 0.15,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {nombreCompleto}
                  {profile.verificado && (
                    <Verified
                      size={18}
                      style={{
                        display: 'inline',
                        marginLeft: 6,
                        verticalAlign: 'middle',
                        color: colors.primary,
                      }}
                    />
                  )}
                </Typography>

                <Typography
                  sx={{
                    color: colors.textPrimary,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    mb: 1.25,
                  }}
                >
                  {titulo}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1.25 }}
                >
                  <Chip
                    icon={<StatusIcon size={11} />}
                    label={statusInfo.label}
                    size="small"
                    sx={{
                      height: 24, fontSize: '0.6875rem', fontWeight: 600, borderRadius: '8px',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      bgcolor: alpha(statusInfo.color, 0.08),
                      color: statusInfo.color,
                      border: `1px solid ${alpha(statusInfo.color, 0.15)}`,
                      '& .MuiChip-icon': { fontSize: '0.6875rem', ml: 0.4 },
                    }}
                  />
                  {ubicacion && (
                    <Chip
                      icon={<MapPin size={11} />}
                      label={ubicacion}
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.6875rem', fontWeight: 500, borderRadius: '8px',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        bgcolor: alpha(colors.textSecondary, 0.06),
                        color: colors.textSecondary,
                        border: `1px solid ${alpha(colors.textSecondary, 0.12)}`,
                        '& .MuiChip-icon': { fontSize: '0.6875rem', ml: 0.4 },
                      }}
                    />
                  )}
                  {experienciaAnios && (
                    <Chip
                      icon={<Award size={11} />}
                      label={`${experienciaAnios} años`}
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.6875rem', fontWeight: 600, borderRadius: '8px',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        bgcolor: alpha('#D97706', 0.08),
                        color: '#D97706',
                        border: `1px solid ${alpha('#D97706', 0.15)}`,
                        '& .MuiChip-icon': { fontSize: '0.6875rem', ml: 0.4 },
                      }}
                    />
                  )}
                  {profile.calificacion && profile.calificacion !== '--' && (
                    <Chip
                      icon={<Star size={11} />}
                      label={profile.calificacion}
                      size="small"
                      sx={{
                        height: 24, fontSize: '0.6875rem', fontWeight: 600, borderRadius: '8px',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        bgcolor: alpha(colors.primary, 0.08),
                        color: colors.primary,
                        border: `1px solid ${alpha(colors.primary, 0.15)}`,
                        '& .MuiChip-icon': { fontSize: '0.6875rem', ml: 0.4 },
                      }}
                    />
                  )}
                </Stack>

                {/* Mini stats row */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  sx={{ mb: 1.5 }}
                >
                  {experienciaAnios && (
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                      <Typography variant="caption" sx={{ display: 'block', color: colors.textMuted, fontSize: '0.625rem', lineHeight: 1.2 }}>
                        Experiencia
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: colors.textPrimary, lineHeight: 1.3 }}>
                        {experienciaAnios} años
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>
          </motion.div>

          {/* ═══════ MAIN 2-COLUMN GRID ═══════ */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* ─── LEFT COLUMN ─── */}
              <Grid item xs={12} md={4.5} lg={3.8}>
                <Stack spacing={2}>
                  {/* ─── INFO CARD: Estado / Zona / Preferencia ─── */}
                  <motion.div variants={itemVariants}>
                    <MetricCard>
                      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="overline" sx={{
                          color: colors.textMuted, fontSize: '0.6rem',
                          letterSpacing: '0.1em', fontWeight: 600, mb: 1.25, display: 'block',
                        }}>
                          Información general
                        </Typography>
                        <Stack spacing={1}>
                          <InfoRow accent={statusInfo.color}>
                            <Box sx={{
                              p: 0.5, borderRadius: '8px',
                              background: alpha(statusInfo.color, 0.1), display: 'flex',
                              color: statusInfo.color, flexShrink: 0,
                            }}>
                              <StatusIcon size={13} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>
                                Estado
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary }}>
                                {statusInfo.label}
                              </Typography>
                            </Box>
                          </InfoRow>
                          {zona && (
                            <InfoRow accent={colors.secondary}>
                              <Box sx={{
                                p: 0.5, borderRadius: '8px',
                                background: alpha(colors.secondary, 0.1), display: 'flex',
                                color: colors.secondary, flexShrink: 0,
                              }}>
                                <MapPin size={13} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>
                                  Zona
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary }}>
                                  {zona}
                                </Typography>
                              </Box>
                            </InfoRow>
                          )}
                          {profile.preferenciaLaboral && (
                            <InfoRow accent="#D97706">
                              <Box sx={{
                                p: 0.5, borderRadius: '8px',
                                background: 'rgba(245,158,11,0.1)', display: 'flex',
                                color: '#D97706', flexShrink: 0,
                              }}>
                                <Briefcase size={13} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>
                                  Preferencia laboral
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary, wordBreak: 'break-word' }}>
                                  {profile.preferenciaLaboral}
                                </Typography>
                              </Box>
                            </InfoRow>
                          )}
                        </Stack>
                      </Box>
                    </MetricCard>
                  </motion.div>

                  {/* ─── CONTACT CARD ─── */}
                  {canViewContact && (
                    <motion.div variants={itemVariants}>
                      <MetricCard sx={{
                        borderColor: !viewerComplete ? alpha(colors.warning, 0.2) : alpha(colors.primary, 0.12),
                        background: !viewerComplete
                          ? `linear-gradient(135deg, ${colors.surface}, ${alpha(colors.warning, 0.02)})`
                          : `linear-gradient(135deg, ${colors.surface}, ${alpha(colors.primary, 0.02)})`,
                      }}>
                        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                          {!viewerComplete && userRol !== 'administrador' && !isOwner ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Box sx={{
                                width: 48, height: 48, borderRadius: '12px',
                                background: alpha(colors.warning, 0.1),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mx: 'auto', mb: 2,
                              }}>
                                <Sparkles size={22} color={colors.warning} />
                              </Box>
                              <Typography sx={{
                                fontWeight: 600, fontSize: '0.875rem',
                                color: colors.textPrimary, mb: 0.75,
                                fontFamily: '"Plus Jakarta Sans", sans-serif',
                              }}>
                                Completá tu cuenta
                              </Typography>
                              <Typography variant="body2" sx={{
                                color: colors.textSecondary, mb: 2,
                                lineHeight: 1.6, fontSize: '0.75rem',
                                maxWidth: 260, mx: 'auto',
                              }}>
                                Debes completar tu cuenta en Mi Cuenta para poder contactar con el Acompañante Terapéutico
                              </Typography>
                              <Button
                                variant="contained"
                                disableElevation
                                size="small"
                                onClick={() => navigate('/miCuenta')}
                                sx={{
                                  borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem',
                                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                                  px: 3,
                                }}
                              >
                                Ir a Mi Cuenta
                              </Button>
                            </Box>
                          ) : (
                            <>
                              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
                                <Box sx={{
                                  borderRadius: '8px',
                                  background: alpha(colors.primary, 0.06),
                                  color: colors.primary, display: 'flex',
                                  p: 0.5,
                                }}>
                                  <Sparkles size={12} />
                                </Box>
                                <Typography
                                  variant="overline"
                                  sx={{
                                    color: alpha(colors.primary, 0.6), fontSize: '0.6rem',
                                    letterSpacing: '0.1em', fontWeight: 600,
                                  }}
                                >
                                  Contacto directo
                                </Typography>
                              </Stack>
                              <Stack spacing={1}>
                                {profile.telefono && (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<MessageCircle size={15} />}
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    disableElevation
                                    sx={{
                                      py: 1, borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem',
                                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                      color: '#fff',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #20BD5C 0%, #0E7A6B 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 6px 20px rgba(37, 211, 102, 0.2)',
                                      },
                                    }}
                                  >
                                    WhatsApp
                                  </Button>
                                )}
                                <Stack direction="row" spacing={1}>
                                  {profile.email && (
                                    <Button
                                      fullWidth
                                      variant="outlined"
                                      startIcon={<Mail size={13} />}
                                      href={`mailto:${profile.email}`}
                                      sx={{
                                        py: 0.8, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem',
                                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                                        borderColor: alpha(colors.primary, 0.15), color: colors.primary,
                                        '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.04) },
                                      }}
                                    >
                                      Email
                                    </Button>
                                  )}
                                  {profile.telefono && (
                                    <Button
                                      fullWidth
                                      variant="outlined"
                                      startIcon={<Phone size={13} />}
                                      href={`tel:${profile.telefono}`}
                                      sx={{
                                        py: 0.8, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem',
                                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                                        borderColor: alpha(colors.success, 0.15), color: colors.success,
                                        '&:hover': { borderColor: colors.success, bgcolor: alpha(colors.success, 0.04) },
                                      }}
                                    >
                                      Llamar
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                              {profile.cvUrl && (
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={<Eye size={14} />}
                                  onClick={() => setPreviewFile({ url: profile.cvUrl, name: profile.cvName || 'CV.pdf', size: profile.cvSize || 0, contentType: profile.cvType || 'application/pdf' })}
                                  sx={{
                                    mt: 1.5, py: 0.8, borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem',
                                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                                    borderColor: alpha(colors.warning, 0.2), color: colors.warning,
                                    '&:hover': { borderColor: colors.warning, bgcolor: alpha(colors.warning, 0.04) },
                                  }}
                                >
                                  Ver CV
                                </Button>
                              )}
                              {isOwner && (
                                <Typography variant="caption" sx={{
                                  display: 'block', mt: 1, textAlign: 'center',
                                  color: colors.textMuted, fontSize: '0.625rem',
                                }}>
                                  Solo vos y los reclutadores pueden ver esta información
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </MetricCard>
                    </motion.div>
                  )}

                  {/* ─── COMPLETION ─── */}
                  <motion.div variants={itemVariants}>
                    <Box sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: '14px',
                      border: `1px solid ${colors.border}`,
                      background: alpha(colors.surfaceSecondary, 0.5),
                    }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="overline" sx={{
                          color: colors.textMuted, fontSize: '0.6rem',
                          letterSpacing: '0.1em', fontWeight: 600,
                        }}>
                          Perfil completado
                        </Typography>
                        <Typography variant="caption" sx={{
                          fontWeight: 700, fontSize: '0.75rem',
                          color: completionPercent >= 80 ? colors.success : completionPercent >= 50 ? '#D97706' : colors.textMuted,
                        }}>
                          {completionPercent}%
                        </Typography>
                      </Stack>
                      <Box sx={{
                        height: 4,
                        borderRadius: '3px',
                        bgcolor: alpha(colors.primary, 0.06),
                        overflow: 'hidden',
                      }}>
                        <Box sx={{
                          height: '100%',
                          borderRadius: '3px',
                          width: `${completionPercent}%`,
                          transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                          background: completionPercent >= 80
                            ? `linear-gradient(90deg, ${colors.success}, #34D399)`
                            : `linear-gradient(90deg, #F59E0B, #D97706)`,
                        }} />
                      </Box>
                    </Box>
                  </motion.div>

                  {/* ─── EDIT ─── */}
                  {canEditProfile && (
                    <motion.div variants={itemVariants}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Edit size={14} />}
                        onClick={() => navigate(`/editarPerfilLaboral/${profile.id || paramId}`)}
                        sx={{
                          py: 1, borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem',
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          borderColor: alpha(colors.primary, 0.15), color: colors.primary,
                          '&:hover': {
                            borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.04),
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(colors.primary, 0.06)}`,
                          },
                        }}
                      >
                        Editar perfil
                      </Button>
                    </motion.div>
                  )}
                </Stack>
              </Grid>

              {/* ─── RIGHT COLUMN ─── */}
              <Grid item xs={12} md={7.5} lg={8.2}>
                <motion.div variants={itemVariants}>
                  <MetricCard sx={{ overflow: 'visible' }}>
                    {/* ─── TABS ─── */}
                    <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 2, pb: 0.5 }}>
                      <PillTabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
                        variant={isMobile ? 'fullWidth' : 'standard'}
                      >
                        <PillTab label="Perfil clínico" icon={<Heart size={13} />} iconPosition="start" />
                        <PillTab label="Trayectoria" icon={<Briefcase size={13} />} iconPosition="start" />
                        <PillTab label="Formación" icon={<GraduationCap size={13} />} iconPosition="start" />
                      </PillTabs>
                    </Box>

                    <Divider sx={{ borderColor: alpha(colors.border, 0.6), mt: 0.5 }} />

                      <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                      {/* ════════ TAB 1: PERFIL CLÍNICO ════════ */}
                      <TabPanel value={tabValue} index={0}>
                        <Stack spacing={2.5}>
                          {/* ─── Sobre mí ─── */}
                          <motion.div variants={itemVariants}>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                <SectionIcon icon={<Quote size={12} />} color={colors.primary} />
                                <SectionTitle>Sobre mí</SectionTitle>
                              </Stack>
                              {profile.sobreMi ? (
                                <Paper elevation={0} sx={{
                                  p: { xs: 2.5, sm: 3 },
                                  borderRadius: '12px',
                                  background: alpha(colors.surfaceSecondary, 0.7),
                                  border: `1px solid ${alpha(colors.border, 0.7)}`,
                                  backdropFilter: 'blur(4px)',
                                  WebkitBackdropFilter: 'blur(4px)',
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0, top: 0, bottom: 0,
                                    width: 3,
                                    background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`,
                                    borderRadius: '0 2px 2px 0',
                                  },
                                }}>
                                  <Typography variant="body2" sx={{
                                    lineHeight: 1.85, color: colors.textPrimary,
                                    pl: 1.5, fontSize: '0.875rem',
                                  }}>
                                    {profile.sobreMi}
                                  </Typography>
                                </Paper>
                              ) : (
                                <Paper elevation={0} sx={{
                                  p: { xs: 2.5, sm: 3 }, borderRadius: '12px',
                                  background: alpha(colors.surfaceSecondary, 0.5),
                                  border: `1px dashed ${colors.border}`,
                                  textAlign: 'center',
                                }}>
                                  <Stack spacing={1.5} alignItems="center" sx={{ py: 1.5 }}>
                                    <Box sx={{
                                      p: 1.2, borderRadius: '12px',
                                      background: alpha(colors.primary, 0.04),
                                      color: alpha(colors.primary, 0.4), display: 'flex',
                                    }}>
                                      <Heart size={22} />
                                    </Box>
                                    <Box>
                                      <Typography variant="body2" sx={{
                                        color: colors.textSecondary, lineHeight: 1.7,
                                        maxWidth: 420, fontSize: '0.8125rem',
                                      }}>
                                        {EMPTY_MESSAGES.sobreMi}
                                      </Typography>
                                      {canEditProfile && (
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() => navigate(`/editarPerfilLaboral/${profile.id || paramId}`)}
                                          sx={{
                                            mt: 1, fontWeight: 600, fontSize: '0.75rem',
                                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                                            color: colors.primary,
                                          }}
                                        >
                                          Completar perfil
                                        </Button>
                                      )}
                                    </Box>
                                  </Stack>
                                </Paper>
                              )}
                            </Box>
                          </motion.div>

                          {/* ─── Preferencia Laboral ─── */}
                          {preferencias.length > 0 && (
                            <motion.div variants={itemVariants}>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                  <SectionIcon icon={<Users size={12} />} color={colors.secondary} />
                                  <SectionTitle>Áreas de trabajo</SectionTitle>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {preferencias.map((pref, i) => (
                                    <SkillChip key={i} label={pref} color={colors.secondary} />
                                  ))}
                                </Box>
                              </Box>
                            </motion.div>
                          )}

                          {/* ─── Habilidades ─── */}
                          {habilidadesList.length > 0 && (
                            <motion.div variants={itemVariants}>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                  <SectionIcon icon={<Shield size={12} />} color={colors.success} />
                                  <SectionTitle>Competencias</SectionTitle>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {habilidadesList.map((s, i) => (
                                    <SkillChip key={i} label={s} color={colors.success} />
                                  ))}
                                </Box>
                              </Box>
                            </motion.div>
                          )}

                          {/* ─── Empty state global ─── */}
                          {!profile.sobreMi && preferencias.length === 0 && habilidadesList.length === 0 && (
                            <motion.div variants={itemVariants}>
                              <Paper elevation={0} sx={{
                                p: 3.5, borderRadius: '14px', textAlign: 'center',
                                background: alpha(colors.surfaceSecondary, 0.5),
                                border: `1px dashed ${colors.border}`,
                              }}>
                                <Typography variant="body2" sx={{
                                  color: colors.textSecondary, lineHeight: 1.7,
                                  maxWidth: 440, mx: 'auto', fontSize: '0.8125rem',
                                }}>
                                  Este profesional aún no completó su perfil clínico. Las familias y reclutadores valoran conocer el enfoque terapéutico y las poblaciones con las que trabaja.
                                </Typography>
                              </Paper>
                            </motion.div>
                          )}
                        </Stack>
                      </TabPanel>

                      {/* ════════ TAB 2: TRAYECTORIA ════════ */}
                      <TabPanel value={tabValue} index={1}>
                        <Stack spacing={2.5}>
                          {/* ─── Experience ─── */}
                          {experiencia && (
                            <motion.div variants={itemVariants}>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                <SectionIcon icon={<Briefcase size={12} />} color={colors.secondary} />
                                <SectionTitle>Experiencia profesional</SectionTitle>
                              </Stack>
                                <Paper elevation={0} sx={{
                                  p: { xs: 2, sm: 2.5 }, borderRadius: '12px',
                                  background: alpha(colors.surfaceSecondary, 0.7),
                                  border: `1px solid ${alpha(colors.border, 0.7)}`,
                                  backdropFilter: 'blur(4px)',
                                  WebkitBackdropFilter: 'blur(4px)',
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0, top: 0, bottom: 0,
                                    width: 3,
                                    background: `linear-gradient(180deg, ${colors.secondary}, ${alpha(colors.secondary, 0.3)})`,
                                    borderRadius: '0 2px 2px 0',
                                  },
                                }}>
                                  <Typography variant="body2" sx={{
                                    lineHeight: 1.85, color: colors.textPrimary,
                                    pl: 1.5, fontSize: '0.875rem',
                                    whiteSpace: 'pre-wrap',
                                  }}>
                                    {experiencia}
                                  </Typography>
                                </Paper>
                              </Box>
                            </motion.div>
                          )}

                          {!experiencia && (
                            <motion.div variants={itemVariants}>
                              <Paper elevation={0} sx={{
                                p: { xs: 2.5, sm: 3 }, borderRadius: '12px',
                                background: alpha(colors.surfaceSecondary, 0.5),
                                border: `1px dashed ${colors.border}`,
                                textAlign: 'center',
                              }}>
                                <Stack spacing={1.5} alignItems="center" sx={{ py: 1.5 }}>
                                  <Box sx={{
                                    p: 1.2, borderRadius: '12px',
                                    background: alpha('#D97706', 0.05),
                                    color: alpha('#D97706', 0.5), display: 'flex',
                                  }}>
                                    <Briefcase size={22} />
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" sx={{
                                      color: colors.textSecondary, lineHeight: 1.7,
                                      maxWidth: 420, fontSize: '0.8125rem',
                                    }}>
                                      {EMPTY_MESSAGES.experiencia}
                                    </Typography>
                                    {canEditProfile && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => navigate(`/editarPerfilLaboral/${profile.id || paramId}`)}
                                        sx={{
                                          mt: 1, fontWeight: 600, fontSize: '0.75rem',
                                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                                          color: colors.primary,
                                        }}
                                      >
                                        Agregar experiencia
                                      </Button>
                                    )}
                                  </Box>
                                </Stack>
                              </Paper>
                            </motion.div>
                          )}

                          {/* ─── Institutions ─── */}
                          {profile.instituciones && (
                            <motion.div variants={itemVariants}>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                  <SectionIcon icon={<Building size={12} />} color={colors.textSecondary} />
                                  <SectionTitle>Instituciones</SectionTitle>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {(typeof profile.instituciones === 'string' ? profile.instituciones.split(',').map(s => s.trim()).filter(Boolean) : Array.isArray(profile.instituciones) ? profile.instituciones : []).map((inst, i) => (
                                    <SkillChip key={i} label={inst} color={colors.textSecondary} />
                                  ))}
                                </Box>
                              </Box>
                            </motion.div>
                          )}
                        </Stack>
                      </TabPanel>

                      {/* ════════ TAB 3: FORMACIÓN ════════ */}
                      <TabPanel value={tabValue} index={2}>
                        <Stack spacing={2.5}>
                          {/* ─── Formación ─── */}
                          {profile.formacion ? (
                            <motion.div variants={itemVariants}>
                              <Box>
                              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                <SectionIcon icon={<GraduationCap size={12} />} color={colors.primary} />
                                <SectionTitle>Formación académica</SectionTitle>
                              </Stack>
                                <Paper elevation={0} sx={{
                                  p: { xs: 2, sm: 2.5 }, borderRadius: '12px',
                                  background: alpha(colors.surfaceSecondary, 0.7),
                                  border: `1px solid ${alpha(colors.border, 0.7)}`,
                                  backdropFilter: 'blur(4px)',
                                  WebkitBackdropFilter: 'blur(4px)',
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0, top: 0, bottom: 0,
                                    width: 3,
                                    background: `linear-gradient(180deg, ${colors.primary}, ${alpha(colors.primary, 0.3)})`,
                                    borderRadius: '0 2px 2px 0',
                                  },
                                }}>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{
                                      p: 1.2, borderRadius: '12px',
                                      background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)}, ${alpha(colors.primary, 0.03)})`,
                                      color: colors.primary, display: 'flex', flexShrink: 0,
                                      border: `1px solid ${alpha(colors.primary, 0.06)}`,
                                    }}>
                                      <GraduationCap size={22} />
                                    </Box>
                                    <Box>
                                      <Typography variant="body1" sx={{
                                        fontWeight: 700, fontSize: '0.9375rem',
                                        color: colors.textPrimary,
                                      }}>
                                        {profile.formacion}
                                      </Typography>
                                      <Typography variant="body2" sx={{
                                        color: colors.textSecondary, fontSize: '0.8125rem',
                                        mt: 0.15,
                                      }}>
                                        Especialización
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Box>
                            </motion.div>
                          ) : (
                            <motion.div variants={itemVariants}>
                              <Paper elevation={0} sx={{
                                p: { xs: 2.5, sm: 3 }, borderRadius: '14px',
                                background: alpha(colors.surfaceSecondary, 0.5),
                                border: `1px dashed ${colors.border}`,
                                textAlign: 'center',
                              }}>
                                <Stack spacing={1.5} alignItems="center" sx={{ py: 1.5 }}>
                                  <Box sx={{
                                    p: 1.2, borderRadius: '12px',
                                    background: alpha(colors.primary, 0.04),
                                    color: alpha(colors.primary, 0.4), display: 'flex',
                                  }}>
                                    <GraduationCap size={22} />
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" sx={{
                                      color: colors.textSecondary, lineHeight: 1.7,
                                      maxWidth: 420, fontSize: '0.8125rem',
                                    }}>
                                      {EMPTY_MESSAGES.formacion}
                                    </Typography>
                                    {canEditProfile && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => navigate(`/editarPerfilLaboral/${profile.id || paramId}`)}
                                        sx={{
                                          mt: 1, fontWeight: 600, fontSize: '0.75rem',
                                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                                          color: colors.primary,
                                        }}
                                      >
                                        Agregar formación
                                      </Button>
                                    )}
                                  </Box>
                                </Stack>
                              </Paper>
                            </motion.div>
                          )}

                          {/* ─── Formación detalle ─── */}
                          {hasUniqueFormacionDetalle && (
                            <motion.div variants={itemVariants}>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                  <SectionIcon icon={<BookOpen size={12} />} color={colors.success} />
                                  <SectionTitle>Certificaciones</SectionTitle>
                                </Stack>
                                <Stack spacing={1.5}>
                                  {formacionDetalle.map((item, i) => (
                                    <Paper key={i} elevation={0} sx={{
                                      p: 2, borderRadius: '12px',
                                      border: `1px solid ${colors.border}`,
                                      display: 'flex', alignItems: 'center', gap: 2,
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        borderColor: alpha(colors.success, 0.2),
                                        background: alpha(colors.success, 0.04),
                                        transform: 'translateX(3px)',
                                      },
                                    }}>
                                      <Box sx={{
                                        p: 0.8, borderRadius: '8px',
                                        background: alpha(colors.success, 0.07),
                                        color: colors.success, display: 'flex', flexShrink: 0,
                                      }}>
                                        <GraduationCap size={17} />
                                      </Box>
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" sx={{
                                          fontWeight: 600, mb: 0.15, fontSize: '0.8125rem',
                                          color: colors.textPrimary,
                                        }}>
                                          {item.title || item}
                                        </Typography>
                                        {item.sub && (
                                          <Typography variant="caption" sx={{
                                            color: colors.textSecondary,
                                            fontSize: '0.6875rem',
                                          }}>
                                            {item.sub}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Paper>
                                  ))}
                                </Stack>
                              </Box>
                            </motion.div>
                          )}

                          {/* ─── Idiomas ─── */}
                          {profile.idiomas && (
                            <motion.div variants={itemVariants}>
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1 }}>
                                  <SectionIcon icon={<Globe size={12} />} color={colors.primary} />
                                  <SectionTitle>Idiomas</SectionTitle>
                                </Stack>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {(typeof profile.idiomas === 'string' ? profile.idiomas.split(',').map(s => s.trim()).filter(Boolean) : Array.isArray(profile.idiomas) ? profile.idiomas : []).map((idi, i) => (
                                    <SkillChip key={i} label={idi} color={colors.primary} />
                                  ))}
                                </Box>
                              </Box>
                            </motion.div>
                          )}
                        </Stack>
                      </TabPanel>
                    </Box>
                  </MetricCard>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Box>
      </motion.div>

      <FilePreviewModal
        open={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </Root>
  );
};

export default ShowPerfilAt;
