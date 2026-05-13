import React, { useState, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Button,
  TextField, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Chip, alpha, Stepper, Step,
  StepLabel, LinearProgress, IconButton, Tooltip,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  User, Phone, Mail, FileText, MapPin, Briefcase,
  Upload, Image as ImageIcon, Sparkles, Check,
  GraduationCap, Heart, DollarSign, Globe,
  ChevronRight, ChevronLeft, Camera, CloudUpload,
  FileCheck, AlertCircle, Star
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const FormContainer = styled(Box)({
  maxWidth: 800,
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
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.primary,
  },
});

const ImageUploadArea = styled(Box, { shouldForwardProp: (prop) => prop !== 'hasImage' })(({ hasImage }) => ({
  width: '100%',
  height: 200,
  borderRadius: '20px',
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
    '& .upload-overlay': {
      opacity: 1,
    },
  },
}));

const PreviewAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  border: `4px solid ${colors.surface}`,
  boxShadow: `0 8px 24px ${alpha(colors.primary, 0.2)}`,
});

const StepCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'active' })(({ active }) => ({
  padding: 24,
  borderRadius: '20px',
  border: `1px solid ${active ? colors.primary : colors.border}`,
  backgroundColor: active ? alpha(colors.primary, 0.02) : colors.surface,
  transition: 'all 0.3s ease',
}));

const OptionChip = styled(Chip)(({ selected }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  backgroundColor: selected ? alpha(colors.primary, 0.1) : 'transparent',
  color: selected ? colors.primary : colors.textSecondary,
  border: `1.5px solid ${selected ? colors.primary : colors.border}`,
  '&:hover': {
    backgroundColor: selected ? alpha(colors.primary, 0.15) : alpha(colors.primary, 0.05),
  },
}));

