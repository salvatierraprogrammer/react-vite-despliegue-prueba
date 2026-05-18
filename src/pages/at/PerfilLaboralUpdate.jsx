import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  Card, CardContent, CardActions, IconButton, Select,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Divider, alpha, Skeleton, Tabs, Tab,
  Tooltip, Switch, FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Mail, MessageCircle, Edit, Briefcase, School,
  MapPin, Heart, Calendar, Clock, Star,
  CheckCircle, BadgeCheck, GraduationCap,
  DollarSign, Globe, User, Sparkles, Eye, Phone,
  ExternalLink, Edit2, Share2, TrendingUp, Award
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const ProfileCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'hasImage' })(({ hasImage }) => ({
  borderRadius: '24px',
  overflow: 'hidden',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
}));

const ProfileHeader = styled(Box)({
  position: 'relative',
  padding: '48px 24px 24px',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  textAlign: 'center',
});

const ProfileAvatar = styled(Avatar, { shouldForwardProp: (prop) => prop !== 'hasImage' })(({ hasImage }) => ({
  width: 140,
  height: 140,
  border: `6px solid rgba(255,255,255,0.3)`,
  boxShadow: `0 12px 32px ${alpha('#000', 0.25)}`,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
}));

const StatusIndicator = styled(Box, { shouldForwardProp: (prop) => prop !== 'estado' })(({ estado }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 16px',
  borderRadius: '20px',
  backgroundColor: estado === 'Disponible' ? alpha('#fff', 0.2) : 
                  estado === 'Consultar' ? alpha(colors.warning, 0.2) : 
                  alpha('#fff', 0.1),
  color: '#fff',
  fontSize: '0.875rem',
  fontWeight: 600,
}));

const InfoCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'highlight' })(({ highlight }) => ({
  borderRadius: '20px',
  border: `1px solid ${highlight ? colors.primary : colors.border}`,
  backgroundColor: colors.surface,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: colors.primary,
    boxShadow: `0 8px 24px ${alpha(colors.primary, 0.08)}`,
  },
}));

const StatItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  borderRadius: '12px',
  backgroundColor: alpha(colors.primary, 0.03),
  border: `1px solid ${colors.border}`,
});

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

