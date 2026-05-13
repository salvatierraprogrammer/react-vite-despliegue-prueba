import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Badge,
  Lock,
  ArrowBack,
  ArrowForward,
  Check,
  Favorite,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { colors } from '../theme/theme';

const steps = ['Datos personales', 'Contacto', 'Cuenta'];

const CrearCuenta = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userRol, setUserRol] = useState('empleado');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!nombre.trim()) { setError('Ingresa tu nombre.'); return; }
      if (!apellido.trim()) { setError('Ingresa tu apellido.'); return; }
      if (dni.length < 7) { setError('El DNI debe tener al menos 7 caracteres.'); return; }
    }
    if (activeStep === 1) {
      if (phoneNumber.length < 10) { setError('El teléfono debe tener al menos 10 caracteres.'); return; }
    }
    if (activeStep === 2) {
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Ingresa un correo electrónico válido.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre,
        apellido,
        dni,
        phoneNumber,
        userRol,
        userId: user.uid,
        email,
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2WjS_hXJ9gKTPO0DP2wQa9ho1mxaq2aynxQ&s',
        estado: 'activo',
      });
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (error.code === 'auth/weak-password') {
        setError('La contraseña es muy débil.');
      } else {
        setError('Error al crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: colors.textPrimary }}>
              Datos personales
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
              Ingresa tu información básica
            </Typography>
            <TextField
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Badge sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: colors.textPrimary }}>
              Información de contacto
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
              ¿Cómo podemos comunicarnos contigo?
            </Typography>
            <TextField
              fullWidth
              label="Teléfono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: colors.textPrimary }}>
              Configura tu cuenta
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
              Elige tu rol y crea una contraseña segura
            </Typography>
            <TextField
              fullWidth
              select
              label="Tipo de cuenta"
              value={userRol}
              onChange={(e) => setUserRol(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="empleado">Acompañante Terapeutico</MenuItem>
              <MenuItem value="reclutador">Reclutador</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: colors.textSecondary }} /></InputAdornment>,
                endAdornment: <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: colors.textSecondary }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: colors.textSecondary }} /></InputAdornment>,
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: colors.background,
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flex: 1,
          background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.primaryDark} 100%)`,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '150%',
            height: '150%',
            background: `radial-gradient(circle at 30% 70%, ${alpha('#fff', 0.12)} 0%, transparent 50%),
                        radial-gradient(circle at 70% 30%, ${alpha('#fff', 0.1)} 0%, transparent 50%)`,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', px: 6 }}>
          <Box sx={{
            width: 100, height: 100, borderRadius: '28px',
            backgroundColor: alpha('#fff', 0.15), backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 4, boxShadow: `0 8px 32px ${alpha('#000', 0.15)}`,
          }}>
            <Favorite sx={{ fontSize: 50, color: 'white' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Únete a la comunidad
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 400, mx: 'auto' }}>
            Conecta con oportunidades que transforman vidas
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
              bgcolor: colors.surface,
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleRegister}>
              {renderStepContent()}

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    sx={{ flex: 1 }}
                  >
                    Atrás
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{ flex: 1 }}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
                    sx={{ flex: 1 }}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                )}
              </Box>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="textSecondary">
                ¿Ya tienes cuenta?
              </Typography>
            </Divider>

            <Button
              component={Link}
              to="/login"
              variant="outlined"
              fullWidth
              sx={{
                borderColor: colors.border,
                color: colors.textPrimary,
                '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.04) },
              }}
            >
              Iniciar Sesión
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default CrearCuenta;
