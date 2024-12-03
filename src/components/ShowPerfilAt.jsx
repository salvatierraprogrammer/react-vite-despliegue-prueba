import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import { Card, CardContent, Typography, IconButton, Button } from '@mui/material';
import { Email as EmailIcon, WhatsApp as WhatsAppIcon, LocationOn as LocationOnIcon, Work as WorkIcon, School as SchoolIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';
import './css/ShowPerfilAt.css';
import Cargando from './Cargando';

const ShowPerfilAt = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook para manejar la navegación
  const [acompanante, setAcompanante] = useState(null);

  const getAcompanante = async () => {
    const docRef = doc(db, 'perfilLaboral', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setAcompanante(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getAcompanante();
  }, [id]);

  if (!acompanante) {
    return <Cargando />;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center text-white mb-4">Perfil Completo</h1>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Card className="mb-4 shadow-lg">
            <CardContent className="text-center">
              <img
                src={acompanante.images || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2WjS_hXJ9gKTPO0DP2wQa9ho1mxaq2aynxQ&s'}
                className="rounded-circle patient-photo mb-3"
                alt={acompanante.nombreCompleto}
                style={{ width: '150px', height: '150px' }}
              />
              <Typography variant="h6" sx={{ color: '#504683' }}>{acompanante.nombreCompleto}</Typography>
              <Typography variant="body2" sx={{ color: '#504683' }}><strong>Email:</strong> {acompanante.email}</Typography>
              <Typography variant="body2" sx={{ color: '#504683' }}><strong>Teléfono:</strong> {acompanante.telefono}</Typography>
              <div className="mt-4">
                <IconButton color="primary" href={`mailto:${acompanante.email}`} sx={{ marginRight: 2 }}>
                  <EmailIcon />
                </IconButton>
                <IconButton color="success" href={`https://wa.me/${acompanante.telefono}`} sx={{ marginRight: 2 }}>
                  <WhatsAppIcon />
                </IconButton>
              </div>
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
                  <strong>Experiencia:</strong> {acompanante.experiencia}
                </Typography>
              </div>
              <div className="d-flex align-items-center mb-2">
                <SchoolIcon sx={{ color: '#504683', marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Formación:</strong> {acompanante.formacion}
                </Typography>
              </div>
              <div className="d-flex align-items-center mb-2">
                <LocalHospitalIcon sx={{ color: '#504683', marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Sobre Mí:</strong> {acompanante.sobreMi}
                </Typography>
              </div>
              <div className="d-flex align-items-center mb-2">
                <LocationOnIcon sx={{ color: '#504683', marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Localidad:</strong> {acompanante.localidad}
                </Typography>
              </div>
              <div className="d-flex align-items-center mb-2">
                <LocationOnIcon sx={{ color: '#504683', marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: '#504683' }}>
                  <strong>Zona:</strong> {acompanante.zona}
                </Typography>
              </div>
              <div className="text-center mt-4">
                <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ marginTop: 2 }}>
                  Volver Atrás
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShowPerfilAt;