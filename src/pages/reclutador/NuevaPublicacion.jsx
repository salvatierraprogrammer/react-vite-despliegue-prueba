import React, { useState, useEffect, useCallback, memo } from 'react';
import { Box, Grid, Typography, Paper, TextField, Button, Avatar, Step, StepLabel, MenuItem, Chip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import { generarSlugCompleto, generarShortId } from '../../utils/slugUtils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  ArrowLeft, ArrowRight, Check, User, MapPin, Stethoscope,
  Phone, Mail, Sparkles, X, Building2, ChevronLeft
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const StyledPaper = styled(Paper)({
  borderRadius: '24px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
});

const SectionCard = styled(Paper)({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surfaceSecondary || alpha(colors.background, 0.5),
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    backgroundColor: colors.surface,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: '0.8125rem',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.primary,
  },
});

const StepDot = styled(Box)(({ active, completed, color }) => ({
  width: completed ? 28 : active ? 32 : 28,
  height: completed ? 28 : active ? 32 : 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed ? color : active ? alpha(color, 0.12) : alpha(colors.border, 0.5),
  color: completed ? '#fff' : active ? color : colors.textMuted,
  fontWeight: 700,
  fontSize: completed ? '0.75rem' : '0.8125rem',
  transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  boxShadow: active ? `0 0 0 4px ${alpha(color, 0.15)}` : 'none',
  cursor: 'pointer',
}));

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const FormInput = memo(({ label, name, value, onChange, type = 'text', required, options, multiline, rows, icon: Icon }) => (
  <StyledTextField
    fullWidth
    label={label}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    select={!!options}
    multiline={multiline}
    rows={rows}
    size="small"
    InputProps={Icon ? {
      startAdornment: (
        <Box sx={{ mr: 0.75, display: 'flex', color: alpha(colors.primary, 0.4) }}>
          <Icon size={16} />
        </Box>
      ),
    } : undefined}
  >
    {options?.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}
  </StyledTextField>
));

