import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Cargando from './Cargando';
import { Container, Grid, Paper, Button, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import CardTarjera from './CardTarjera';
import CardListPublicacion from './CardListPublicacion'; // Importar el nuevo componente
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const MySwal = withReactContent(Swal);

const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tarjetaFormato, setTarjetaFormato] = useState('default');
  const [mostrarTarjetas, setMostrarTarjetas] = useState(0); // Cambiar a número para múltiples vistas
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Va a la página anterior
  };
  
  useEffect(() => {
    const fetchPublicaciones = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRol(userData.userRol);

          if (userData.userRol === 'reclutador' || userData.userRol === 'administrador') {
            const data = await getDocs(collection(db, 'publicaciones'));
            setPublicaciones(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
          } else {
            navigate('/');
          }
        }
      }
      setLoading(false);
    };

    fetchPublicaciones();
  }, [navigate]);

  const publicacionesMiradaHumana = publicaciones.filter(pub => pub.userId === auth.currentUser?.uid);

  const handleActivar = async (id, currentEstado) => {
    const publicationDoc = doc(db, 'publicaciones', id);
    const newEstado = currentEstado === 'Disponible' ? 'No disponible' : 'Disponible';
    await updateDoc(publicationDoc, { estado: newEstado });
    setPublicaciones(publicaciones.map(pub => pub.id === id ? { ...pub, estado: newEstado } : pub));
  };

  const handleEliminar = async (id) => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás deshacer esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const publicationDoc = doc(db, 'publicaciones', id);
      await deleteDoc(publicationDoc);
      setPublicaciones(publicaciones.filter(pub => pub.id !== id));
      MySwal.fire('¡Eliminado!', 'La publicación ha sido eliminada.', 'success');
    }
  };

  const toggleVista = () => {
    setMostrarTarjetas((mostrarTarjetas + 1) % 3); // Cambiar entre 3 vistas
  };

  if (loading) {
    return <Cargando />;
  }

  return (
    <Container className="container mt-4">
        <Typography className='text-white me-2 mt-4' variant="h4" gutterBottom>
            Mis Publicaciones
          </Typography>
      <Grid container spacing={4}>
        
        <Grid item xs={12} md={3}>
        <Paper className='card' elevation={3} sx={{ p: 2, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: 'white' }} />
        <Typography className='text-white' variant="h6" align="center">
          Opciones
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Botón para publicar */}
          {(userRol === 'reclutador' || userRol === 'administrador') && (
            <Grid item xs={12}>
              <Link to={'/nuevaPublicacion'} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ width: '100%' }}
                  startIcon={<EditIcon />}
                >
                  Publicar
                </Button>
              </Link>
            </Grid>
          )}

          {/* Botón para cambiar vista */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ width: '100%' }}
              onClick={toggleVista}
              startIcon={<VisibilityIcon />}
            >
              Vista
            </Button>
          </Grid>

          {/* Botón para volver */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ width: '100%' }}
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
            >
              Volver
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
        
          <Grid container spacing={2}>
            {publicacionesMiradaHumana.length > 0 ? (
              mostrarTarjetas === 0 ? (
                publicacionesMiradaHumana.map( (pub) => (
                  <Grid item xs={12} sm={6} md={6} key={pub.id}>
                    <Paper className='card' elevation={2} sx={{ p: 2,borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="secondary" onClick={() => handleEliminar(pub.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img
                          src={pub.photo}
                          alt={`Foto de paciente ${pub.paciente}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                        />
                        <Typography className='text-white' variant="h6" gutterBottom>
                          {pub.cliente}
                        </Typography>
                      </Box>
                      <Box className='text-start' sx={{ flexGrow: 1, margin: 1 }}>
                        <p className="card-text text-white">Nº{pub.paciente}</p>
                        <p className="card-text text-white"><i className="fas fa-calendar-day me-2"></i><strong className='text-white'>Edad:</strong> {pub.edad}</p>
                        <p className="card-text text-white"><i className="fas fa-venus-mars me-2"></i><strong className='text-white'>Sexo:</strong> {pub.sexo}</p>
                        <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Localidad:</strong> {pub.localidad}</p>
                        <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Zona:</strong> {pub.zona}</p>
                        <p className="card-text text-white"><i className="fas fa-notes-medical me-2"></i><strong className='text-white'>Diagnóstico:</strong> {pub.diagnostico}</p>
                        <p className="card-text text-white"><i className="fas fa-align-left me-2"></i><strong className='text-white'>Descripción:</strong> {pub.descripcion}</p>
                        <p className="card-text text-white"><i className="fas fa-phone-alt me-2"></i><strong className='text-white'>Teléfono:</strong> {pub.telefono}</p>
                        <p className="card-text text-white"><i className="fas fa-envelope me-2"></i><strong className='text-white'>Email:</strong> {pub.email}</p>
                        <p className="card-text text-white"><i className="fas fa-info-circle me-2"></i><strong className='text-white'>Estado:</strong> {pub.estado}</p>
                      </Box>
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                          variant="contained"
                          color={pub.estado === 'Disponible' ? 'warning' : 'success'}
                          onClick={() => handleActivar(pub.id, pub.estado)}
                          sx={{ mr: 1 }}
                        >
                          {pub.estado === 'Disponible' ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Link to={`/generarFlyer/${pub.id}`}>
                          <Button variant="contained">
                            Generar Flyer
                          </Button>
                        </Link>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : mostrarTarjetas === 1 ? (
                publicacionesMiradaHumana.map(pub => (
                  <Grid item xs={12} sm={6} md={6} key={pub.id}>
                    <CardTarjera pub={pub} formato={tarjetaFormato} /> {/* Pasar formato */}
                  </Grid>
                ))
              ) : (
                publicacionesMiradaHumana.map(pub => (
                  <Grid item xs={12} key={pub.id}> {/* Ocupa todo el ancho en pantallas pequeñas y grandes */}
                    <CardListPublicacion pub={pub} /> {/* Pasa la publicación */}
                  </Grid>
                ))
              )
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6">No hay publicaciones disponibles.</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MisPublicaciones;