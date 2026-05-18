import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, MenuItem, InputAdornment, IconButton, Divider, alpha,
  LinearProgress, Stack, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, store } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import ModalEditarPerfil from '../../components/ModalEditarPerfil';
import { generarPerfilSlug } from '../../utils/slugUtils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../../context/AuthContext';
import {
  User, Phone, Mail, School, Briefcase, MapPin,
  Globe, Edit, Save, ChevronLeft, Camera, CloudUpload,
  CheckCircle, AlertCircle, Sparkles, Heart, FileText,
  Upload, Trash2, Download, MessageCircle, Info,
  Smartphone
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const FormContainer = styled(Box)({
  maxWidth: 1000,
  margin: '0 auto',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  },
});

const SectionCard = styled(Paper)({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
});

const SectionHeader = styled(Box, { shouldForwardProp: (prop) => prop !== 'gradient' })(({ gradient }) => ({
  padding: '20px 24px',
  background: gradient ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : colors.surfaceSecondary,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}));

const ProfileAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: `4px solid ${colors.border}`,
  boxShadow: `0 8px 24px ${alpha(colors.primary, 0.15)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.85,
    transform: 'scale(1.02)',
  },
});

const UploadZone = styled(Box, { shouldForwardProp: (prop) => prop !== 'hasfile' })(({ hasfile }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px 20px',
  borderRadius: '14px',
  border: `2px dashed ${hasfile ? colors.success : colors.border}`,
  backgroundColor: hasfile ? alpha(colors.success, 0.04) : alpha(colors.surfaceSecondary, 0.6),
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: hasfile ? colors.success : colors.primary,
    backgroundColor: hasfile ? alpha(colors.success, 0.06) : alpha(colors.primary, 0.04),
    transform: 'translateY(-1px)',
    boxShadow: hasfile ? `0 4px 12px ${alpha(colors.success, 0.1)}` : `0 4px 12px ${alpha(colors.primary, 0.08)}`,
  },
}));

const EditarPerfilLaboral = () => {
  const { user, userRol } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    whatsapp: '',
    experiencia: '',
    formacion: '',
    sobreMi: '',
    localidad: '',
    preferenciaLaboral: '',
    zona: '',
    images: '',
    photoURL: '',
    cvURL: '',
    cvName: '',
    estado: 'Disponible',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvProgress, setCvProgress] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (user && userRol !== 'administrador' && user.uid !== id) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, userRol, id, navigate]);

  if (user && userRol !== 'administrador' && user.uid !== id) {
    return <LoadingPage />;
  }

  const fetchPerfilData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilId = id || user.uid;
        const perfilDoc = doc(db, 'perfilLaboral', perfilId);
        const perfilSnapshot = await getDoc(perfilDoc);
        if (perfilSnapshot.exists()) {
          const data = perfilSnapshot.data();
          const sanitized = {};
          Object.entries(data).forEach(([key, val]) => {
            sanitized[key] = val ?? '';
          });
          setFormData((prev) => ({ ...prev, ...sanitized }));
          setPhotoPreview(data.photoURL || data.images || '');
        } else {
          setIsNewProfile(true);
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
  }, [id]);

  useEffect(() => {
    fetchPerfilData();
  }, [fetchPerfilData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCropSave = (downloadUrl) => {
    setPhotoPreview(downloadUrl);
    setFormData((prev) => ({ ...prev, photoURL: downloadUrl, images: downloadUrl }));
  };

  const handleCvFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        MySwal.fire({ title: 'Archivo muy grande', text: 'El máximo permitido es 10MB', icon: 'error' });
        return;
      }
      uploadCv(file);
    }
  };

  const uploadCv = async (file) => {
    setCvUploading(true);
    setCvProgress(0);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const storageRef = ref(store, `cvs/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const cvUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setCvProgress(Math.round(progress));
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      setFormData((prev) => ({ ...prev, cvURL: cvUrl, cvName: file.name }));
      MySwal.fire({ title: 'CV subido', text: 'Tu currículum se ha subido correctamente', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error('Error uploading CV:', err);
      MySwal.fire({ title: 'Error', text: 'No se pudo subir el CV', icon: 'error' });
    } finally {
      setCvUploading(false);
      setCvProgress(0);
    }
  };

  const handleRemoveCv = async () => {
    if (formData.cvURL) {
      try {
        const cvRef = ref(store, formData.cvURL);
        await deleteObject(cvRef);
      } catch (e) {
        console.warn('Could not delete storage file:', e);
      }
    }
    setFormData((prev) => ({ ...prev, cvURL: '', cvName: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const perfilId = id || user.uid;
        const perfilDoc = doc(db, 'perfilLaboral', perfilId);
        const perfilSnap = await getDoc(perfilDoc);
        const slug = formData.slug || (formData.nombreCompleto ? generarPerfilSlug(formData.nombreCompleto) : perfilId);
        const dataToSave = { ...formData, slug };
        if (perfilSnap.exists()) {
          await updateDoc(perfilDoc, dataToSave);
        } else {
          await setDoc(perfilDoc, dataToSave);
        }

        if (formData.images) {
          await updateDoc(doc(db, 'usuarios', user.uid), { photo: formData.images });
        }

        await MySwal.fire({
          title: perfilSnap.exists() ? '¡Perfil actualizado!' : '¡Perfil creado!',
          text: 'Tus datos han sido guardados correctamente.',
          icon: 'success',
          confirmButtonColor: colors.success,
          background: colors.surface,
        });

        navigate('/perfilLaboralUpdate');
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al actualizar el perfil.');
      await MySwal.fire({ title: 'Error', text: 'No se pudo actualizar el perfil. Intenta nuevamente.', icon: 'error' });
    } finally {
      setSaving(false);
    }
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
      {isNewProfile && (
        <Box sx={{ mb: 3, p: 2.5, borderRadius: '14px', bgcolor: alpha(colors.warning, 0.08), border: `1px solid ${alpha(colors.warning, 0.2)}` }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.warning, mb: 0.5 }}>
            Bienvenido a la plataforma
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.6 }}>
            Completá tus datos para poder postularte a casos de Acompañante Terapéutico
            y acceder a todas las funcionalidades del panel.
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            {isNewProfile ? 'Completá tu perfil' : 'Editar Perfil'}
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            {isNewProfile ? 'Contanos sobre vos para empezar' : 'Actualiza tu información profesional'}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/perfilLaboralUpdate')}>
          Volver
        </Button>
      </Box>

      <ModalEditarPerfil open={cropModalOpen} onClose={() => setCropModalOpen(false)} onSave={handleCropSave} />

      <form onSubmit={handleSubmit}>
        <FormContainer>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                <SectionCard elevation={0}>
                  <SectionHeader>
                    <Camera size={20} color={colors.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Foto de Perfil</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                      <Box sx={{ position: 'relative' }}>
                        <ProfileAvatar
                          src={photoPreview}
                          onClick={() => setCropModalOpen(true)}
                        >
                          {formData.nombreCompleto?.[0] || '?'}
                        </ProfileAvatar>
                        <IconButton
                          onClick={() => setCropModalOpen(true)}
                          sx={{
                            position: 'absolute', bottom: 0, right: 0,
                            bgcolor: colors.primary, color: '#fff',
                            width: 36, height: 36,
                            '&:hover': { bgcolor: colors.primaryDark },
                            boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
                          }}
                        >
                          <Camera size={16} />
                        </IconButton>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCropModalOpen(true)}
                        startIcon={<Camera size={14} />}
                        sx={{ borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                      </Button>
                      <Typography variant="caption" sx={{ color: colors.textMuted, textAlign: 'center' }}>
                        Tocá la foto para recortarla y ajustarla
                      </Typography>
                    </Box>
                  </Box>
                </SectionCard>

                <SectionCard elevation={0}>
                  <SectionHeader>
                    <FileText size={20} color={colors.primary} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Currículum (CV)</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                        Subí tu CV en formato PDF o Word. Los reclutadores podrán verlo al postularte.
                      </Typography>

                      {formData.cvURL ? (
                        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(colors.success, 0.04), border: `1px solid ${alpha(colors.success, 0.15)}` }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CheckCircle size={20} color={colors.success} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, truncate: true }}>{formData.cvName || 'CV subido'}</Typography>
                              <Typography variant="caption" sx={{ color: colors.textMuted }}>Disponible para postulaciones</Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                component="a"
                                href={formData.cvURL}
                                target="_blank"
                                size="small"
                                sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.primary, 0.06), color: colors.primary, '&:hover': { bgcolor: alpha(colors.primary, 0.12) } }}
                              >
                                <Download size={14} />
                              </IconButton>
                              <IconButton
                                onClick={handleRemoveCv}
                                size="small"
                                sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.danger, 0.06), color: colors.danger, '&:hover': { bgcolor: alpha(colors.danger, 0.12) } }}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      ) : null}

                      {cvUploading ? (
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>Subiendo CV...</Typography>
                            <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>{cvProgress}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={cvProgress}
                            sx={{ height: 4, borderRadius: 2, bgcolor: alpha(colors.primary, 0.1), '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` } }}
                          />
                        </Box>
                      ) : (
                        <Box component="label" sx={{ display: 'block', cursor: 'pointer' }}>
                          <input type="file" hidden accept=".pdf,.docx,.doc" onChange={handleCvFileSelect} />
                          <UploadZone hasfile={!!formData.cvURL}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: formData.cvURL ? alpha(colors.success, 0.1) : alpha(colors.primary, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {formData.cvURL ? <CheckCircle size={20} color={colors.success} /> : <Upload size={20} color={colors.primary} />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: formData.cvURL ? colors.success : colors.textPrimary }}>
                                {formData.cvURL ? 'Actualizar CV' : 'Subir currículum'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.25 }}>
                                PDF o Word — Máximo 10MB
                              </Typography>
                            </Box>
                          </UploadZone>
                        </Box>
                      )}

                      {formData.cvURL && (
                        <Alert
                          icon={<Info size={16} />}
                          severity="info"
                          sx={{ borderRadius: '10px', py: 0.75, '& .MuiAlert-icon': { alignItems: 'center', py: 0.75 }, bgcolor: alpha(colors.primary, 0.04), border: `1px solid ${alpha(colors.primary, 0.1)}` }}
                        >
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Este CV se usará automáticamente al postularte a una publicación
                          </Typography>
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                </SectionCard>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <SectionCard elevation={0}>
                  <SectionHeader gradient>
                    <User size={20} color="#fff" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>Datos Personales</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Nombre Completo" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField fullWidth label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Ej: 541123456789"
                          InputProps={{ startAdornment: <InputAdornment position="start"><MessageCircle size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </SectionCard>

                <SectionCard elevation={0}>
                  <SectionHeader gradient>
                    <Briefcase size={20} color="#fff" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>Experiencia y Formación</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <StyledTextField fullWidth label="Experiencia Profesional" name="experiencia" value={formData.experiencia} onChange={handleChange} multiline rows={4} required
                          InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><Briefcase size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField fullWidth label="Formación Académica" name="formacion" value={formData.formacion} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><School size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField fullWidth label="Sobre Mí" name="sobreMi" value={formData.sobreMi} onChange={handleChange} multiline rows={3} placeholder="Contanos sobre vos, tu enfoque de trabajo..."
                          InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><Heart size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </SectionCard>

                <SectionCard elevation={0}>
                  <SectionHeader gradient>
                    <MapPin size={20} color="#fff" />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>Ubicación</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Localidad" name="localidad" value={formData.localidad} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Zona" name="zona" value={formData.zona} onChange={handleChange} required
                          InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth label="Preferencia Laboral" name="preferenciaLaboral" value={formData.preferenciaLaboral} onChange={handleChange}
                          InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={18} color={colors.textMuted} /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField fullWidth select label="Estado" name="estado" value={formData.estado} onChange={handleChange} required>
                          <MenuItem value="Disponible">Disponible</MenuItem>
                          <MenuItem value="Consultar">Consultar</MenuItem>
                          <MenuItem value="No Disponible">No Disponible</MenuItem>
                        </StyledTextField>
                      </Grid>
                    </Grid>
                  </Box>
                </SectionCard>

                <SectionCard elevation={0} sx={{
                  border: `1px solid ${alpha(colors.warning, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(colors.warning, 0.02)} 0%, ${alpha(colors.surface, 1)} 100%)`,
                }}>
                  <SectionHeader sx={{ background: alpha(colors.warning, 0.06) }}>
                    <Smartphone size={20} color={colors.warning} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary }}>Contacto para Reclutadores</Typography>
                  </SectionHeader>
                  <Box sx={{ p: 3 }}>
                    <Alert
                      icon={<Info size={16} />}
                      severity="warning"
                      sx={{
                        mb: 2.5, borderRadius: '12px',
                        bgcolor: alpha(colors.warning, 0.06),
                        border: `1px solid ${alpha(colors.warning, 0.15)}`,
                        '& .MuiAlert-icon': { alignItems: 'center', color: colors.warning },
                      }}
                    >
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                        Estos datos los verá el reclutador para que se comunique con vos
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                          <Stack spacing={1.5} alignItems="center" direction="row">
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <MessageCircle size={18} color={colors.primary} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                                {formData.whatsapp || 'No especificado'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                          <Stack spacing={1.5} alignItems="center" direction="row">
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Phone size={18} color={colors.primary} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                                {formData.telefono || 'No especificado'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: alpha(colors.surfaceSecondary, 0.8), border: `1px solid ${colors.border}` }}>
                          <Stack spacing={1.5} alignItems="center" direction="row">
                            <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Mail size={18} color={colors.primary} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                                {formData.email || 'No especificado'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </SectionCard>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => navigate('/perfilLaboralUpdate')}>
                    Cancelar
                  </Button>
                  <Button variant="contained" type="submit" startIcon={<Save size={18} />} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </FormContainer>
      </form>
    </Box>
  );
};

export default EditarPerfilLaboral;