const NuevaPublicacion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0);
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

          if (data.userRol !== 'reclutador' && data.userRol !== 'administrador' && data.userRol !== 'familiar') {
            navigate('/');
            return;
          }

          if (data.userRol === 'reclutador' && (!data.nombreEntidad || !data.emailLaboral || !data.whatsapp)) {
            navigate('/miCuenta');
            return;
          }

          if (data.userRol === 'familiar' && (!data.nombreEntidad || !data.phoneNumber)) {
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
    setDirection(1);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setActiveStep(prev => prev - 1);
  };

  const generarCodigoUnico = useCallback(async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const num = Math.floor(10000 + Math.random() * 90000);
      const codigo = `CAS-${num}`;
      const existente = await getDocs(query(
        collection(db, 'publicaciones'),
        where('codigo', '==', codigo)
      ));
      if (existente.empty) return codigo;
    }
    return `CAS-${Date.now().toString().slice(-5)}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !userData) return;

    try {
      const extraFields = {};
      if (userData.userRol === 'familiar') {
        extraFields.codigo = await generarCodigoUnico();
      }

      const newPublication = {
        ...formData,
        ...extraFields,
        userId: user.uid,
        cliente: userData.nombreEntidad,
        photo: userData.photo || 'https://revistapublicando.org/revista/public/site/images/jaroch/20943528.jpg',
        estado: 'Disponible',
        fechaCreacion: new Date(),
      };

      const docRef = await addDoc(collection(db, 'publicaciones'), newPublication);
      const slug = generarSlugCompleto(formData.paciente, formData.localidad, docRef.id);
      await updateDoc(docRef, { slug, shortId: generarShortId(docRef.id) });

      MySwal.fire({
        icon: 'success',
        title: '¡Publicado!',
        text: extraFields.codigo
          ? `Caso publicado con código ${extraFields.codigo}`
          : 'Tu publicación ha sido creada exitosamente.',
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

  const progressPercent = ((activeStep) / (steps.length - 1)) * 100;

  if (loading) return <LoadingPage />;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Button
            startIcon={<ChevronLeft size={18} />}
            onClick={() => navigate(-1)}
            sx={{
              minWidth: 0, px: 1.5, py: 0.8, borderRadius: '10px',
              color: colors.textSecondary, fontWeight: 600, fontSize: '0.8125rem',
              '&:hover': { bgcolor: alpha(colors.primary, 0.04), color: colors.primary },
            }}
          >
            Volver
          </Button>
          <Box sx={{ flex: 1 }} />
        </Box>

        <StyledPaper>
          {/* Title section */}
          <Box sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderBottom: `1px solid ${colors.border}`,
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.02)} 0%, ${alpha(colors.secondary, 0.02)} 100%)`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: alpha(colors.primary, 0.08),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.primary,
              }}>
                <Sparkles size={22} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{
                  fontWeight: 700, color: colors.textPrimary,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  letterSpacing: '-0.02em', lineHeight: 1.2,
                }}>
                  Nueva Publicación
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.3, fontSize: '0.8125rem' }}>
                  Completá los datos del caso para encontrar al acompañante ideal
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Stepper */}
          <Box sx={{
            px: { xs: 2.5, sm: 3.5 },
            pt: { xs: 2.5, sm: 3 },
            pb: { xs: 2, sm: 2.5 },
            borderBottom: `1px solid ${colors.border}`,
          }}>
            {/* Desktop stepper */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                {steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const isCompleted = activeStep > index;
                  return (
                    <Box
                      key={step.label}
                      onClick={() => { if (isCompleted || index <= activeStep) { setDirection(index > activeStep ? 1 : -1); setActiveStep(index); } }}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: isCompleted || index <= activeStep ? 'pointer' : 'default', flex: 1, position: 'relative' }}
                    >
                      <StepDot active={isActive} completed={isCompleted} color={step.color}>
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
                      </StepDot>
                      <Typography variant="caption" sx={{
                        fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                        color: isActive ? colors.textPrimary : isCompleted ? colors.textPrimary : colors.textMuted,
                        fontSize: '0.75rem', whiteSpace: 'nowrap',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}>
                        {step.label}
                      </Typography>
                      {index < steps.length - 1 && (
                        <Box sx={{
                          flex: 1, height: 2, mx: 1.5,
                          borderRadius: '1px',
                          bgcolor: isCompleted ? step.color : alpha(colors.border, 0.6),
                          transition: 'background 0.3s ease',
                        }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Mobile progress */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.75rem' }}>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
                  {activeStep + 1} / {steps.length}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', height: 4, borderRadius: '2px', bgcolor: alpha(colors.border, 0.6), overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%', borderRadius: '2px',
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                  transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                {steps.map((step, index) => (
                  <Box
                    key={step.label}
                    onClick={() => { if (index <= activeStep) { setDirection(index > activeStep ? 1 : -1); setActiveStep(index); } }}
                    sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: index === activeStep ? step.color : index < activeStep ? alpha(step.color, 0.4) : alpha(colors.border, 0.4),
                      cursor: index <= activeStep ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      transform: index === activeStep ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Form content */}
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {activeStep === 0 && (
                  <SectionCard elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color={colors.primary} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.textPrimary }}>
                        Datos del Paciente
                      </Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Nombre del Caso / Nº" name="paciente" value={formData.paciente} onChange={handleChange} required icon={User} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Edad del Paciente" name="edad" value={formData.edad} onChange={handleChange} required type="number" />
                      </Grid>
                      <Grid item xs={12}>
                        <FormInput
                          label="Género del Paciente" name="sexo" value={formData.sexo} onChange={handleChange} required
                          options={[
                            { value: 'Masculino', label: 'Masculino' },
                            { value: 'Femenino', label: 'Femenino' },
                            { value: 'No binario', label: 'No binario' },
                            { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
                          ]}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                )}

                {activeStep === 1 && (
                  <SectionCard elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.secondary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={16} color={colors.secondary} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.textPrimary }}>
                        Ubicación
                      </Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Localidad / Barrio" name="localidad" value={formData.localidad} onChange={handleChange} required icon={MapPin} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          label="Zona" name="zona" value={formData.zona} onChange={handleChange} required
                          options={[
                            { value: 'CABA', label: 'CABA' },
                            { value: 'Zona Sur', label: 'Zona Sur' },
                            { value: 'Zona Norte', label: 'Zona Norte' },
                            { value: 'Zona Oeste', label: 'Zona Oeste' },
                          ]}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                )}

                {activeStep === 2 && (
                  <SectionCard elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={16} color={colors.success} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.textPrimary }}>
                        Detalles del Caso
                      </Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Diagnóstico / Condición" name="diagnostico" value={formData.diagnostico} onChange={handleChange} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput
                          label="Género de AT Preferido" name="generoAt" value={formData.generoAt} onChange={handleChange} required
                          options={[
                            { value: 'Indistinto', label: 'Indistinto' },
                            { value: 'Masculino', label: 'Masculino' },
                            { value: 'Femenino', label: 'Femenino' },
                          ]}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormInput label="Descripción del Caso" name="descripcion" value={formData.descripcion} onChange={handleChange} multiline rows={4} />
                      </Grid>
                    </Grid>
                  </SectionCard>
                )}

                {activeStep === 3 && (
                  <SectionCard elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.warning, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={16} color={colors.warning} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: colors.textPrimary }}>
                        Información de Contacto
                      </Typography>
                    </Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Teléfono de Contacto" name="telefono" value={formData.telefono} onChange={handleChange} required icon={Phone} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormInput label="Email de Contacto" name="email" value={formData.email} onChange={handleChange} required type="email" icon={Mail} />
                      </Grid>
                    </Grid>

                    {userData && (
                      <Box sx={{
                        mt: 3, p: 2.5, borderRadius: '12px',
                        bgcolor: alpha(colors.primary, 0.04),
                        border: `1px solid ${alpha(colors.primary, 0.1)}`,
                        display: 'flex', alignItems: 'center', gap: 2,
                      }}>
                        <Avatar src={userData.photo} sx={{ width: 48, height: 48, borderRadius: '12px' }}>
                          {userData.nombreEntidad?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                              {userData.nombreEntidad}
                            </Typography>
                            <Chip
                              icon={<Building2 size={12} />}
                              label="Reclutador"
                              size="small"
                              sx={{ height: 22, fontSize: '0.625rem', fontWeight: 600, borderRadius: '6px', bgcolor: alpha(colors.secondary, 0.1), color: colors.secondary, '& .MuiChip-icon': { fontSize: '0.625rem', ml: 0.4 } }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6875rem', mt: 0.2, display: 'block' }}>
                            Tu perfil se mostrará en la publicación
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </SectionCard>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Footer */}
          <Box sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: { xs: 2, sm: 2.5 },
            borderTop: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            bgcolor: alpha(colors.background, 0.3),
          }}>
            <Button
              onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
              startIcon={activeStep > 0 ? <ArrowLeft size={16} /> : undefined}
              sx={{
                borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem',
                color: colors.textSecondary, px: 2,
                '&:hover': { bgcolor: alpha(colors.primary, 0.04), color: colors.textPrimary },
              }}
            >
              {activeStep === 0 ? 'Cancelar' : 'Anterior'}
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', px: 3, py: 0.8,
                  boxShadow: `0 4px 12px ${alpha(colors.primary, 0.2)}`,
                  '&:hover': { boxShadow: `0 6px 20px ${alpha(colors.primary, 0.3)}` },
                }}
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                endIcon={<Check size={16} />}
                sx={{
                  borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', px: 3, py: 0.8,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  boxShadow: `0 4px 14px ${alpha(colors.primary, 0.25)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    boxShadow: `0 6px 22px ${alpha(colors.primary, 0.35)}`,
                  },
                }}
              >
                Publicar Caso
              </Button>
            )}
          </Box>
        </StyledPaper>
      </Box>
    </Box>
  );
};

export default NuevaPublicacion;