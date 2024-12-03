import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { Link, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImageIcon from '@mui/icons-material/Image';
import PublicIcon from '@mui/icons-material/Public';

const EditarPerfilLaboral = () => {
  const [loading, setLoading] = useState(true);
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

  const navigate = useNavigate();

  const fetchPerfilData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        const perfilSnapshot = await getDoc(perfilDoc);
        if (perfilSnapshot.exists()) {
          const data = perfilSnapshot.data();
          setFormData(data);
        } else {
          setError('No se encontraron datos del perfil. Crea uno primero.');
          navigate('/crear-perfil-laboral');
        }
      } else {
        setError('Usuario no autenticado.');
        navigate('/login');
      }
    } catch (err) {
      setError('Error al cargar los datos del perfil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPerfilData();
  }, [fetchPerfilData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        await updateDoc(perfilDoc, formData);
        alert('Perfil actualizado con éxito.');
        navigate('/perfilLaboralUpdate');
      } else {
        setError('Usuario no autenticado.');
        navigate('/login');
      }
    } catch (err) {
      setError('Error al actualizar el perfil.');
      console.error(err);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
    

      {/* Imagen circular */}
      <Box display="flex" justifyContent="center" mb={4} sx={{marginTop: 10 }}>
        {formData.images ? (
          <Box
            component="img"
            src={formData.images}
            alt="Foto de perfil"
            sx={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: 3,
            }}
          />
        ) : (
          <Typography variant="subtitle1">No se ha proporcionado una imagen</Typography>
        )}
      </Box>
      <Typography variant="h4" align="center" sx={{ color: '#504683'}} gutterBottom>
        Actualizar Perfil Laboral
      </Typography>

      <Grid container spacing={2}>
        {/* Primera tarjeta */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#504683' }}>
                Información Personal
              </Typography>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Segunda tarjeta */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#504683' }}>
                Información Adicional
              </Typography>
              <TextField
                fullWidth
                label="Experiencia"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Formación"
                name="formacion"
                value={formData.formacion}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Sobre Mí"
                name="sobreMi"
                value={formData.sobreMi}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Tercera tarjeta */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#504683' }}>
                Información Extra
              </Typography>
              <TextField
                fullWidth
                label="Localidad"
                name="localidad"
                value={formData.localidad}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Preferencia Laboral"
                name="preferenciaLaboral"
                value={formData.preferenciaLaboral}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Zona"
                name="zona"
                value={formData.zona}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Imagen (URL)"
                name="images"
                value={formData.images}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                fullWidth
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="Disponible">Disponible</MenuItem>
                <MenuItem value="Consultar">Consultar</MenuItem>
                <MenuItem value="No Disponible">No Disponible</MenuItem>
              </Select>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} display="flex" justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
          Actualizar
        </Button>
        <Button variant="outlined" component={Link} to="/buscar-trabajo">
          Volver a inicio
        </Button>
      </Box>
    </Box>
  );
};

export default EditarPerfilLaboral;