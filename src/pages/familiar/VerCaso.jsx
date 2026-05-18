import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import {
  Box, Grid, Typography, Avatar, Chip, Button,
  Card, IconButton, alpha, Skeleton, Divider, Stack, Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../theme/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, MapPin, Phone, Mail, FileText,
  Heart, Clock, Send, User,
  MessageCircle, AlertCircle, BadgeCheck, LogIn,
  Calendar, CheckCircle, Building2, TrendingUp, Eye, Sparkles
} from 'lucide-react';
import { generarSlugCompleto, generarShortId, getShortIdFromSlug } from '../../utils/slugUtils';
import { useBreadcrumb } from '../../components/layout/DashboardLayout';
import EnviarCV from '../../components/EnviarCV';
import FilePreviewModal from '../../components/feedback/FilePreviewModal';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  bgcolor: '#F8F9FC',
});

const CaseCard = styled(Card)({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
});

const SidebarCard = styled(Card)({
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
});

const StyledChip = styled(Chip)({
  borderRadius: '6px',
  height: 24,
  fontWeight: 600,
  fontSize: '0.6875rem',
  '& .MuiChip-label': { px: 0.75 },
});

const StatusBadge = styled(Chip)(({ theme, ...props }) => ({
  borderRadius: '6px',
  fontWeight: 700,
  height: 24,
  fontSize: '0.6875rem',
  backgroundColor: props.estado === 'Activa' ? alpha(colors.success, 0.12) :
                   props.estado === 'Cerrada' ? alpha('#EF4444', 0.12) :
                   alpha('#F59E0B', 0.12),
  color: props.estado === 'Activa' ? colors.success :
         props.estado === 'Cerrada' ? '#EF4444' :
         '#F59E0B',
  border: `1px solid ${
    props.estado === 'Activa' ? alpha(colors.success, 0.2) :
    props.estado === 'Cerrada' ? alpha('#EF4444', 0.2) :
    alpha('#F59E0B', 0.2)
  }`,
  '& .MuiChip-label': { px: 0.75 },
}));

