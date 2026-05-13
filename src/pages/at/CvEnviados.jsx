import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  Card, CardContent, IconButton, Skeleton, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Divider, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Send, Eye, Trash2, Calendar, Clock, MapPin,
  Briefcase, CheckCircle, XCircle, AlertCircle,
  FileText, Mail, ChevronRight, Sparkles, Star,
  Building2, ExternalLink
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const TimelineContainer = styled(Box)({
  position: 'relative',
  paddingLeft: 24,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 2,
    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    borderRadius: 1,
  },
});

const TimelineItem = styled(Box, { shouldForwardProp: (prop) => prop !== 'estado' })(({ estado }) => ({
  position: 'relative',
  paddingLeft: 24,
  paddingBottom: 24,
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -16,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: estado === 'Aceptado' ? colors.success : 
                      estado === 'Rechazado' ? colors.danger : 
                      colors.warning,
    border: `3px solid ${colors.surface}`,
    boxShadow: `0 0 0 2px ${estado === 'Aceptado' ? colors.success : 
                               estado === 'Rechazado' ? colors.danger : 
                               colors.warning}`,
  },
}));

const CvCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'estado' })(({ estado }) => ({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: colors.surface,
  position: 'relative',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px -8px ${alpha(colors.primary, 0.12)}`,
  },
}));

const StatusBadge = styled(Chip, { shouldForwardProp: (prop) => prop !== 'estado' })(({ estado }) => ({
  borderRadius: '10px',
  fontWeight: 600,
  backgroundColor: estado === 'Aceptado' ? alpha(colors.success, 0.1) : 
                    estado === 'Rechazado' ? alpha(colors.danger, 0.1) : 
                    alpha(colors.warning, 0.1),
  color: estado === 'Aceptado' ? colors.success : 
         estado === 'Rechazado' ? colors.danger : 
         colors.warning,
  border: `1px solid ${estado === 'Aceptado' ? colors.success : 
                          estado === 'Rechazado' ? colors.danger : 
                          colors.warning}`,
}));

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 4,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '24px',
        backgroundColor: alpha(colors.primary, 0.08),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <Icon size={36} color={colors.primary} />
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 400 }}>
      {description}
    </Typography>
    {action}
  </Box>
);

const CvEnviados = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards');
  const [selectedCv, setSelectedCv] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          
          const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');
          const querySnapshot = await getDocs(mailEnviadosCollection);
          const cvsData = querySnapshot.docs
            .filter((docSnap) => docSnap.data().userIdUsers === userId)
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

          const publicacionesCollection = collection(db, 'publicaciones');
          const publicacionesSnapshot = await getDocs(publicacionesCollection);
          const publicacionesData = {};
          publicacionesSnapshot.docs.forEach(docSnap => {
            publicacionesData[docSnap.id] = docSnap.data();
          });

          const cvsWithImages = cvsData.map(cv => ({
            ...cv,
            publicacionData: publicacionesData[cv.userIdPublicacion] || {},
          }));

          setCvs(cvsWithImages.sort((a, b) => {
            const dateA = a.fechaEnvio?.toDate?.() || new Date(0);
            const dateB = b.fechaEnvio?.toDate?.() || new Date(0);
            return dateB - dateA;
          }));
        }
      } catch (error) {
        console.error('Error fetching CVs:', error);
      }
      setLoading(false);
    };

    fetchCvs();
  }, []);

  const handleEliminarConfirmation = (id) => {
    MySwal.fire({
      title: '¿Retirar postulación?',
      text: 'Esta acción eliminará tu CV enviado de esta publicación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      cancelButtonColor: colors.primary,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: colors.surface,
      customClass: {
        popup: 'rounded-20px',
        confirmButton: 'rounded-10px',
        cancelButton: 'rounded-10px',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleEliminar(id);
      }
    });
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'mailEnviadosPostulado', id));
      setCvs(cvs.filter(cv => cv.id !== id));
      MySwal.fire({
        title: '¡Eliminado!',
        text: 'Tu CV ha sido retirado de esta publicación.',
        icon: 'success',
        confirmButtonColor: colors.success,
        background: colors.surface,
      });
    } catch (error) {
      console.error('Error deleting CV:', error);
      MySwal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el CV.',
        icon: 'error',
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <LoadingPage />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ pb: 4 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Mis CVs Enviados
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Gestiona tus postulaciones y seguimiento de casos
          </Typography>
        </Box>
        <Chip
          label={`${cvs.length} envío${cvs.length !== 1 ? 's' : ''}`}
          sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant={viewMode === 'cards' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<Sparkles size={14} />}
          onClick={() => setViewMode('cards')}
        >
          Cards
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
          size="small"
          startIcon={<Clock size={14} />}
          onClick={() => setViewMode('timeline')}
        >
          Timeline
        </Button>
      </Box>

      {cvs.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Sin CVs enviados"
          description="Aún no has enviado tu CV a ninguna publicación. Explora las ofertas disponibles y postula."
          action={
            <Button
              variant="contained"
              startIcon={<Briefcase size={16} />}
              onClick={() => navigate('/buscar-trabajo')}
            >
              Buscar Trabajo
            </Button>
          }
        />
      ) : viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {cvs.map((cv, index) => (
            <Grid item xs={12} md={6} lg={4} key={cv.id}>
              <CvCard
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                elevation={0}
              >
                <Box sx={{
                  p: 3,
                  borderBottom: `1px solid ${colors.border}`,
                  bgcolor: alpha(colors.primary, 0.02),
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        src={cv.publicacionData?.photo}
                        sx={{
                          width: 56,
                          height: 56,
                          border: `3px solid ${alpha(colors.primary, 0.2)}`,
                        }}
                      >
                        {cv.NombreCliente?.[0] || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {cv.NombreCliente}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {cv.numeroPaciente}
                        </Typography>
                      </Box>
                    </Box>
                    <StatusBadge estado={cv.estado} label={cv.estado} size="small" />
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Calendar size={16} color={colors.textMuted} />
                      <Typography variant="body2">
                        Enviado el {formatDate(cv.fechaEnvio)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Clock size={16} color={colors.textMuted} />
                      <Typography variant="body2">
                        a las {formatTime(cv.fechaEnvio)}
                      </Typography>
                    </Box>
                  </Box>

                  {cv.descripcion && (
                    <Box sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: alpha(colors.primary, 0.03),
                      border: `1px solid ${colors.border}`,
                    }}>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        Tu mensaje:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {cv.descripcion}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Eye size={14} />}
                    onClick={() => setSelectedCv(cv)}
                    sx={{ flex: 1 }}
                  >
                    Ver caso
                  </Button>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => handleEliminarConfirmation(cv.id)}
                      sx={{ color: colors.danger }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CvCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TimelineContainer>
          {cvs.map((cv, index) => (
            <TimelineItem
              component={motion.div}
              key={cv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              estado={cv.estado}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.surface,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={cv.publicacionData?.photo}
                      sx={{ width: 48, height: 48 }}
                    >
                      {cv.NombreCliente?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {cv.NombreCliente}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        {cv.numeroPaciente}
                      </Typography>
                    </Box>
                  </Box>
                  <StatusBadge estado={cv.estado} label={cv.estado} size="small" />
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={14} color={colors.textMuted} />
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {formatDate(cv.fechaEnvio)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={14} color={colors.textMuted} />
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {formatTime(cv.fechaEnvio)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Eye size={14} />}
                    onClick={() => setSelectedCv(cv)}
                  >
                    Ver caso
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={14} />}
                    onClick={() => handleEliminarConfirmation(cv.id)}
                  >
                    Retirar
                  </Button>
                </Box>
              </Paper>
            </TimelineItem>
          ))}
        </TimelineContainer>
      )}

      <Dialog
        open={!!selectedCv}
        onClose={() => setSelectedCv(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        {selectedCv && (
          <>
            <DialogTitle sx={{ fontWeight: 600 }}>
              Detalles del Caso
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar
                  src={selectedCv.publicacionData?.photo}
                  sx={{ width: 64, height: 64 }}
                >
                  {selectedCv.NombreCliente?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedCv.NombreCliente}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {selectedCv.numeroPaciente}
                  </Typography>
                  <StatusBadge 
                    estado={selectedCv.estado} 
                    label={selectedCv.estado} 
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Calendar size={16} color={colors.textMuted} />
                  <Typography variant="body2">
                    Enviado: {formatDate(selectedCv.fechaEnvio)} a las {formatTime(selectedCv.fechaEnvio)}
                  </Typography>
                </Box>
                {selectedCv.publicacionData?.localidad && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MapPin size={16} color={colors.textMuted} />
                    <Typography variant="body2">
                      {selectedCv.publicacionData.localidad}
                    </Typography>
                  </Box>
                )}
                {selectedCv.publicacionData?.diagnostico && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FileText size={16} color={colors.textMuted} />
                    <Typography variant="body2">
                      {selectedCv.publicacionData.diagnostico}
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedCv.descripcion && (
                <Box sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: alpha(colors.primary, 0.03),
                  border: `1px solid ${colors.border}`,
                }}>
                  <Typography variant="caption" sx={{ color: colors.textMuted }}>
                    Tu mensaje:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedCv.descripcion}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setSelectedCv(null)} variant="outlined">
                Cerrar
              </Button>
              <Button
                variant="contained"
                startIcon={<ExternalLink size={14} />}
                onClick={() => navigate(`/verCaso/${selectedCv.userIdPublicacion}`)}
              >
                Ver caso completo
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CvEnviados;
