import React, { useState, useEffect, memo } from 'react';
import { Box, Grid, Typography, Paper, TextField, Button, Avatar, Stepper, Step, StepLabel, MenuItem, Select, FormControl, InputLabel, IconButton, InputAdornment, Chip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  MapPin,
  Stethoscope,
  FileText,
  Phone,
  Mail,
  Sparkles,
  Calendar,
  Heart,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: colors.textPrimary,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SectionIcon = styled(Box)(({ color }) => ({
  width: 36,
  height: 36,
  borderRadius: '10px',
  backgroundColor: alpha(color, 0.1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
}));

const FormTextField = styled(TextField)(({ theme }) => ({
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
}));

const StepIcon = styled(Box, { shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed' })(({ active, completed, color = colors.primary }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed ? color : active ? alpha(color, 0.1) : colors.gray[100],
  color: completed || active ? '#fff' : colors.textMuted,
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.3s ease',
}));

const FormInput = memo(({ label, name, value, onChange, type = 'text', required, options, multiline, rows }) => (
  <FormTextField
    fullWidth
    label={label}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    select={options && options.length > 0}
    multiline={multiline}
    rows={rows}
    size="small"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
      },
    }}
  >
    {options?.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}
  </FormTextField>
));

const NuevaPublicacion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    paciente: '',
    edad: '',
    sexo: '',
    localidad: '',
    zona: '',
    diagnostico: '',
    generoAt: '',
    descripcion: '',
    telefono: '',
    email: '',
  });

  const steps = [
    { label: 'Paciente', icon: User, color: colors.primary },
    { label: 'Ubicación', icon: MapPin, color: colors.secondary },
    { label: 'Detalles', icon: Stethoscope, color: colors.success },
    { label: 'Contacto', icon: Phone, color: colors.warning },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setFormData(prev => ({
            ...prev,
            telefono: data.whatsapp || '',
            email: data.emailLaboral || '',
          }));

          if (data.userRol !== 'reclutador' && data.userRol !== 'administrador') {
            navigate('/');
            return;
          }

          if (data.userRol === 'reclutador' && (!data.nombreEntidad || !data.emailLaboral || !data.whatsapp)) {
            navigate('/miCuenta');
            return;
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !userData) return;

    try {
      const newPublication = {
        ...formData,
        userId: user.uid,
        cliente: userData.nombreEntidad,
        photo: userData.photo || 'https://revistapublicando.org/revista/public/site/images/jaroch/20943528.jpg',
        estado: 'Disponible',
        fechaCreacion: new Date(),
      };

      await addDoc(collection(db, 'publicaciones'), newPublication);

      MySwal.fire({
        icon: 'success',
        title: '¡Publicado!',
        text: 'Tu publicación ha sido creada exitosamente.',
        confirmButtonColor: colors.primary,
      }).then(() => {
        navigate('/misPublicaciones');
      });
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la publicación. Intenta de nuevo.',
      });
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.paciente && formData.edad && formData.sexo;
      case 1:
        return formData.localidad && formData.zona;
      case 2:
        return formData.diagnostico && formData.generoAt;
      case 3:
        return formData.telefono && formData.email;
      default:
        return true;
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ maxWidth: 800, mx: 'auto' }}
    >
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: colors.textSecondary }}
      >
        Volver
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '24px',
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface,
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 1, letterSpacing: '-0.02em' }}>
            Nueva Publicación
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Completa los datos del caso para encontrar al acompañante ideal
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label} completed={activeStep > index}>
              <StepLabel
                StepIconComponent={() => (
                  <StepIcon active={activeStep === index} completed={activeStep > index} color={step.color}>
                    {activeStep > index ? <Check size={16} /> : index + 1}
                  </StepIcon>
                )}
              >
                <Typography variant="caption" sx={{ fontWeight: activeStep === index ? 600 : 400, color: activeStep === index ? colors.textPrimary : colors.textSecondary }}>
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {activeStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection>
                <SectionTitle>
                  <SectionIcon color={colors.primary}><User size={18} /></SectionIcon>
                  Datos del Paciente
                </SectionTitle>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Nombre del Caso / Nº"
                      name="paciente"
                      value={formData.paciente}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Edad del Paciente"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormInput
                      label="Género del Paciente"
                      name="sexo"
                      value={formData.sexo}
                      onChange={handleChange}
                      required
                      options={[
                        { value: 'Masculino', label: 'Masculino' },
                        { value: 'Femenino', label: 'Femenino' },
                        { value: 'No binario', label: 'No binario' },
                        { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
                      ]}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection>
                <SectionTitle>
                  <SectionIcon color={colors.secondary}><MapPin size={18} /></SectionIcon>
                  Ubicación
                </SectionTitle>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Localidad / Barrio"
                      name="localidad"
                      value={formData.localidad}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Zona"
                      name="zona"
                      value={formData.zona}
                      onChange={handleChange}
                      required
                      options={[
                        { value: 'CABA', label: 'CABA' },
                        { value: 'Zona Sur', label: 'Zona Sur' },
                        { value: 'Zona Norte', label: 'Zona Norte' },
                        { value: 'Zona Oeste', label: 'Zona Oeste' },
                      ]}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection>
                <SectionTitle>
                  <SectionIcon color={colors.success}><Stethoscope size={18} /></SectionIcon>
                  Detalles del Caso
                </SectionTitle>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Diagnóstico / Condición"
                      name="diagnostico"
                      value={formData.diagnostico}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Género de AT Preferido"
                      name="generoAt"
                      value={formData.generoAt}
                      onChange={handleChange}
                      required
                      options={[
                        { value: 'Indistinto', label: 'Indistinto' },
                        { value: 'Masculino', label: 'Masculino' },
                        { value: 'Femenino', label: 'Femenino' },
                      ]}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormInput
                      label="Descripción del Caso"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection>
                <SectionTitle>
                  <SectionIcon color={colors.warning}><Phone size={18} /></SectionIcon>
                  Información de Contacto
                </SectionTitle>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Teléfono de Contacto"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      label="Email de Contacto"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      type="email"
                    />
                  </Grid>
                </Grid>
              </FormSection>

              {userData && (
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: alpha(colors.primary, 0.04),
                    border: `1px solid ${alpha(colors.primary, 0.1)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar src={userData.photo} sx={{ width: 56, height: 56, borderRadius: '14px' }}>
                    {userData.nombreEntidad?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {userData.nombreEntidad}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Tu perfil será mostrado en la publicación
                    </Typography>
                  </Box>
                  <Chip label="Editando como Reclutador" size="small" sx={{ bgcolor: alpha(colors.secondary, 0.1), color: colors.secondary }} />
                </Box>
              )}
            </motion.div>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
            startIcon={activeStep === 0 ? <ArrowLeft size={16} /> : undefined}
            sx={{ color: colors.textSecondary }}
          >
            {activeStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
              endIcon={<ArrowRight size={16} />}
              sx={{ borderRadius: '12px' }}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<Check size={16} />}
              sx={{
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.secondary} 100%)`,
                },
              }}
            >
              Publicar Caso
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default NuevaPublicacion;