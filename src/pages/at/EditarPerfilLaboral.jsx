import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, MenuItem, InputAdornment, IconButton, Divider, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  User, Phone, Mail, School, Briefcase, MapPin, Image as ImageIcon,
  Globe, Edit, Save, ChevronLeft, Camera, CloudUpload,
  CheckCircle, AlertCircle, Sparkles, Eye, EyeOff, Heart
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

const ImageUploadArea = styled(Box, { shouldForwardProp: (prop) => prop !== 'hasImage' })(({ hasImage }) => ({
  width: '100%',
  height: 180,
  borderRadius: '16px',
  border: `2px dashed ${hasImage ? colors.success : colors.border}`,
  backgroundColor: hasImage ? alpha(colors.success, 0.05) : colors.surfaceSecondary,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
    '& .upload-overlay': { opacity: 1 },
  },
}));

const ProfileAvatar = styled(Avatar, { shouldForwardProp: (prop) => prop !== 'hasImage' })(({ hasImage }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${hasImage ? colors.success : colors.border}`,
  boxShadow: `0 8px 24px ${alpha(colors.primary, 0.15)}`,
  transition: 'all 0.3s ease',
}));

const EditarPerfilLaboral = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    experiencia: '',
    formacion: '',
    sobreMi: '',
    localidad: '',
    preferenciaLaboral: '',
    zona: '',
    images: '',
    estado: 'Disponible',
  });
  const [imagePreview, setImagePreview] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchPerfilData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilId = id || user.uid;
        const perfilDoc = doc(db, 'perfilLaboral', perfilId);
        const perfilSnapshot = await getDoc(perfilDoc);
        if (perfilSnapshot.exists()) {
          const data = perfilSnapshot.data();
          setFormData(data);
          setImagePreview(data.images || '');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, images: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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
        if (perfilSnap.exists()) {
          await updateDoc(perfilDoc, formData);
        } else {
          await setDoc(perfilDoc, formData);
        }

        await MySwal.fire({
          title: perfilSnap.exists() ? '¡Perfil actualizado!' : '¡Perfil creado!',
          text: perfilSnap.exists() ? 'Tus datos han sido actualizados correctamente.' : 'Tu perfil laboral ha sido creado correctamente.',
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
      await MySwal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el perfil. Intenta nuevamente.',
        icon: 'error',
      });
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Editar Perfil
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Actualiza tu información profesional
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ChevronLeft size={18} />}
          onClick={() => navigate('/perfilLaboralUpdate')}
        >
          Volver
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        <FormContainer>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <SectionCard elevation={0}>
                <SectionHeader>
                  <Camera size={20} color={colors.primary} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Foto de Perfil
                  </Typography>
                </SectionHeader>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {imagePreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <ProfileAvatar src={imagePreview} hasImage={!!imagePreview}>
                          {formData.nombreCompleto?.[0]}
                        </ProfileAvatar>
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: colors.primary,
                            color: '#fff',
                            width: 36,
                            height: 36,
                            '&:hover': { bgcolor: colors.primaryDark },
                          }}
                        >
                          <Camera size={16} />
                          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </IconButton>
                      </Box>
                    ) : (
                      <ImageUploadArea
                        component="label"
                        hasImage={!!imagePreview}
                      >
                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        <Box className="upload-overlay" sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: alpha(colors.primary, 0.9),
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          borderRadius: '14px',
                        }}>
                          <CloudUpload size={40} color="#fff" />
                          <Typography sx={{ color: '#fff', mt: 1, fontWeight: 600 }}>
                            Subir
                          </Typography>
                        </Box>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(colors.primary, 0.1) }}>
                          <ImageIcon size={28} color={colors.primary} />
                        </Avatar>
                        <Typography variant="body2" sx={{ mt: 2, color: colors.textSecondary }}>
                          Arrastra o haz clic
                        </Typography>
                      </ImageUploadArea>
                    )}

                    <TextField
                      fullWidth
                      label="URL de imagen"
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      placeholder="https://..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Globe size={18} color={colors.textMuted} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={8}>
              <SectionCard elevation={0}>
                <SectionHeader gradient>
                  <User size={20} color="#fff" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Datos Personales
                  </Typography>
                </SectionHeader>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Nombre Completo"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Sobre Mí"
                        name="sobreMi"
                        value={formData.sobreMi}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        placeholder="Cuéntanos sobre ti..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <Heart size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>

              <SectionCard elevation={0} sx={{ mt: 3 }}>
                <SectionHeader gradient>
                  <Briefcase size={20} color="#fff" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Experiencia y Formación
                  </Typography>
                </SectionHeader>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Experiencia Profesional"
                        name="experiencia"
                        value={formData.experiencia}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <Briefcase size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Formación Académica"
                        name="formacion"
                        value={formData.formacion}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <School size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>

              <SectionCard elevation={0} sx={{ mt: 3 }}>
                <SectionHeader gradient>
                  <MapPin size={20} color="#fff" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#fff' }}>
                    Ubicación
                  </Typography>
                </SectionHeader>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Localidad"
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Zona"
                        name="zona"
                        value={formData.zona}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Preferencia Laboral"
                        name="preferenciaLaboral"
                        value={formData.preferenciaLaboral}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Briefcase size={18} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        select
                        label="Estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                      >
                        <MenuItem value="Disponible">Disponible</MenuItem>
                        <MenuItem value="Consultar">Consultar</MenuItem>
                        <MenuItem value="No Disponible">No Disponible</MenuItem>
                      </StyledTextField>
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>

              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/perfilLaboralUpdate')}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<Save size={18} />}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </FormContainer>
      </form>
    </Box>
  );
};

export default EditarPerfilLaboral;
