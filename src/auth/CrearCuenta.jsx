import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfg/firebase'; // Asegúrate de importar correctamente tu configuración de Firebase y Firestore
import { doc, setDoc } from 'firebase/firestore';
import { Container, Typography, TextField, Button, Card, CardContent, Alert, Box, InputAdornment, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import FaceIcon from '@mui/icons-material/Face';
import LockIcon from '@mui/icons-material/Lock';

const CrearCuenta = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userRol, setUserRol] = useState('empleado'); // Valor por defecto
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            // Validaciones
            if (!nombre.trim()) {
                setError('Por favor, ingresa tu nombre.');
                return;
            }
            if (!apellido.trim()) {
                setError('Por favor, ingresa tu apellido.');
                return;
            }
            if (dni.length <= 7) {
                setError('El DNI debe tener más de 8 caracteres.');
                return;
            }
            if (phoneNumber.length <= 7) {
                setError('El número de teléfono debe tener más de 10 caracteres.');
                return;
            }
            const emailRegex = /^(?=.*[@])(?=.*[.]).*$/;
            const validEmailProviders = ['gmail.com', 'hotmail.com', 'yahoo.com'];
            const emailProvider = email.split('@')[1];
            if (!emailRegex.test(email) || !validEmailProviders.includes(emailProvider)) {
                setError('Ingresa un correo electrónico válido de Gmail, Hotmail o Yahoo.');
                return;
            }
            if (password.length <= 5) {
                setError('La contraseña debe tener al menos 7 caracteres.');
                return;
            }

            // Crear el usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guardar información adicional en Firestore
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
                // Puedes agregar más campos aquí si es necesario
            });

            // Navegar a la pantalla de inicio de sesión después del registro exitoso
            navigate('/login');
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            setError('Hubo un problema al crear el usuario. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
            
            <Card>
            <Typography className='text-black' sx={{marginTop: 5}} variant="h4" align="center" gutterBottom>
                Crear Cuenta
            </Typography>
                <CardContent>
                    <form onSubmit={handleRegister}>
                        <Box mb={2}>
                            <TextField
                                label="Nombre"
                                variant="outlined"
                                fullWidth
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaceIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Apellido"
                                variant="outlined"
                                fullWidth
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="DNI"
                                variant="outlined"
                                fullWidth
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Número de Teléfono"
                                variant="outlined"
                                fullWidth
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Correo Electrónico"
                                variant="outlined"
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                select
                                label="Selecciona un Rol"
                                variant="outlined"
                                fullWidth
                                value={userRol}
                                onChange={(e) => setUserRol(e.target.value)}
                                SelectProps={{
                                    native: true,
                                }}
                            >
                                <option value="empleado">Acompañante Terapeútico</option>
                                <option value="reclutador">Reclutador</option>
                            </TextField>
                        </Box>
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Crear Cuenta
                        </Button>
                        <Box mt={2} textAlign="center">
                            <Typography variant="body2">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login">
                                    Iniciar Sesión
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};

export default CrearCuenta;