const CompletitudBar = ({ percentage }) => {
  const sections = [
    { label: 'Datos personales', complete: percentage > 20 },
    { label: 'Foto de perfil', complete: percentage > 40 },
    { label: 'Experiencia', complete: percentage > 60 },
    { label: 'Formación', complete: percentage > 80 },
    { label: 'Disponibilidad', complete: percentage >= 100 },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Completitud del Perfil
        </Typography>
        <Chip
          label={`${percentage}%`}
          size="small"
          sx={{
            bgcolor: percentage === 100 ? alpha(colors.success, 0.1) : alpha(colors.primary, 0.1),
            color: percentage === 100 ? colors.success : colors.primary,
            fontWeight: 700,
          }}
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          mb: 3,
          bgcolor: alpha(colors.primary, 0.08),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderRadius: 4,
          },
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sections.map((sec, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {sec.complete ? (
              <CheckCircle size={16} color={colors.success} />
            ) : (
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${colors.border}`,
                }}
              />
            )}
            <Typography variant="body2" sx={{ color: sec.complete ? colors.textPrimary : colors.textMuted }}>
              {sec.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const PerfilLaboralUpdate = () => {
  const { user, userRol } = useAuth();
  const [perfilData, setPerfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState('Disponible');
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRol !== 'empleado' && userRol !== 'administrador') {
      navigate('/miCuenta', { replace: true });
    }
  }, [user, userRol, navigate]);

  if (user && userRol !== 'empleado' && userRol !== 'administrador') {
    return <LoadingPage />;
  }

  const fetchPerfilData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        const perfilSnapshot = await getDoc(perfilDoc);
        if (perfilSnapshot.exists()) {
          const data = perfilSnapshot.data();
          setPerfilData(data);
          setEstado(data.estado || 'Disponible');
        } else {
          setPerfilData(null);
          setError('No se encontraron datos del perfil.');
        }
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al cargar los datos del perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerfilData();
  }, [fetchPerfilData]);

  const handleChangeEstado = async (newEstado) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        await updateDoc(perfilDoc, { estado: newEstado });
        setEstado(newEstado);
        setPerfilData((prev) => ({ ...prev, estado: newEstado }));
        setOpenSuccessModal(true);
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al actualizar el estado.');
    }
  };

  const calculateCompletitud = () => {
    if (!perfilData) return 0;
    let count = 0;
    if (perfilData.nombreCompleto) count += 20;
    if (perfilData.images) count += 20;
    if (perfilData.experiencia) count += 20;
    if (perfilData.formacion) count += 20;
    if (perfilData.localidad) count += 20;
    return Math.min(count, 100);
  };

  const completitud = calculateCompletitud();

  if (loading) return <LoadingPage />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ pb: 4 }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Mi Perfil Laboral
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Gestiona tu información profesional y disponibilidad
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Share2 size={16} />}
          >
            Compartir
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit size={16} />}
            onClick={() => navigate(`/editarPerfilLaboral/${auth.currentUser?.uid}`)}
          >
            Editar Perfil
          </Button>
        </Box>
      </Box>

      {!perfilData ? (
        <EmptyState
          icon={User}
          title="Sin perfil laboral"
          description="Aún no has creado tu perfil laboral. Crea uno para que los reclutadores puedan encontrarte."
          action={
            <Button
              variant="contained"
              startIcon={<Sparkles size={16} />}
              onClick={() => navigate(`/editarPerfilLaboral/${auth.currentUser?.uid}`)}
            >
              Crear Perfil
            </Button>
          }
        />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <ProfileCard elevation={0}>
              <ProfileHeader>
                <ProfileAvatar src={perfilData.images}>
                  {perfilData.nombreCompleto?.[0]}
                </ProfileAvatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mt: 2 }}>
                  {perfilData.nombreCompleto}
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                  {perfilData.formacion || 'Acompañante Terapéutico'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <StatusIndicator estado={estado}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: estado === 'Disponible' ? '#10B981' : 
                                        estado === 'Consultar' ? '#F59E0B' : 
                                        '#94A3B8',
                      }}
                    />
                    {estado}
                  </StatusIndicator>
                </Box>
              </ProfileHeader>

              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                  <Tooltip title="Enviar email">
                    <IconButton
                      component="a"
                      href={`mailto:${perfilData.email}`}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: alpha(colors.primary, 0.08),
                        color: colors.primary,
                        '&:hover': { bgcolor: alpha(colors.primary, 0.15) },
                      }}
                    >
                      <Mail size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="WhatsApp">
                    <IconButton
                      component="a"
                      href={`https://wa.me/${perfilData.telefono?.replace(/\D/g, '')}`}
                      target="_blank"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: alpha('#25D366', 0.1),
                        color: '#25D366',
                        '&:hover': { bgcolor: alpha('#25D366', 0.15) },
                      }}
                    >
                      <MessageCircle size={20} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Llamar">
                    <IconButton
                      component="a"
                      href={`tel:${perfilData.telefono}`}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        bgcolor: alpha(colors.success, 0.08),
                        color: colors.success,
                        '&:hover': { bgcolor: alpha(colors.success, 0.15) },
                      }}
                    >
                      <Phone size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Mail size={16} color={colors.textMuted} />
                    <Typography variant="body2">{perfilData.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone size={16} color={colors.textMuted} />
                    <Typography variant="body2">{perfilData.telefono}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MapPin size={16} color={colors.textMuted} />
                    <Typography variant="body2">
                      {perfilData.localidad} - {perfilData.zona}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Cambiar Estado
                  </Typography>
                  <Select
                    fullWidth
                    value={estado}
                    onChange={(e) => handleChangeEstado(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="Disponible">Disponible</MenuItem>
                    <MenuItem value="Consultar">Consultar</MenuItem>
                    <MenuItem value="No Disponible">No Disponible</MenuItem>
                  </Select>
                </Box>
              </CardContent>
            </ProfileCard>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <StatItem>
                    <Eye size={20} color={colors.primary} />
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        Visitas
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {perfilData.visitas || 0}
                      </Typography>
                    </Box>
                  </StatItem>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatItem>
                    <Star size={20} color={colors.warning} />
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        Calificación
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {perfilData.calificacion || '4.8'}
                      </Typography>
                    </Box>
                  </StatItem>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatItem>
                    <TrendingUp size={20} color={colors.success} />
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        Postulaciones
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {perfilData.postulaciones || 0}
                      </Typography>
                    </Box>
                  </StatItem>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatItem>
                    <Award size={20} color={colors.secondary} />
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textMuted }}>
                        Años exp.
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {perfilData.aniosExperiencia || 0}
                      </Typography>
                    </Box>
                  </StatItem>
                </Grid>
              </Grid>

              <InfoCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Briefcase size={20} color={colors.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Experiencia Profesional
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8 }}>
                    {perfilData.experiencia || 'Sin información'}
                  </Typography>
                </CardContent>
              </InfoCard>

              <InfoCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <GraduationCap size={20} color={colors.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Formación Académica
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8 }}>
                    {perfilData.formacion || 'Sin información'}
                  </Typography>
                </CardContent>
              </InfoCard>

              <InfoCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Heart size={20} color={colors.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Sobre Mí
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.8 }}>
                    {perfilData.sobreMi || 'Sin información'}
                  </Typography>
                </CardContent>
              </InfoCard>

              <CompletitudBar percentage={completitud} />
            </Box>
          </Grid>
        </Grid>
      )}

      <Dialog
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 2 } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: alpha(colors.success, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircle size={32} color={colors.success} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ¡Estado actualizado!
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
            Tu estado ha sido cambiado a "{estado}"
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setOpenSuccessModal(false)} variant="contained">
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerfilLaboralUpdate;
