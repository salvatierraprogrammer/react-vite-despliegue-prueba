import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase
import { doc, getDoc } from 'firebase/firestore';
import CircularProgress from '@mui/material/CircularProgress';
import { Container, Typography, TextField, Button, Card, CardContent, Alert, Box } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Muestra el spinner al comenzar el inicio de sesión
    try {
      // Iniciar sesión con el correo y la contraseña proporcionados
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener la información del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRol = userData.userRol;

        // Redirigir al usuario según su rol
        if (userRol === 'reclutador') {
          navigate('/buscar-acompanante');
        } else if (userRol === 'empleado') {
          navigate('/buscar-trabajo');
        } else if (userRol === 'administrador') {
          navigate('/admin');
        } else {
          navigate('/'); // Redirige a una página predeterminada si el rol no es reconocido
        }
        setIsAuthenticated(true); // Marca al usuario como autenticado
      } else {
        setError('No se encontró la información del usuario.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Oculta el spinner después de procesar el inicio de sesión
    }
  };

  useEffect(() => {
    // Verificar si el usuario ya está autenticado al cargar el componente
    const checkAuth = () => {
      const user = auth.currentUser;
      if (user) {
        const fetchUserRole = async () => {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRol = userData.userRol;
            if (userRol === 'reclutador') {
              navigate('/buscar-acompanante');
            } else if (userRol === 'empleado') {
              navigate('/buscar-trabajo');
            } else if (userRol === 'administrador') {
              navigate('/admin');
            } else {
              navigate('/'); // Redirige a una página predeterminada si el rol no es reconocido
            }
          }
        };
        fetchUserRole();
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <Container
        maxWidth="sm"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Container>
    ); // Muestra el spinner mientras se redirige
  }

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh',background: '#F3F3F3', backgroundColor: '#F3F3F3', color: '#504683'}}>

      <Card sx={{ background: 'background: linear-gradient(90deg, rgba(64,17,107,1) 0%, rgba(120,46,204,1) 26%, rgba(192,180,208,1) 100%)' }}>
      <Typography className='text-black' sx={{marginTop: 5,}}variant="h4" align="center" gutterBottom>
        Iniciar Sesión
      </Typography>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                label="Correo Electrónico"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box mb={2}>
              <TextField
                label="Contraseña"
                variant="outlined"
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Iniciar Sesión
            </Button>
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                ¿No tienes cuenta?{' '}
                <Link to="/crearCuenta">
                  Crear Cuenta
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;