const SkeletonCard = () => (
  <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
    <Box sx={{ mb: 2.5 }}>
      <Skeleton variant="rounded" width={32} height={32} animation="wave" sx={{ borderRadius: '10px' }} />
    </Box>
    <Grid container spacing={2.5}>
      <Grid item xs={12} lg={8}>
        <CaseCard elevation={0}>
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={56} height={56} animation="wave" />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="45%" height={28} animation="wave" />
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75 }}>
                <Skeleton variant="rounded" width={70} height={24} animation="wave" sx={{ borderRadius: '6px' }} />
                <Skeleton variant="rounded" width={90} height={24} animation="wave" sx={{ borderRadius: '6px' }} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
            <Grid container spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={6} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 1.25, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                    <Skeleton variant="rounded" width={32} height={32} animation="wave" sx={{ borderRadius: '8px' }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="35%" height={10} animation="wave" />
                      <Skeleton variant="text" width="60%" height={14} animation="wave" sx={{ mt: 0.25 }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
            <Skeleton variant="text" width="100%" height={12} animation="wave" />
            <Skeleton variant="text" width="100%" height={12} animation="wave" />
            <Skeleton variant="text" width="55%" height={12} animation="wave" />
          </Box>
        </CaseCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Skeleton variant="rounded" height={200} animation="wave" sx={{ borderRadius: '12px' }} />
      </Grid>
    </Grid>
  </Container>
);

function esFirebaseId(valor) {
  return /^[A-Za-z0-9]{20,}$/.test(valor);
}

const zonaColors = {
  'CABA': { color: '#6C4CF1', bg: alpha('#6C4CF1', 0.08), border: alpha('#6C4CF1', 0.15) },
  'Zona Norte': { color: '#10B981', bg: alpha('#10B981', 0.08), border: alpha('#10B981', 0.15) },
  'Zona Sur': { color: '#F59E0B', bg: alpha('#F59E0B', 0.08), border: alpha('#F59E0B', 0.15) },
  'Zona Oeste': { color: '#8B5CF6', bg: alpha('#8B5CF6', 0.08), border: alpha('#8B5CF6', 0.15) },
};

function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

const VerCaso = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setCaseTitle } = useBreadcrumb();
  const [publicacion, setPublicacion] = useState(null);
  const [mailEnviados, setMailEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [docId, setDocId] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchPublicacion = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) setUserId(currentUser.uid);

      let role = null;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            role = userDocSnap.data().userRol;
            setUserRole(role);
          }
        } catch {}
      }

      let docSnap = null;
      let fetchedId = null;

      if (esFirebaseId(slug)) {
        const docRef = doc(db, 'publicaciones', slug);
        docSnap = await getDoc(docRef);
        fetchedId = slug;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.slug && data.slug !== slug) {
            navigate(`/ver-caso/${data.slug}`, { replace: true });
            return;
          }
          if (!data.slug) {
            const newSlug = generarSlugCompleto(data.cliente || data.paciente, data.localidad, slug, data.diagnostico);
            await updateDoc(docRef, { slug: newSlug, shortId: generarShortId(slug) });
            navigate(`/ver-caso/${newSlug}`, { replace: true });
            return;
          }
        }
      } else {
        const publicacionesRef = collection(db, 'publicaciones');
        const q = query(publicacionesRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docResult = querySnapshot.docs[0];
          docSnap = docResult;
          fetchedId = docResult.id;
        }
      }

      if (!docSnap || !docSnap.exists || !docSnap.exists()) {
        const shortId = getShortIdFromSlug(slug);
        if (shortId) {
          const publicacionesRef = collection(db, 'publicaciones');
          const q = query(publicacionesRef, where('shortId', '==', shortId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docResult = snap.docs[0];
            const data = docResult.data();
            const fullSlug = generarSlugCompleto(data.cliente || data.paciente, data.localidad, docResult.id, data.diagnostico);
            if (!data.slug) {
              await updateDoc(doc(db, 'publicaciones', docResult.id), { slug: fullSlug, shortId });
            }
            if (fullSlug === slug) {
              fetchedId = docResult.id;
              docSnap = { exists: () => true, data: () => data };
            } else {
              navigate(`/ver-caso/${fullSlug}`, { replace: true });
              return;
            }
          }
        }
      }

      if (docSnap && docSnap.exists && docSnap.exists()) {
        const data = docSnap.data ? docSnap.data() : docSnap;
        setPublicacion(data);
        setDocId(fetchedId);
        setCaseTitle(data.cliente || data.paciente || 'Detalle del Caso');

        if (currentUser && fetchedId) {
          if (role === 'empleado') {
            const mailQuery = query(
              collection(db, 'mailEnviadosPostulado'),
              where('userIdPublicacion', '==', fetchedId),
              where('userIdUsers', '==', currentUser.uid)
            );
            const mailQuerySnapshot = await getDocs(mailQuery);
            const mails = [];
            mailQuerySnapshot.forEach(d => mails.push({ id: d.id, ...d.data() }));
            setMailEnviados(mails);
          }
          if (role === 'administrador' || (role === 'reclutador' && data.userId === currentUser.uid) || (role === 'familiar' && data.userId === currentUser.uid) || role === 'empleado') {
            const postQuery = query(
              collection(db, 'mailEnviadosPostulado'),
              where('userIdPublicacion', '==', fetchedId)
            );
            const postSnapshot = await getDocs(postQuery);
            const posts = [];
            postSnapshot.forEach(d => posts.push({ id: d.id, ...d.data() }));
            setPostulantes(posts);
          }
        }
      } else {
        setPublicacion(null);
      }
    } catch (error) {
      console.error("Error al obtener la publicación:", error);
      setPublicacion(null);
    }
    setLoading(false);
  }, [slug, navigate]);

  useEffect(() => {
    setCaseTitle('Cargando caso...');
    fetchPublicacion();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else { setUserId(null); setUserRole(null); }
    });
    return () => { unsubscribe(); setCaseTitle(null); };
  }, [fetchPublicacion, setCaseTitle]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleShowModal = () => {
    if (!userId || userRole !== 'empleado') return;
    setSelectedPublicacion(docId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPublicacion(null);
  };

  const handleCvEnviado = async () => {
    if (auth.currentUser && docId) {
      const mailQuery = query(
        collection(db, 'mailEnviadosPostulado'),
        where('userIdPublicacion', '==', docId),
        where('userIdUsers', '==', auth.currentUser.uid)
      );
      const mailQuerySnapshot = await getDocs(mailQuery);
      const mails = [];
      mailQuerySnapshot.forEach(d => mails.push({ id: d.id, ...d.data() }));
      setMailEnviados(mails);
    }
    setShowModal(false);
    setSelectedPublicacion(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const yaPostulado = mailEnviados.length > 0;
  const canPostularse = userId && userRole === 'empleado';
  const canSeeContacto = userId && (userRole === 'empleado' || userRole === 'reclutador' || userRole === 'administrador' || userRole === 'familiar');

  const [viewerComplete, setViewerComplete] = useState(true);

  useEffect(() => {
    const checkViewerProfile = async () => {
      if (!userId) return;
      if (userRole === 'reclutador' || userRole === 'familiar') {
        try {
          const snap = await getDoc(doc(db, 'usuarios', userId));
          if (snap.exists()) {
            const d = snap.data();
            const hasPhone = !!d.phoneNumber;
            const hasNombreEntidad = userRole === 'familiar' ? true : !!d.nombreEntidad;
            const hasEmailLaboral = userRole === 'reclutador' ? !!d.emailLaboral : true;
            setViewerComplete(hasPhone && hasNombreEntidad && hasEmailLaboral);
          }
        } catch (err) {
          console.error('Error checking viewer profile:', err);
        }
      }
    };
    checkViewerProfile();
  }, [userId, userRole]);

  const normalizeTelArg = (tel) => {
    const digits = tel?.replace(/\D/g, '') || '';
    if (digits.startsWith('549')) return digits;
    if (digits.startsWith('54')) return digits;
    return `549${digits}`;
  };

  const getWhatsAppMsg = () => {
    const lines = [
      '¡Hola! 👋',
      '',
      'Vi este caso disponible en *El Canal del AT* y estoy interesado en postularme.',
      '',
      '📋 *Datos del caso:*',
    ];
    if (publicacion.cliente || publicacion.paciente) lines.push(`   👤  ${publicacion.cliente || publicacion.paciente}`);
    if (publicacion.edad) lines.push(`   🎂  ${publicacion.edad} años`);
    if (publicacion.sexo) lines.push(`   ⚧  ${publicacion.sexo}`);
    if (publicacion.diagnostico) lines.push(`   📌  ${publicacion.diagnostico}`);
    if (publicacion.localidad) lines.push(`   📍  ${publicacion.localidad}`);
    if (publicacion.zona) lines.push(`   🗺  Zona: ${publicacion.zona}`);
    lines.push('');
    lines.push('Quedo atento a su respuesta. ¡Saludos!');
    return encodeURIComponent(lines.join('\n'));
  };

  if (loading) return <PageContainer><SkeletonCard /></PageContainer>;

  if (!publicacion) {
    return (
      <PageContainer>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 8 }}>
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Box sx={{ textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: '20px',
                  bgcolor: alpha('#EF4444', 0.08),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 3
                }}>
                  <AlertCircle size={32} color="#EF4444" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Caso no encontrado
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 300, mx: 'auto' }}>
                  Esta publicación no existe o fue eliminada. Revisá la URL o volvé al listado.
                </Typography>
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={<ArrowLeft size={16} />}
                  onClick={() => navigate('/buscar-trabajo')}
                  sx={{ borderRadius: '10px', bgcolor: '#6C4CF1', '&:hover': { bgcolor: '#5B3FE0' } }}
                >
                  Buscar casos
                </Button>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Container>
      </PageContainer>
    );
  }

  const cliente = publicacion.cliente || publicacion.paciente || 'Sin nombre';
  const zoneStyle = zonaColors[publicacion.zona] || { color: '#6C4CF1', bg: alpha('#6C4CF1', 0.08), border: alpha('#6C4CF1', 0.15) };
  const timeAgo = getTimeAgo(publicacion.fechaCreacion);

  const ogTitle = `${cliente} - El Canal del AT`;
  const ogDescription = publicacion.descripcion
    ? publicacion.descripcion.substring(0, 200)
    : `Buscamos Acompañante Terapéutico para caso en ${publicacion.localidad || 'su zona'}.`;
  const ogImage = publicacion.photo?.startsWith('http') ? publicacion.photo : null;

  const infoBlocks = [
    { icon: <User size={14} />, color: '#6C4CF1', label: 'Edad', value: publicacion.edad || '—' },
    { icon: <Heart size={14} />, color: '#EC4899', label: 'Sexo', value: publicacion.sexo || '—' },
    { icon: <MapPin size={14} />, color: '#10B981', label: 'Localidad', value: publicacion.localidad || '—' },
    { icon: <FileText size={14} />, color: '#F59E0B', label: 'Diagnóstico', value: publicacion.diagnostico || '—' },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slug}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <Helmet>
          <title>{ogTitle}</title>
          <meta property="og:title" content={ogTitle} />
          <meta property="og:description" content={ogDescription} />
          <meta property="og:type" content="article" />
          {ogImage && <meta property="og:image" content={ogImage} />}
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogTitle} />
          <meta name="twitter:description" content={ogDescription} />
        </Helmet>

        <PageContainer>
          <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{
              position: 'sticky', top: 0, zIndex: 10,
              bgcolor: '#F8F9FC', py: 1.5, mb: 1.5,
              display: 'flex', alignItems: 'center', gap: 1.5,
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <IconButton
                onClick={handleBack}
                size="small"
                sx={{
                  bgcolor: colors.surface,
                  width: 34, height: 34, borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  '&:hover': { bgcolor: alpha('#6C4CF1', 0.06), borderColor: '#6C4CF1' },
                }}
              >
                <ArrowLeft size={16} />
              </IconButton>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: colors.textPrimary }}>
                Detalle del caso
              </Typography>
              <Box sx={{ flex: 1 }} />
              {canPostularse && (
                <Button
                  variant={yaPostulado ? "outlined" : "contained"}
                  disableElevation
                  size="small"
                  startIcon={yaPostulado ? <CheckCircle size={14} /> : <Send size={14} />}
                  onClick={yaPostulado ? undefined : handleShowModal}
                  disabled={yaPostulado}
                  sx={{
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.8125rem',
                    minHeight: 34, px: 2,
                    display: { xs: 'none', md: 'inline-flex' },
                    ...(yaPostulado ? {
                      bgcolor: alpha(colors.success, 0.08),
                      color: colors.success,
                      borderColor: alpha(colors.success, 0.3),
                      '&:hover': { bgcolor: alpha(colors.success, 0.12) },
                    } : {
                      bgcolor: '#6C4CF1',
                      color: '#fff',
                      '&:hover': { bgcolor: '#5B3FE0', transform: 'translateY(-1px)', boxShadow: `0 4px 12px ${alpha('#6C4CF1', 0.3)}` },
                    })
                  }}
                >
                  {yaPostulado ? 'Postulado' : 'Postularme'}
                </Button>
              )}
            </Box>

            <Grid container spacing={2.5}>
              {/* Main content area */}
              <Grid item xs={12} lg={8}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                  {/* Hero section */}
                  <CaseCard elevation={0}>
                    <Box sx={{
                      p: { xs: 2, sm: 3 },
                      display: 'flex', gap: 2.5, alignItems: 'flex-start',
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                      <Avatar
                        src={publicacion.photo}
                        sx={{
                          width: 56, height: 56,
                          border: `2.5px solid ${alpha(zoneStyle.color, 0.3)}`,
                          fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
                          boxShadow: `0 4px 12px ${alpha(zoneStyle.color, 0.12)}`,
                        }}
                      >
                        {cliente[0]}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{
                          fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' },
                          lineHeight: 1.3, mb: 0.75, color: colors.textPrimary,
                        }}>
                          {cliente}
                        </Typography>
                        {publicacion.codigo && (
                          <Chip
                            label={`Código: ${publicacion.codigo}`}
                            size="small"
                            sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, borderRadius: '6px', bgcolor: alpha('#6C4CF1', 0.08), color: '#6C4CF1', mb: 1 }}
                          />
                        )}
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <StatusBadge estado={publicacion.estado || 'Activa'} label={publicacion.estado || 'Activa'} />
                          {publicacion.zona && (
                            <StyledChip
                              label={publicacion.zona}
                              sx={{ bgcolor: zoneStyle.bg, color: zoneStyle.color, border: `1px solid ${zoneStyle.border}` }}
                            />
                          )}
                          {publicacion.diagnostico && (
                            <StyledChip
                              label={publicacion.diagnostico}
                              sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#B45309', border: `1px solid ${alpha('#F59E0B', 0.2)}` }}
                            />
                          )}
                          {publicacion.verificado && (
                            <StyledChip
                              icon={<BadgeCheck size={11} />}
                              label="Verificado"
                              sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success, border: `1px solid ${alpha(colors.success, 0.2)}` }}
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                        <Typography sx={{ color: colors.textMuted, fontSize: '0.75rem', fontWeight: 450 }}>
                          {timeAgo}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Info grid */}
                    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
                      <Grid container spacing={1.5}>
                        {infoBlocks.map((block, i) => (
                          <Grid item xs={6} key={i}>
                            <Box sx={{
                              display: 'flex', alignItems: 'center', gap: 1.5,
                              py: 1.25, px: 1.5,
                              borderRadius: '10px',
                              border: `1px solid ${colors.border}`,
                              bgcolor: '#FAFBFF',
                              transition: 'all 0.2s ease',
                              '&:hover': { borderColor: alpha(block.color, 0.3), bgcolor: alpha(block.color, 0.03) },
                            }}>
                              <Box sx={{
                                width: 32, height: 32, borderRadius: '8px',
                                bgcolor: alpha(block.color, 0.08),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, color: block.color,
                              }}>
                                {block.icon}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1, mb: 0.25 }}>
                                  {block.label}
                                </Typography>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3, color: colors.textPrimary, wordBreak: 'break-word' }}>
                                  {block.value}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Tags */}
                    {publicacion.etiquetas?.length > 0 && (
                      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 1 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {publicacion.etiquetas.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              size="small"
                              sx={{
                                fontSize: '0.6875rem', fontWeight: 500, height: 22, borderRadius: '4px',
                                bgcolor: alpha('#6C4CF1', 0.04), color: colors.textMuted,
                                border: `1px solid ${alpha(colors.border, 0.5)}`,
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Description */}
                    {publicacion.descripcion && (
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography sx={{
                          color: colors.textMuted, fontWeight: 600, letterSpacing: '0.05em',
                          textTransform: 'uppercase', fontSize: '0.625rem', mb: 1.5, display: 'block',
                        }}>
                          Descripción del caso
                        </Typography>
                        <Typography sx={{
                          color: colors.textSecondary, lineHeight: 1.8,
                          fontSize: '0.875rem', whiteSpace: 'pre-line',
                        }}>
                          {publicacion.descripcion}
                        </Typography>
                      </Box>
                    )}
                  </CaseCard>

                  {/* Activity / sent CVs section */}
                  {canPostularse && mailEnviados.length > 0 && (
                    <CaseCard elevation={0} sx={{ mt: 2.5 }}>
                      <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${colors.border}` }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Send size={15} color="#6C4CF1" />
                          Actividad ({mailEnviados.length} postulación{mailEnviados.length !== 1 ? 'es' : ''})
                        </Typography>
                      </Box>
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stack spacing={2}>
                          {mailEnviados.map((mail) => (
                            <Box key={mail.id} sx={{
                              p: 2, borderRadius: '10px',
                              border: `1px solid ${colors.border}`,
                              bgcolor: '#FAFBFF',
                              transition: 'all 0.2s ease',
                              '&:hover': { borderColor: alpha('#6C4CF1', 0.2) },
                            }}>
                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Avatar sx={{ width: 36, height: 36, fontSize: '0.8125rem', fontWeight: 600, bgcolor: alpha('#6C4CF1', 0.1), color: '#6C4CF1' }}>
                                  {mail.nombre?.[0]}{mail.apellido?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                      {mail.nombre} {mail.apellido}
                                    </Typography>
                                    <Chip
                                      label={mail.estado || 'Enviado'}
                                      size="small"
                                      sx={{
                                        height: 20, fontSize: '0.625rem', fontWeight: 600, borderRadius: '4px',
                                        bgcolor: mail.estado === 'Aceptado' ? alpha(colors.success, 0.1) :
                                                 mail.estado === 'Rechazado' ? alpha('#EF4444', 0.1) : alpha('#F59E0B', 0.1),
                                        color: mail.estado === 'Aceptado' ? colors.success :
                                               mail.estado === 'Rechazado' ? '#EF4444' : '#F59E0B',
                                        border: `1px solid ${
                                          mail.estado === 'Aceptado' ? alpha(colors.success, 0.2) :
                                          mail.estado === 'Rechazado' ? alpha('#EF4444', 0.2) : alpha('#F59E0B', 0.2)
                                        }`,
                                        '& .MuiChip-label': { px: 0.5 },
                                      }}
                                    />
                                  </Stack>
                                  <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem', mb: 1, lineHeight: 1.5 }}>
                                    {mail.descripcion}
                                  </Typography>
                                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <Clock size={11} color={colors.textMuted} />
                                      <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
                                        {formatDate(mail.fechaEnvio)}
                                      </Typography>
                                    </Stack>
                                    {mail.cvUrl && (
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <FileText size={10} color={colors.textMuted} />
                                        <Typography
                                          onClick={() => setPreviewFile({ url: mail.cvUrl, name: mail.cvName || `CV_${mail.nombre}_${mail.apellido}.pdf`, size: mail.cvSize || 0, contentType: mail.cvType || 'application/pdf' })}
                                          sx={{ color: '#6C4CF1', fontSize: '0.6875rem', fontWeight: 500, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        >
                                          Ver CV
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </CaseCard>
                  )}

                  {/* Postulantes - for owner reclutador/familiar, admin, or empleado who sent CV */}
                  {(userRole === 'administrador' || (userRole === 'reclutador' && publicacion?.userId === userId) || (userRole === 'familiar' && publicacion?.userId === userId) || (userRole === 'empleado' && mailEnviados.length > 0)) && postulantes.length > 0 && (
                    <CaseCard elevation={0} sx={{ mt: 2.5 }}>
                      <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${colors.border}` }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <User size={15} color="#6C4CF1" />
                          Postulantes ({postulantes.length})
                        </Typography>
                      </Box>
                      <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stack spacing={1.5}>
                          {postulantes.map((mail) => (
                            <Box key={mail.id} sx={{
                              p: 2, borderRadius: '10px',
                              border: `1px solid ${colors.border}`,
                              bgcolor: '#FAFBFF',
                              transition: 'all 0.2s ease',
                              '&:hover': { borderColor: alpha('#6C4CF1', 0.2) },
                            }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 40, height: 40, fontSize: '0.875rem', fontWeight: 600, bgcolor: alpha('#6C4CF1', 0.1), color: '#6C4CF1' }}>
                                  {mail.nombre?.[0]}{mail.apellido?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                      {mail.nombre} {mail.apellido}
                                    </Typography>
                                    <Chip
                                      label={mail.estado || 'Enviado'}
                                      size="small"
                                      sx={{
                                        height: 20, fontSize: '0.625rem', fontWeight: 600, borderRadius: '4px',
                                        bgcolor: mail.estado === 'Aceptado' ? alpha(colors.success, 0.1) :
                                                 mail.estado === 'Rechazado' ? alpha('#EF4444', 0.1) : alpha('#F59E0B', 0.1),
                                        color: mail.estado === 'Aceptado' ? colors.success :
                                               mail.estado === 'Rechazado' ? '#EF4444' : '#F59E0B',
                                        border: `1px solid ${
                                          mail.estado === 'Aceptado' ? alpha(colors.success, 0.2) :
                                          mail.estado === 'Rechazado' ? alpha('#EF4444', 0.2) : alpha('#F59E0B', 0.2)
                                        }`,
                                        '& .MuiChip-label': { px: 0.5 },
                                      }}
                                    />
                                  </Stack>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <Clock size={10} color={colors.textMuted} />
                                      <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
                                        {formatDate(mail.fechaEnvio)}
                                      </Typography>
                                    </Stack>
                                    {mail.cvUrl && (
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <FileText size={10} color={colors.textMuted} />
                                        <Typography
                                          onClick={() => setPreviewFile({ url: mail.cvUrl, name: mail.cvName || `CV_${mail.nombre}_${mail.apellido}.pdf`, size: mail.cvSize || 0, contentType: mail.cvType || 'application/pdf' })}
                                          sx={{ color: '#6C4CF1', fontSize: '0.6875rem', fontWeight: 500, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        >
                                          Ver CV
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                </Box>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Eye size={13} />}
                                  onClick={() => navigate(`/perfil/${mail.userIdUsers}`)}
                                  sx={{
                                    borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem',
                                    minHeight: 32, px: 1.5, flexShrink: 0,
                                    borderColor: alpha('#6C4CF1', 0.2), color: '#6C4CF1',
                                    '&:hover': { bgcolor: alpha('#6C4CF1', 0.06), borderColor: '#6C4CF1' },
                                  }}
                                >
                                  Ver perfil
                                </Button>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </CaseCard>
                  )}
                </motion.div>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} lg={4}>
                <Box sx={{ position: { lg: 'sticky' }, top: { lg: 80 } }}>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    {/* CTA sidebar card */}
                    {canPostularse ? (
                      <SidebarCard elevation={0}>
                        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: '12px',
                            bgcolor: yaPostulado ? alpha(colors.success, 0.08) : alpha('#10B981', 0.08),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mb: 1.5,
                          }}>
                            {yaPostulado ? <CheckCircle size={22} color={colors.success} /> : <TrendingUp size={22} color="#10B981" />}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            {yaPostulado ? 'Ya te postulaste' : 'Postulate a este caso'}
                          </Typography>
                          <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem', mb: 2, lineHeight: 1.5 }}>
                            {yaPostulado ? 'Tu CV ya fue enviado. El reclutador lo revisará y te contactará si quedás preseleccionado.' : 'Enviá tu CV y el reclutador se pondrá en contacto si quedás preseleccionado.'}
                          </Typography>
                          <Button
                            variant={yaPostulado ? "outlined" : "contained"}
                            disableElevation
                            fullWidth
                            size="large"
                            startIcon={yaPostulado ? <CheckCircle size={16} /> : <Send size={16} />}
                            onClick={yaPostulado ? undefined : handleShowModal}
                            disabled={yaPostulado}
                            sx={{
                              borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem',
                              py: 1.25,
                              ...(yaPostulado ? {
                                bgcolor: alpha(colors.success, 0.08),
                                color: colors.success,
                                borderColor: alpha(colors.success, 0.3),
                                '&:hover': { bgcolor: alpha(colors.success, 0.12) },
                              } : {
                                bgcolor: '#6C4CF1',
                                '&:hover': {
                                  bgcolor: '#5B3FE0',
                                  transform: 'translateY(-1px)',
                                  boxShadow: `0 6px 16px ${alpha('#6C4CF1', 0.3)}`,
                                },
                              })
                            }}
                          >
                            {yaPostulado ? 'Postulado' : 'Enviar CV'}
                          </Button>
                          {publicacion.email && (
                            <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', textAlign: 'center', mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Mail size={11} />
                              {publicacion.email}
                            </Typography>
                          )}
                        </Box>
                      </SidebarCard>
                    ) : userId && (userRole === 'reclutador' || userRole === 'administrador') ? (
                      <SidebarCard elevation={0}>
                        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: '12px',
                            bgcolor: alpha('#6C4CF1', 0.08),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mb: 1.5,
                          }}>
                            <User size={22} color="#6C4CF1" />
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            {postulantes.length} postulante{postulantes.length !== 1 ? 's' : ''}
                          </Typography>
                          <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem', mb: 2, lineHeight: 1.5 }}>
                            {postulantes.length > 0
                              ? 'Revisá los perfiles de los ATs que se postularon a este caso.'
                              : 'Todavía no hay postulaciones para este caso.'}
                          </Typography>
                          {publicacion.email && (
                            <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Mail size={11} />
                              {publicacion.email}
                            </Typography>
                          )}
                        </Box>
                      </SidebarCard>
                    ) : (
                      <SidebarCard elevation={0}>
                        <Box sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                          <Box sx={{
                            width: 48, height: 48, borderRadius: '12px',
                            bgcolor: alpha('#6C4CF1', 0.08),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 1.5,
                          }}>
                            <LogIn size={22} color="#6C4CF1" />
                          </Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', mb: 0.5 }}>
                            Iniciá sesión
                          </Typography>
                          <Typography sx={{ color: colors.textSecondary, fontSize: '0.8125rem', mb: 2, lineHeight: 1.5 }}>
                            Necesitás iniciar sesión como AT para enviar tu CV.
                          </Typography>
                          <Button
                            variant="contained"
                            disableElevation
                            fullWidth
                            component={Link}
                            to={'/login'}
                            state={{ from: { pathname: `/ver-caso/${slug}` } }}
                            startIcon={<LogIn size={16} />}
                            sx={{
                              borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem',
                              py: 1, bgcolor: '#6C4CF1',
                              '&:hover': { bgcolor: '#5B3FE0' },
                            }}
                          >
                            Iniciar sesión
                          </Button>
                          <Typography sx={{ color: colors.textMuted, fontSize: '0.75rem', mt: 1.5 }}>
                            ¿No tenés cuenta?{' '}
                            <Link to="/crearCuenta" style={{ color: '#6C4CF1', fontWeight: 600, textDecoration: 'none' }}>
                              Registrate
                            </Link>
                          </Typography>
                        </Box>
                      </SidebarCard>
                    )}

                    {/* Contact info */}
                    {canSeeContacto && (publicacion.email || publicacion.telefono) && (
                      <SidebarCard elevation={0} sx={{ mt: 2 }}>
                        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: `1px solid ${colors.border}` }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MessageCircle size={15} color="#6C4CF1" />
                            Contacto
                          </Typography>
                        </Box>
                        {!viewerComplete && (userRole === 'reclutador' || userRole === 'familiar') ? (
                          <Box sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                            <Box sx={{
                              width: 40, height: 40, borderRadius: '10px',
                              background: alpha(colors.warning, 0.1),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              mx: 'auto', mb: 1.5,
                            }}>
                              <Sparkles size={18} color={colors.warning} />
                            </Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary, mb: 0.5 }}>
                              Completá tu cuenta
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.75rem', mb: 1.5, lineHeight: 1.6 }}>
                              Debes completar tu cuenta en Mi Cuenta para poder contactar con el Acompañante Terapéutico
                            </Typography>
                            <Button
                              variant="contained"
                              disableElevation
                              size="small"
                              onClick={() => navigate('/miCuenta')}
                              sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.75rem', px: 3 }}
                            >
                              Ir a Mi Cuenta
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                            <Stack spacing={1.5}>
                              {publicacion.email && (
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  startIcon={<Mail size={14} />}
                                  href={`mailto:${publicacion.email}`}
                                  sx={{
                                    borderRadius: '8px', borderColor: colors.border, color: colors.textSecondary,
                                    fontWeight: 600, fontSize: '0.8125rem', minHeight: 38,
                                    justifyContent: 'flex-start',
                                    '&:hover': { borderColor: '#6C4CF1', color: '#6C4CF1', bgcolor: alpha('#6C4CF1', 0.04) },
                                  }}
                                >
                                  Enviar mail
                                </Button>
                              )}
                              {publicacion.telefono && (
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  startIcon={<Phone size={14} />}
                                  href={`tel:${publicacion.telefono}`}
                                  sx={{
                                    borderRadius: '8px', borderColor: colors.border, color: colors.textSecondary,
                                    fontWeight: 600, fontSize: '0.8125rem', minHeight: 38,
                                    justifyContent: 'flex-start',
                                    '&:hover': { borderColor: '#10B981', color: '#10B981', bgcolor: alpha('#10B981', 0.04) },
                                  }}
                                >
                                  Llamar
                                </Button>
                              )}
                              {publicacion.telefono && (
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  startIcon={<MessageCircle size={14} />}
                                  href={`https://wa.me/${normalizeTelArg(publicacion.telefono)}?text=${getWhatsAppMsg()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    borderRadius: '8px', borderColor: alpha('#25D366', 0.3), color: '#25D366',
                                    fontWeight: 600, fontSize: '0.8125rem', minHeight: 38,
                                    justifyContent: 'flex-start',
                                    '&:hover': { bgcolor: alpha('#25D366', 0.04), borderColor: '#25D366' },
                                  }}
                                >
                                  Enviar WhatsApp
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </SidebarCard>
                    )}

                    {/* Case info meta */}
                    <SidebarCard elevation={0} sx={{ mt: 2 }}>
                      <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: `1px solid ${colors.border}` }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={15} color={colors.textSecondary} />
                          Información del caso
                        </Typography>
                      </Box>
                      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                              Estado
                            </Typography>
                            <StatusBadge estado={publicacion.estado || 'Activa'} label={publicacion.estado || 'Activa'} />
                          </Box>
                          {publicacion.zona && (
                            <Box>
                              <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                                Zona
                              </Typography>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: zoneStyle.color }}>
                                {publicacion.zona}
                              </Typography>
                            </Box>
                          )}
                          {timeAgo && (
                            <Box>
                              <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                                Publicado
                              </Typography>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <Clock size={12} color={colors.textMuted} />
                                <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem', color: colors.textSecondary }}>
                                  {timeAgo}
                                </Typography>
                              </Stack>
                            </Box>
                          )}
                          {publicacion.horario && (
                            <Box>
                              <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                                Horario
                              </Typography>
                              <Typography sx={{ fontWeight: 500, fontSize: '0.8125rem', color: colors.textSecondary }}>
                                {publicacion.horario}
                              </Typography>
                            </Box>
                          )}
                          {publicacion.remuneracion && (
                            <Box>
                              <Typography sx={{ color: colors.textMuted, fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', mb: 0.25 }}>
                                Remuneración
                              </Typography>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10B981' }}>
                                {publicacion.remuneracion}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </SidebarCard>


                  </motion.div>
                </Box>
              </Grid>
            </Grid>
          </Container>

          {/* Mobile sticky CTA */}
          {canPostularse && (
            <Box sx={{
              display: { xs: 'block', md: 'none' },
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 100,
              bgcolor: colors.surface,
              borderTop: `1px solid ${colors.border}`,
              p: 1.5,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
            }}>
              <Button
                variant={yaPostulado ? "outlined" : "contained"}
                disableElevation
                fullWidth
                size="large"
                startIcon={yaPostulado ? <CheckCircle size={16} /> : <Send size={16} />}
                onClick={yaPostulado ? undefined : handleShowModal}
                disabled={yaPostulado}
                sx={{
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem',
                  py: 1.25,
                  ...(yaPostulado ? {
                    bgcolor: alpha(colors.success, 0.08),
                    color: colors.success,
                    borderColor: alpha(colors.success, 0.3),
                    '&:hover': { bgcolor: alpha(colors.success, 0.12) },
                  } : {
                    bgcolor: '#6C4CF1',
                    '&:hover': { bgcolor: '#5B3FE0' },
                  })
                }}
              >
                {yaPostulado ? 'Postulado' : 'Enviar CV'}
              </Button>
            </Box>
          )}

          {canPostularse && <Box sx={{ display: { xs: 'block', md: 'none' }, height: 72 }} />}

          <EnviarCV
            show={showModal}
            handleClose={handleCloseModal}
            publicacionId={selectedPublicacion}
            correoPublicacion={publicacion?.email}
            onSuccess={handleCvEnviado}
          />

          <FilePreviewModal
            open={Boolean(previewFile)}
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        </PageContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerCaso;
