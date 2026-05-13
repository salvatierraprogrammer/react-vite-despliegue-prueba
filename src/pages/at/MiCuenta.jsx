import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, IconButton, Divider, alpha, Alert,
  List, ListItem, ListItemIcon, ListItemText, Collapse,
  LinearProgress, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut, updatePassword, deleteUser } from 'firebase/auth';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  User, Mail, Phone, Shield, Lock, Trash2, LogOut,
  Edit, Eye, EyeOff, CheckCircle, AlertCircle,
  Crown, Sparkles, Settings, Bell, Moon, Sun, ChevronRight,
  CreditCard, Key, Camera, Star, Calendar, MapPin,
  Award, ExternalLink
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const ProfileCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'premium' })(({ premium }) => ({
  borderRadius: '24px',
  overflow: 'hidden',
  border: `1px solid ${premium ? colors.warning : colors.border}`,
  backgroundColor: colors.surface,
  position: 'relative',
}));

const ProfileBanner = styled(Box, { shouldForwardProp: (prop) => prop !== 'premium' })(({ premium }) => ({
  height: 120,
  background: premium
    ? `linear-gradient(135deg, ${colors.warning} 0%, #F97316 100%)`
    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  position: 'relative',
}));

const PremiumBadge = styled(Box)({
  position: 'absolute',
  top: 16,
  right: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 14px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  backdropFilter: 'blur(8px)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.75rem',
});

const ProfileAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: `6px solid ${colors.surface}`,
  boxShadow: `0 8px 24px ${alpha('#000', 0.15)}`,
  marginTop: -60,
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',
  zIndex: 1,
});

const InfoRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 0',
  borderBottom: `1px solid ${colors.border}`,
  '&:last-child': { borderBottom: 'none' },
});

const ActionButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'danger' })(({ danger }) => ({
  borderRadius: '12px',
  padding: '12px 20px',
  textTransform: 'none',
  fontWeight: 600,
  ...(danger
    ? {
        color: colors.danger,
        borderColor: colors.danger,
        '&:hover': {
          borderColor: colors.danger,
          bgcolor: alpha(colors.danger, 0.04),
        },
      }
    : {}),
}));

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

const StatCard = styled(Box)({
  padding: 20,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  textAlign: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
  },
});

const MiCuenta = () => {
  const [userData, setUserData] = useState(null);
  const [userRol, setUserRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            setUpdatedUserData({
              nombre: data.nombre || '',
              apellido: data.apellido || '',
              phoneNumber: data.phoneNumber || '',
              nombreEntidad: data.nombreEntidad || '',
              emailLaboral: data.emailLaboral || '',
              whatsapp: data.whatsapp || '',
            });
          } else {
            setError('No se encontraron datos del usuario.');
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
        await updateDoc(userRef, updateFields);
        setUserData((prev) => ({ ...prev, ...updateFields }));
        
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

  const roleLabels = {
    administrador: 'Administrador',
    reclutador: 'Reclutador',
    empleado: 'Acompañante Terapéutico',
    familiar: 'Familiar',
  };

  const isPremium = userData?.plan === 'premium' || userData?.isPremium;

  if (loading) return <LoadingPage />;

  if (error) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ pb: 4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Mi Cuenta
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Gestiona tu información personal y preferencias
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <ProfileCard elevation={0} premium={isPremium}>
            <ProfileBanner premium={isPremium}>
              {isPremium && (
                <PremiumBadge>
                  <Crown size={14} />
                  PREMIUM
                </PremiumBadge>
              )}
            </ProfileBanner>
            <ProfileAvatar src={userData?.photo}>
              {userData?.nombre?.[0]}{userData?.apellido?.[0]}
            </ProfileAvatar>
            
            <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {userData?.nombre} {userData?.apellido}
              </Typography>
              {userRol === 'reclutador' && userData?.nombreEntidad && (
                <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 600, mt: 0.5 }}>
                  {userData.nombreEntidad}
                </Typography>
              )}
              <Chip
                label={roleLabels[userRol] || userRol}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                  fontWeight: 600,
                }}
              />
              {isPremium && (
                <Chip
                  icon={<Crown size={12} />}
                  label="Plan Premium"
                  size="small"
                  sx={{
                    mt: 1,
                    ml: 1,
                    bgcolor: alpha(colors.warning, 0.1),
                    color: colors.warning,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
              {userRol === 'reclutador' && userData?.emailLaboral && (
                <InfoRow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Mail size={18} color={colors.textMuted} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Email Laboral
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userData.emailLaboral}
                  </Typography>
                </InfoRow>
              )}
              {userRol === 'reclutador' && userData?.whatsapp && (
                <InfoRow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone size={18} color={colors.textMuted} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      WhatsApp
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userData.whatsapp}
                  </Typography>
                </InfoRow>
              )}
              <InfoRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Mail size={18} color={colors.textMuted} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Correo
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {userData?.email}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone size={18} color={colors.textMuted} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Teléfono
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {userData?.phoneNumber || 'No agregado'}
                </Typography>
              </InfoRow>
              <InfoRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MapPin size={18} color={colors.textMuted} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    Zona
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {userData?.zona || 'No especificada'}
                </Typography>
              </InfoRow>
            </Box>

            <Box sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit size={16} />}
                onClick={() => setShowEditModal(true)}
              >
                Editar Datos
              </Button>
            </Box>
          </ProfileCard>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Estadísticas de la Cuenta
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                      {userData?.cvEnviados || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      CVs Enviados
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: colors.success }}>
                      {userData?.entrevistas || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Entrevistas
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: colors.warning }}>
                      {userData?.postulaciones || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Postulaciones
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <StatCard>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                      {userData?.visitas || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Visitas
                    </Typography>
                  </StatCard>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Acciones de la Cuenta
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.03), border: `1px solid ${colors.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={20} color={colors.primary} />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Cambiar Contraseña
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Actualiza tu contraseña de acceso
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" onClick={() => setShowPasswordModal(true)}>
                    Cambiar
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.03), border: `1px solid ${colors.border}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(colors.warning, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={20} color={colors.warning} />
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Plan {isPremium ? 'Premium' : 'Gratuito'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {isPremium ? 'Disfruta de todas las funcionalidades' : 'Actualiza para más beneficios'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={isPremium ? 'Activo' : 'Actualizar'}
                    size="small"
                    sx={{
                      bgcolor: isPremium ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
                      color: isPremium ? colors.success : colors.warning,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            <DangerZone>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(colors.danger, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={20} color={colors.danger} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: colors.danger }}>
                    Zona de Peligro
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Acciones irreversibles
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ActionButton
                  variant="outlined"
                  color="inherit"
                  startIcon={<LogOut size={16} />}
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  danger
                  startIcon={<Trash2 size={16} />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Eliminar Cuenta
                </ActionButton>
              </Box>
            </DangerZone>
          </Box>
        </Grid>
      </Grid>

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
          {userRol === 'reclutador' && (
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