const CrearPerfilLaboral = () => {
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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

  const steps = [
    { label: 'Datos Personales', icon: User },
    { label: 'Experiencia', icon: Briefcase },
    { label: 'Ubicación', icon: MapPin },
    { label: 'Tu Foto', icon: Camera },
  ];

  const zonas = ['Zona Sur', 'CABA', 'Zona Norte', 'Zona Oeste'];

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
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        MySwal.fire({
          title: 'Error',
          text: 'Debes iniciar sesión para crear tu perfil.',
          icon: 'error',
          confirmButtonColor: colors.primary,
        });
        return;
      }

      const updatedFormData = { ...formData, userId: user.uid };
      await setDoc(doc(db, 'perfilLaboral', user.uid), updatedFormData);

      await MySwal.fire({
        title: '¡Perfil creado!',
        text: 'Tu perfil laboral ha sido creado exitosamente.',
        icon: 'success',
        confirmButtonColor: colors.success,
        background: colors.surface,
      });

      navigate('/perfilLaboralUpdate');
    } catch (error) {
      console.error('Error creating profile:', error);
      MySwal.fire({
        title: 'Error',
        text: 'No se pudo crear el perfil. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: colors.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return formData.nombreCompleto && formData.telefono && formData.email;
      case 1:
        return formData.experiencia && formData.formacion;
      case 2:
        return formData.localidad && formData.zona;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Crear Perfil Laboral
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Completa tu información para que los reclutadores puedan encontrarte
        </Typography>
      </Box>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 4,
          '& .MuiStepLabel-root': { cursor: 'pointer' },
          '& .MuiStepIcon-root': {
            width: 40,
            height: 40,
            '&.Mui-active': {
              color: colors.primary,
            },
            '&.Mui-completed': {
              color: colors.success,
            },
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.label} onClick={() => setActiveStep(index)}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: completed ? alpha(colors.success, 0.1) : 
                              active ? alpha(colors.primary, 0.1) : 
                              colors.surfaceSecondary,
                    color: completed ? colors.success : 
                           active ? colors.primary : 
                           colors.textMuted,
                  }}
                >
                  {completed ? <Check size={20} /> : <step.icon size={20} />}
                </Box>
              )}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        <FormContainer>
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StepCard active elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Datos Personales
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
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
                              <User size={20} color={colors.textMuted} />
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
                              <Phone size={20} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                              <Mail size={20} color={colors.textMuted} />
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
                        placeholder="Cuéntanos sobre ti, tu motivación y qué te diferencia como acompañante..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <Heart size={20} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </StepCard>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StepCard active elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Experiencia y Formación
                  </Typography>
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
                        placeholder="Describe tu experiencia trabajando como Acompañante Terapéutico..."
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                              <Briefcase size={20} color={colors.textMuted} />
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
                        placeholder="Ej: Diplomatura en Acompañante Terapéutico - UNRaf"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GraduationCap size={20} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Preferencia Laboral</InputLabel>
                        <Select
                          name="preferenciaLaboral"
                          value={formData.preferenciaLaboral}
                          onChange={handleChange}
                          label="Preferencia Laboral"
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="Tiempo completo">Tiempo completo</MenuItem>
                          <MenuItem value="Medio tiempo">Medio tiempo</MenuItem>
                          <MenuItem value="Por horas">Por horas</MenuItem>
                          <MenuItem value="Fines de semana">Fines de semana</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          name="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          label="Estado"
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="Disponible">Disponible</MenuItem>
                          <MenuItem value="Consultar">Consultar</MenuItem>
                          <MenuItem value="No Disponible">No Disponible</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </StepCard>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StepCard active elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Ubicación y Zona
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Localidad"
                        name="localidad"
                        value={formData.localidad}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Lanús, Flores, Vicente López..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={20} color={colors.textMuted} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Zona</InputLabel>
                        <Select
                          name="zona"
                          value={formData.zona}
                          onChange={handleChange}
                          label="Zona"
                          required
                          sx={{ borderRadius: '12px' }}
                        >
                          {zonas.map((zona) => (
                            <MenuItem key={zona} value={zona}>{zona}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </StepCard>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StepCard active elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Tu Foto de Perfil
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {imagePreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <PreviewAvatar src={imagePreview} alt="Preview" />
                        <IconButton
                          component="label"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: colors.primary,
                            color: '#fff',
                            '&:hover': { bgcolor: colors.primaryDark },
                          }}
                        >
                          <Camera size={20} />
                          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </IconButton>
                      </Box>
                    ) : (
                      <ImageUploadArea
                        component="label"
                        hasImage={!!imagePreview}
                      >
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <Box
                          className="upload-overlay"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: alpha(colors.primary, 0.9),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            borderRadius: '18px',
                          }}
                        >
                          <CloudUpload size={48} color="#fff" />
                          <Typography variant="body1" sx={{ color: '#fff', mt: 1, fontWeight: 600 }}>
                            Subir imagen
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: alpha(colors.primary, 0.1),
                          }}
                        >
                          <ImageIcon size={36} color={colors.primary} />
                        </Avatar>
                        <Typography variant="body1" sx={{ mt: 2, color: colors.textSecondary }}>
                          Haz clic o arrastra tu foto aquí
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>
                          PNG, JPG hasta 5MB
                        </Typography>
                      </ImageUploadArea>
                    )}

                    <TextField
                      fullWidth
                      label="O ingresa URL de tu imagen"
                      name="images"
                      value={formData.images}
                      onChange={handleChange}
                      placeholder="https://..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Globe size={20} color={colors.textMuted} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </StepCard>
              </motion.div>
            )}
          </AnimatePresence>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeft size={18} />}
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Anterior
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ChevronRight size={18} />}
                onClick={handleNext}
                disabled={!isStepComplete(activeStep)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                type="submit"
                startIcon={<Sparkles size={18} />}
              >
                Crear Perfil
              </Button>
            )}
          </Box>
        </FormContainer>
      </form>
    </Box>
  );
};

const AnimatePresence = ({ children }) => (
  <Fade in timeout={300}>
    {children}
  </Fade>
);

export default CrearPerfilLaboral;
