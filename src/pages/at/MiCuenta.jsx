import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, Dialog, DialogActions,
  InputAdornment, IconButton, alpha, Alert,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut, updatePassword, deleteUser } from 'firebase/auth';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import ModalEditarPerfil from '../../components/ModalEditarPerfil';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  User, Mail, Phone, Shield, Trash2, LogOut,
  Edit, Eye, EyeOff, CheckCircle, AlertCircle,
  Crown, ChevronRight, Key, Camera, MapPin,
  Briefcase, Heart, FileText, Home, BookOpen
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const roleColors = {
  empleado: { primary: '#10B981', light: alpha('#10B981', 0.12), gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', label: 'Acompañante Terapéutico' },
  reclutador: { primary: '#4F46E5', light: alpha('#4F46E5', 0.12), gradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', label: 'Reclutador' },
  familiar: { primary: '#F59E0B', light: alpha('#F59E0B', 0.12), gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', label: 'Familiar' },
  administrador: { primary: '#7C3AED', light: alpha('#7C3AED', 0.12), gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', label: 'Administrador' },
};

const roleEmoji = {
  empleado: <Heart size={16} />,
  reclutador: <Briefcase size={16} />,
  familiar: <Home size={16} />,
  administrador: <Shield size={16} />,
};

const HeroSection = styled(Box, { shouldForwardProp: (prop) => prop !== 'rolecolor' })(({ rolecolor }) => ({
  position: 'relative',
  borderRadius: '24px',
  overflow: 'hidden',
  background: rolecolor?.gradient || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  padding: '32px 32px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: `radial-gradient(ellipse at center right, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    width: '80%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.3)}, transparent)`,
  },
}));

const HeroAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  border: `3px solid ${alpha('#fff', 0.7)}`,
  boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`,
});

const GlassBadge = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: '20px',
  backgroundColor: alpha('#fff', 0.15),
  backdropFilter: 'blur(8px)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.75rem',
  border: `1px solid ${alpha('#fff', 0.1)}`,
});

const SectionCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'accent' })(({ accent }) => ({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
  position: 'relative',
  '&::before': accent ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: accent,
    borderTopLeftRadius: '20px',
    borderBottomLeftRadius: '20px',
  } : {},
}));

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.8125rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: colors.textMuted,
  mb: 2,
});

const DataRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 0',
  borderBottom: `1px solid ${alpha(colors.border, 0.5)}`,
  '&:last-of-type': { borderBottom: 'none' },
});

const DataLabel = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.textSecondary,
});

const DataValue = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.textPrimary,
  textAlign: 'right',
});

const StatBadge = styled(Box, { shouldForwardProp: (prop) => prop !== 'color' })(({ color }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  padding: '20px 16px',
  borderRadius: '16px',
  backgroundColor: alpha(color || colors.primary, 0.06),
  border: `1px solid ${alpha(color || colors.primary, 0.12)}`,
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: alpha(color || colors.primary, 0.1),
    transform: 'translateY(-2px)',
  },
}));

const ActionRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: '12px',
  backgroundColor: alpha(colors.surfaceSecondary, 0.6),
  border: `1px solid ${colors.border}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.03),
  },
});

const ModalPaper = styled(Paper)({
  borderRadius: '24px',
  padding: 0,
  overflow: 'hidden',
});

const ModalHeader = styled(Box, { shouldForwardProp: (prop) => prop !== 'gradient' })(({ gradient }) => ({
  padding: '24px 24px 48px',
  background: gradient
    ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
    : colors.surface,
  position: 'relative',
}));

const ModalBody = styled(Box)({
  padding: '24px',
  marginTop: -24,
  backgroundColor: colors.surface,
  borderRadius: '24px 24px 0 0',
  position: 'relative',
});

const DangerZone = styled(Box)({
  padding: 20,
  borderRadius: '16px',
  border: `1px solid ${alpha(colors.danger, 0.3)}`,
  backgroundColor: alpha(colors.danger, 0.02),
});

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const MiCuenta = () => {
  const [userData, setUserData] = useState(null);
  const [userRol, setUserRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [perfilLaboral, setPerfilLaboral] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [updatedUserData, setUpdatedUserData] = useState({
    nombre: '',
    apellido: '',
    phoneNumber: '',
    nombreEntidad: '',
    emailLaboral: '',
    whatsapp: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [pubCount, setPubCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserRol(data.userRol);
            setPhotoPreview(data.photo || '');
            setUpdatedUserData({
              nombre: data.nombre || '',
              apellido: data.apellido || '',
              phoneNumber: data.phoneNumber || '',
              nombreEntidad: data.nombreEntidad || '',
              emailLaboral: data.emailLaboral || '',
              whatsapp: data.whatsapp || '',
            });
          }

          const perfilDoc = await getDoc(doc(db, 'perfilLaboral', user.uid));
          if (perfilDoc.exists()) {
            setPerfilLaboral(perfilDoc.data());
          }

          if (userDoc.exists() && (userDoc.data().userRol === 'reclutador' || userDoc.data().userRol === 'familiar')) {
            const pubSnap = await getDocs(query(collection(db, 'publicaciones'), where('userId', '==', user.uid)));
            setPubCount(pubSnap.size);
          }
        } else {
          setError('Usuario no autenticado.');
        }
      } catch (err) {
        setError('Error al cargar los datos del usuario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading && userData && (userRol === 'reclutador' || userRol === 'familiar')) {
      const hasNombreEntidad = !!userData?.nombreEntidad;
      const hasPhone = !!userData?.phoneNumber;
      const hasEmail = userRol === 'reclutador' ? !!userData?.emailLaboral : true;
      if (!hasNombreEntidad || !hasPhone || !hasEmail) {
        setShowOnboardingModal(true);
      }
    }
  }, [loading, userData, userRol]);

  const handleCropSave = (downloadUrl) => {
    setPhotoPreview(downloadUrl);
    setUserData(prev => ({ ...prev, photo: downloadUrl }));
  };

  const handleEditAccount = async () => {
    setLoadingAction(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const updateFields = {
          nombre: updatedUserData.nombre,
          apellido: updatedUserData.apellido,
          phoneNumber: updatedUserData.phoneNumber,
        };
        if (userRol === 'reclutador') {
          updateFields.nombreEntidad = updatedUserData.nombreEntidad;
          updateFields.emailLaboral = updatedUserData.emailLaboral;
          updateFields.whatsapp = updatedUserData.whatsapp;
        }
        if (userRol === 'familiar') {
          updateFields.nombreEntidad = updatedUserData.nombreEntidad;
        }
        if (photoPreview) {
          updateFields.photo = photoPreview;
        }
        await updateDoc(userRef, updateFields);
        setUserData((prev) => ({ ...prev, ...updateFields }));
        
        setShowOnboardingModal(false);
        
        await MySwal.fire({
          title: '¡Actualizado!',
          text: 'Tus datos han sido actualizados correctamente.',
          icon: 'success',
          confirmButtonColor: colors.success,
          background: colors.surface,
        });
        
        setShowEditModal(false);
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: 'No se pudo actualizar los datos.',
        icon: 'error',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      MySwal.fire({
        title: 'Error',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        icon: 'error',
      });
      return;
    }

    setLoadingAction(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        
        await MySwal.fire({
          title: '¡Contraseña cambiada!',
          text: 'Tu contraseña ha sido actualizada exitosamente.',
          icon: 'success',
          confirmButtonColor: colors.success,
          background: colors.surface,
        });
        
        setShowPasswordModal(false);
        setNewPassword('');
      }
    } catch (error) {
      MySwal.fire({
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Es posible que necesites iniciar sesión recientemente.',
        icon: 'error',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>Esta acción eliminará permanentemente tu cuenta y todos tus datos.</p>
        <p style="margin-top: 16px; font-weight: 600;">No podrás revertir esta acción.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      cancelButtonColor: colors.primary,
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
      background: colors.surface,
      customClass: {
        popup: 'rounded-24px',
      },
    });

    if (result.isConfirmed) {
      setLoadingAction(true);
      try {
        const user = auth.currentUser;
        if (user) {
          await deleteDoc(doc(db, 'usuarios', user.uid));
          await deleteUser(user);
          
          await MySwal.fire({
            title: 'Cuenta eliminada',
            text: 'Tu cuenta ha sido eliminada correctamente.',
            icon: 'success',
            confirmButtonColor: colors.primary,
          });
          
          navigate('/');
        }
      } catch (error) {
        MySwal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la cuenta. Es posible que hayas iniciado sesión recientemente.',
          icon: 'error',
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: colors.textSecondary,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: colors.surface,
    });

    if (result.isConfirmed) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const rc = roleColors[userRol] || roleColors.reclutador;

  const isPremium = userData?.plan === 'premium' || userData?.isPremium;

  if (loading) return <LoadingPage />;

  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  const renderRoleSpecificSection = () => {
    switch (userRol) {
      case 'empleado':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={2}>
              <SectionCard accent={colors.success} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Perfil Laboral</SectionTitle>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experiencia</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: colors.textPrimary }}>
                          {perfilLaboral?.experiencia || 'No especificada'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Formación</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: colors.textPrimary }}>
                          {perfilLaboral?.formacion || 'No especificada'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Localidad</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: colors.textPrimary }}>
                          {perfilLaboral?.localidad || userData?.zona || 'No especificada'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                        <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CV</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5, color: colors.textPrimary }}>
                          {perfilLaboral?.cvURL ? (
                            <Box component="span" sx={{ color: colors.success, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CheckCircle size={12} /> {perfilLaboral.cvName || 'Subido'}
                            </Box>
                          ) : 'No subido'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<FileText size={16} />}
                        onClick={() => navigate(`/editarPerfilLaboral/${auth.currentUser?.uid}`)}
                        sx={{ borderRadius: '12px', mt: 1 }}
                      >
                        Editar Perfil Laboral
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={3}>
              <SectionCard accent={colors.primary} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Estadísticas</SectionTitle>
                  <Grid container spacing={2}>
                    {[
                      { label: 'CVs Enviados', value: userData?.cvEnviados || 0, color: colors.primary },
                      { label: 'Entrevistas', value: userData?.entrevistas || 0, color: colors.success },
                      { label: 'Postulaciones', value: userData?.postulaciones || 0, color: colors.warning },
                      { label: 'Visitas', value: userData?.visitas || 0, color: colors.secondary },
                    ].map((stat, i) => (
                      <Grid item xs={6} sm={3} key={i}>
                        <StatBadge color={stat.color}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>
                            {stat.label}
                          </Typography>
                        </StatBadge>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </SectionCard>
            </motion.div>
          </Box>
        );

      case 'reclutador':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={2}>
              <SectionCard accent={colors.primary} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Datos de la Entidad</SectionTitle>
                  <Box>
                    <DataRow>
                      <DataLabel>Entidad</DataLabel>
                      <DataValue>{userData?.nombreEntidad || 'No especificada'}</DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>Email Laboral</DataLabel>
                      <DataValue>{userData?.emailLaboral || 'No especificado'}</DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>WhatsApp</DataLabel>
                      <DataValue>{userData?.whatsapp || 'No especificado'}</DataValue>
                    </DataRow>
                  </Box>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={3}>
              <SectionCard accent={colors.warning} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Estadísticas</SectionTitle>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <StatBadge color={colors.primary}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary, lineHeight: 1 }}>
                          {pubCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>
                          Publicaciones
                        </Typography>
                      </StatBadge>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatBadge color={colors.success}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.success, lineHeight: 1 }}>
                          {userData?.visitas || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>
                          Vistas totales
                        </Typography>
                      </StatBadge>
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BookOpen size={16} />}
                onClick={() => navigate('/misPublicaciones')}
                sx={{ borderRadius: '12px' }}
              >
                Ver mis publicaciones
              </Button>
            </motion.div>
          </Box>
        );

      case 'familiar':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={2}>
              <SectionCard accent={colors.warning} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Datos de la Entidad</SectionTitle>
                  <Box>
                    <DataRow>
                      <DataLabel>Entidad</DataLabel>
                      <DataValue>Familiar</DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>WhatsApp</DataLabel>
                      <DataValue>{userData?.whatsapp || userData?.phoneNumber || 'No especificado'}</DataValue>
                    </DataRow>
                  </Box>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={3}>
              <SectionCard accent={colors.primary} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Estadísticas</SectionTitle>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <StatBadge color={colors.primary}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary, lineHeight: 1 }}>
                          {pubCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>
                          Casos publicados
                        </Typography>
                      </StatBadge>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatBadge color={colors.warning}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.warning, lineHeight: 1 }}>
                          {userData?.visitas || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>
                          Vistas totales
                        </Typography>
                      </StatBadge>
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BookOpen size={16} />}
                onClick={() => navigate('/misPublicaciones')}
                sx={{ borderRadius: '12px' }}
              >
                Ver mis casos
              </Button>
            </motion.div>
          </Box>
        );

      case 'administrador':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <motion.div variants={fadeUp} initial="initial" animate="animate" custom={2}>
              <SectionCard accent={colors.secondary} elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Panel de Administración</SectionTitle>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ActionRow onClick={() => navigate('/almacenamiento')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} color={colors.primary} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Almacenamiento</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Gestionar archivos del sistema</Typography>
                        </Box>
                      </Box>
                      <ChevronRight size={18} color={colors.textMuted} />
                    </ActionRow>
                  </Box>
                </Box>
              </SectionCard>
            </motion.div>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <HeroSection rolecolor={rc}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <HeroAvatar src={perfilLaboral?.images || userData?.photo}>
                {userData?.nombre?.[0]}{userData?.apellido?.[0]}
              </HeroAvatar>
              <IconButton
                onClick={() => setCropModalOpen(true)}
                size="small"
                sx={{
                  position: 'absolute', bottom: -2, right: -2,
                  bgcolor: alpha('#fff', 0.9), color: '#1E293B',
                  width: 26, height: 26,
                  boxShadow: `0 2px 8px ${alpha('#000', 0.2)}`,
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <Camera size={12} />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, mb: 0.75 }}
              >
                {userData?.nombre || userData?.apellido
                  ? `${userData?.nombre || ''} ${userData?.apellido || ''}`.trim()
                  : 'Usuario'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <GlassBadge>
                  {roleEmoji[userRol]}
                  {rc.label}
                </GlassBadge>
                {isPremium && (
                  <GlassBadge>
                    <Crown size={14} />
                    PREMIUM
                  </GlassBadge>
                )}
              </Box>
            </Box>
          </Box>
        </HeroSection>
      </motion.div>

      {/* Content */}
      <Grid container spacing={3} sx={{ mt: { xs: 0, sm: 2 } }}>
        {/* Left sidebar - Profile details */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <SectionCard elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Contacto</SectionTitle>
                  <Box>
                    <DataRow>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Mail size={15} color={colors.textMuted} />
                        <DataLabel>Email</DataLabel>
                      </Box>
                      <DataValue sx={{ fontSize: '0.8125rem' }}>{userData?.email}</DataValue>
                    </DataRow>
                    <DataRow>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Phone size={15} color={colors.textMuted} />
                        <DataLabel>Teléfono</DataLabel>
                      </Box>
                      <DataValue sx={{ fontSize: '0.8125rem' }}>{userData?.phoneNumber || '—'}</DataValue>
                    </DataRow>
                    <DataRow>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MapPin size={15} color={colors.textMuted} />
                        <DataLabel>Zona</DataLabel>
                      </Box>
                      <DataValue sx={{ fontSize: '0.8125rem' }}>{userData?.zona || '—'}</DataValue>
                    </DataRow>
                  </Box>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <SectionCard elevation={0}>
                <Box sx={{ p: 3 }}>
                  <SectionTitle>Acciones</SectionTitle>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Edit size={16} />}
                      onClick={() => setShowEditModal(true)}
                      sx={{ borderRadius: '12px' }}
                    >
                      Editar Datos
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Key size={16} />}
                      onClick={() => setShowPasswordModal(true)}
                      sx={{ borderRadius: '12px' }}
                    >
                      Cambiar Contraseña
                    </Button>
                  </Box>
                </Box>
              </SectionCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <DangerZone>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.danger, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={18} color={colors.danger} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.danger }}>
                      Zona de Peligro
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>
                      Acciones irreversibles
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<LogOut size={14} />}
                    onClick={handleLogout}
                    sx={{ borderRadius: '10px' }}
                  >
                    Salir
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<Trash2 size={14} />}
                    onClick={() => setShowDeleteModal(true)}
                    sx={{ borderRadius: '10px', color: colors.danger, borderColor: alpha(colors.danger, 0.3), '&:hover': { borderColor: colors.danger, bgcolor: alpha(colors.danger, 0.04) } }}
                  >
                    Eliminar
                  </Button>
                </Box>
              </DangerZone>
            </motion.div>
          </Box>
        </Grid>

        {/* Right main - Role-specific data */}
        <Grid item xs={12} lg={8}>
          {renderRoleSpecificSection()}
        </Grid>
      </Grid>

      {/* Onboarding Modal */}
      <Dialog
        open={showOnboardingModal}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperComponent={ModalPaper}
        disableEscapeKeyDown
      >
        <ModalHeader gradient>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Completa tus datos
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
            Antes de empezar a usar la plataforma
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={photoPreview || userData?.photo}
                sx={{ width: 96, height: 96, border: `4px solid ${colors.surface}`, boxShadow: `0 4px 16px ${alpha('#000', 0.12)}` }}
              >
                {userData?.nombre?.[0]}{userData?.apellido?.[0]}
              </Avatar>
              <IconButton
                onClick={() => setCropModalOpen(true)}
                size="small"
                sx={{ position: 'absolute', bottom: 0, right: -4, bgcolor: colors.primary, color: '#fff', width: 32, height: 32, '&:hover': { bgcolor: colors.primaryDark } }}
              >
                <Camera size={16} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.04), border: `1px solid ${alpha(colors.primary, 0.1)}` }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.6 }}>
              Completá los datos para que puedas publicar y ver perfiles de Acompañante Terapéutico.
              {userRol === 'reclutador' ? ' Nombre de entidad, teléfono y email para que se contacten con vos.' : ' Teléfono y email para que se contacten con vos.'}
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Nombre de la Entidad"
            value={updatedUserData.nombreEntidad || ''}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, nombreEntidad: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            placeholder="Ej: 11 1234-5678"
            value={updatedUserData.phoneNumber}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          {userRol === 'reclutador' && (
            <TextField
              fullWidth
              label="Email Laboral"
              value={updatedUserData.emailLaboral || ''}
              onChange={(e) => setUpdatedUserData({ ...updatedUserData, emailLaboral: e.target.value })}
            />
          )}
        </ModalBody>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleEditAccount} variant="contained" disabled={loadingAction} sx={{ width: '100%' }}>
            {loadingAction ? 'Guardando...' : 'Guardar y empezar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ModalEditarPerfil open={cropModalOpen} onClose={() => setCropModalOpen(false)} onSave={handleCropSave} />

      {/* Edit Profile Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperComponent={ModalPaper}
      >
        <ModalHeader gradient>
          <IconButton
            onClick={() => setShowEditModal(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: '#fff' }}
          >
            <EyeOff size={20} />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Editar Datos
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
            Actualiza tu información personal
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={photoPreview || userData?.photo}
                sx={{ width: 80, height: 80, border: `4px solid ${colors.surface}`, boxShadow: `0 4px 16px ${alpha('#000', 0.12)}` }}
              >
                {userData?.nombre?.[0]}{userData?.apellido?.[0]}
              </Avatar>
              <IconButton
                onClick={() => setCropModalOpen(true)}
                size="small"
                sx={{ position: 'absolute', bottom: 0, right: -4, bgcolor: colors.primary, color: '#fff', width: 28, height: 28, '&:hover': { bgcolor: colors.primaryDark } }}
              >
                <Camera size={14} />
              </IconButton>
            </Box>
          </Box>
          <TextField
            fullWidth
            label="Nombre"
            value={updatedUserData.nombre}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Apellido"
            value={updatedUserData.apellido}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, apellido: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            value={updatedUserData.phoneNumber}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          {(userRol === 'reclutador' || userRol === 'familiar') && (
            <>
              <TextField
                fullWidth
                label="Nombre de la Entidad"
                value={updatedUserData.nombreEntidad || ''}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, nombreEntidad: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email Laboral"
                value={updatedUserData.emailLaboral || ''}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, emailLaboral: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="WhatsApp"
                value={updatedUserData.whatsapp || ''}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, whatsapp: e.target.value })}
              />
            </>
          )}
        </ModalBody>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowEditModal(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleEditAccount} variant="contained" disabled={loadingAction}>
            {loadingAction ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Modal */}
      <Dialog
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        maxWidth="sm"
        fullWidth
        PaperComponent={ModalPaper}
      >
        <ModalHeader gradient>
          <IconButton
            onClick={() => setShowPasswordModal(false)}
            sx={{ position: 'absolute', right: 16, top: 16, color: '#fff' }}
          >
            <EyeOff size={20} />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Cambiar Contraseña
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
            Ingresa tu nueva contraseña
          </Typography>
        </ModalHeader>
        <ModalBody>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Mínimo 6 caracteres"
          />
        </ModalBody>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowPasswordModal(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={loadingAction}>
            {loadingAction ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperComponent={ModalPaper}
      >
        <ModalHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(colors.danger, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} color={colors.danger} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Eliminar Cuenta
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Esta acción no se puede deshacer
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setShowDeleteModal(false)}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <EyeOff size={20} />
          </IconButton>
        </ModalHeader>
        <ModalBody>
          <Alert severity="error" sx={{ mb: 2 }}>
            Al eliminar tu cuenta perderás:
          </Alert>
          <List dense>
            <ListItem>
              <ListItemIcon><Trash2 size={16} color={colors.danger} /></ListItemIcon>
              <ListItemText primary="Tu perfil laboral y CV" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Trash2 size={16} color={colors.danger} /></ListItemIcon>
              <ListItemText primary="Historial de postulaciones" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Trash2 size={16} color={colors.danger} /></ListItemIcon>
              <ListItemText primary="Todas tus publicaciones" />
            </ListItem>
          </List>
        </ModalBody>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDeleteModal(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDeleteAccount} variant="contained" color="error" disabled={loadingAction}>
            {loadingAction ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MiCuenta;
