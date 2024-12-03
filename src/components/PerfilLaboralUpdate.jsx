import React, { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Select, MenuItem, Dialog, DialogTitle, Button, IconButton } from '@mui/material';
import { Email as EmailIcon, WhatsApp as WhatsAppIcon, Edit as EditIcon, Work as WorkIcon, School as SchoolIcon, LocationOn as LocationOnIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';
import './css/ShowPerfilAt.css';
import Cargando from './Cargando';

const PerfilLaboralUpdate = () => {
  const [perfilData, setPerfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estado, setEstado] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const fetchPerfilData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        const perfilSnapshot = await getDoc(perfilDoc);
        if (perfilSnapshot.exists()) {
          const data = perfilSnapshot.data();
          setPerfilData(data);
          setEstado(data.estado || 'Disponible');
        } else {
          setPerfilData(null);
          setError('No se encontraron datos del perfil.');
          navigate('/crear-perfil-laboral');
        }
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al cargar los datos del perfil.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPerfilData();
  }, [fetchPerfilData]);

  const handleChangeEstado = async (e) => {
    const newEstado = e.target.value;
    try {
      const user = auth.currentUser;
      if (user) {
        const perfilDoc = doc(db, 'perfilLaboral', user.uid);
        await updateDoc(perfilDoc, { estado: newEstado });
        setEstado(newEstado);
        setPerfilData((prevData) => ({ ...prevData, estado: newEstado }));
        setOpenModal(true); // Show success modal
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al actualizar el estado.');
    }
  };

  if (loading) return <Cargando />;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-white">Perfil Laboral</h1>
      {perfilData ? (
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <Card className="mb-4 shadow-lg">
              <CardContent className="text-center">
                <img
                  src={perfilData.images}
                  className="rounded-circle patient-photo mb-3"
                  alt={perfilData.nombreCompleto}
                  style={{ width: '150px', height: '150px' }}
                />
                <Typography variant="h6" sx={{ color: '#504683' }}>{perfilData.nombreCompleto}</Typography>
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Email:</strong> {perfilData.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Teléfono:</strong> {perfilData.telefono}
                </Typography>
                <div className="mt-4">
                <IconButton color="primary" href={`mailto:${perfilData.email}`} sx={{ marginRight: 2 }}>
                <EmailIcon />
              </IconButton>
              <IconButton color="success" href={`https://wa.me/${perfilData.telefono}`} sx={{ marginRight: 2 }}>
                <WhatsAppIcon />
              </IconButton>
                </div>
                {/* Edit Profile Button */}
                <Link to="/editarPerfilLaboral">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    sx={{ marginTop: 2 }}
                  >
                    Editar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="col-md-6 col-lg-4">
            <Card className="mb-4 shadow-lg">
              <CardContent>
                <Typography variant="h6" sx={{ color: '#504683' }}>Detalles del Perfil</Typography>
                <div className="d-flex align-items-center mb-2">
                  <WorkIcon sx={{ color: '#504683', marginRight: 1 }} />
                  <Typography variant="body2" sx={{ color: '#504683' }}>
                    <strong>Experiencia:</strong> {perfilData.experiencia}
                  </Typography>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <SchoolIcon sx={{ color: '#504683', marginRight: 1 }} />
                  <Typography variant="body2" sx={{ color: '#504683' }}>
                    <strong>Formación:</strong> {perfilData.formacion}
                  </Typography>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <LocalHospitalIcon sx={{ color: '#504683', marginRight: 1 }} />
                  <Typography variant="body2" sx={{ color: '#504683' }}>
                    <strong>Sobre Mí:</strong> {perfilData.sobreMi}
                  </Typography>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <LocationOnIcon sx={{ color: '#504683', marginRight: 1 }} />
                  <Typography variant="body2" sx={{ color: '#504683' }}>
                    <strong>Localidad:</strong> {perfilData.localidad}
                  </Typography>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <LocationOnIcon sx={{ color: '#504683', marginRight: 1 }} />
                  <Typography variant="body2" sx={{ color: '#504683' }}>
                    <strong>Zona:</strong> {perfilData.zona}
                  </Typography>
                </div>
                <div className="text-center mt-4">
                  <label htmlFor="estado" className="form-label">Cambiar Estado:</label>
                  <Select
                    value={estado}
                    onChange={handleChangeEstado}
                    className="form-select"
                    id="estado"
                  >
                    <MenuItem value="Disponible">Disponible</MenuItem>
                    <MenuItem value="Consultar">Consultar</MenuItem>
                    <MenuItem value="No Disponible">No Disponible</MenuItem>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className='alert alert-secondary'>No se encontraron datos del perfil.</p>
          <Link to="/crear-perfil-laboral" className="btn btn-secondary mt-3">Crear Perfil Laboral</Link>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>¡Éxito!</DialogTitle>
        <div className="text-center p-3">
          <Typography>Estado actualizado correctamente.</Typography>
          <Button onClick={() => setOpenModal(false)} color="primary" variant="contained" sx={{ marginTop: 2 }}>
            Cerrar
          </Button>
        </div>
      </Dialog>
    </div>
  );
};


export default PerfilLaboralUpdate;