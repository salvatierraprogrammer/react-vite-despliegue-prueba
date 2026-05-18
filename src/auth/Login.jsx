import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowForward,
  Favorite,
  Work,
  People,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { colors } from '../theme/theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRol = userData.userRol;
        if (userRol === 'reclutador' || userRol === 'empleado') {
          navigate('/dashboard');
        } else if (userRol === 'administrador') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
        setIsAuthenticated(true);
      } else {
        setError('No se encontró la información del usuario.');
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('Usuario no encontrado. Verifica tu correo electrónico.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Intenta nuevamente.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Correo electrónico inválido.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRol = userData.userRol;
          if (userRol === 'reclutador' || userRol === 'empleado' || userRol === 'administrador' || userRol === 'familiar') {
            navigate('/dashboard');
          }
        }
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.background} 0%, ${alpha(colors.primary, 0.1)} 100%)`,
        }}
      >
        <CircularProgress size={50} sx={{ color: colors.primary }} />
      </Box>
    );
  }

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
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '150%',
            height: '150%',
            background: `radial-gradient(circle at 20% 80%, ${alpha('#fff', 0.15)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${alpha('#fff', 0.1)} 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, ${alpha('#fff', 0.08)} 0%, transparent 60%)`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', px: 6 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                backgroundColor: alpha('#fff', 0.2),
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${alpha('#000', 0.2)}`,
              }}
            >
              <Favorite sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            El Canal del AT
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
            Conectando acompañantes terapéuticos con quienes más lo necesitan
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<People sx={{ fontSize: 18 }} />}
              label="Reclutadores"
              sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 500 }}
            />
            <Chip
              icon={<Work sx={{ fontSize: 18 }} />}
              label="Acompañantes AT"
              sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 500 }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
          backgroundColor: colors.background,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{ color: colors.textPrimary, fontWeight: 700, mb: 1 }}
            >
              ¡Bienvenido de nuevo!
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Ingresa tus credenciales para continuar
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '20px',
              border: `1px solid ${colors.border}`,
              bgcolor: colors.surface,
            }}
          >
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: colors.textSecondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: colors.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: colors.textSecondary }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: '12px',
                    '& .MuiAlert-message': { width: '100%' },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 2,
                  fontSize: '1rem',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
                endIcon={<ArrowForward />}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="textSecondary">
                  ¿No tienes cuenta?
                </Typography>
              </Divider>

              <Button
                component={Link}
                to="/crearCuenta"
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  '&:hover': {
                    borderColor: colors.primary,
                    bgcolor: alpha(colors.primary, 0.04),
                  },
                }}
              >
                Crear una cuenta
              </Button>
            </form>
          </Paper>

          <Typography
            variant="body2"
            sx={{ mt: 3, textAlign: 'center', color: colors.textSecondary }}
          >
            Al iniciar sesión, aceptas nuestros{' '}
            <Box component="span" sx={{ color: colors.primary, cursor: 'pointer' }}>
              Términos de Servicio
            </Box>{' '}
            y{' '}
            <Box component="span" sx={{ color: colors.primary, cursor: 'pointer' }}>
              Política de Privacidad
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
