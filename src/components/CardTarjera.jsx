import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';

const CardTarjera = ({ pub }) => {
  return (
    <Paper className='card' elevation={2} sx={{ p: 2, display: 'flex',borderRadius: 3, flexDirection: 'column', height: '100%' }}>
   
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2,  }}>
        <img
          src={pub.photo}
          alt={`Foto de paciente ${pub.paciente}`}
          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
        />
        <Typography variant="h4" className='text-white' sx={{ ml: 2 }}>
          {pub.cliente}
        </Typography>
      </Box>
      <Typography variant="h5" className='text-white' sx={{ mb: 2 }}>
        Solicito Acompañante Terapéutico
      </Typography>
      <Box className='text-start' sx={{ mb: 2 }}>
        <Typography  variant="body1" className='text-white' sx={{ mb: 1 }}>
        <i className="fa fa-venus-mars"  aria-hidden="true"></i> <b className='text-white'>Preferentemente: </b><span>{pub.generoAt}</span>  <i className="fas fa-map-marker-alt me-2"></i><span>{pub.zona}</span>
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-map-marker" aria-hidden="true"></i> <b className='text-white'>Localidad:</b> {pub.localidad}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-heartbeat" aria-hidden="true"></i> <b className='text-white'>Diagnóstico:</b> {pub.diagnostico}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-user" aria-hidden="true"></i> <b className='text-white'>Edad:</b> {pub.edad}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-venus-mars" aria-hidden="true"></i> <b  className='text-white'>Género:</b> {pub.sexo}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-book" aria-hidden="true"></i> <b className='text-white'>Abordaje:</b> {pub.descripcion}
        </Typography>
      </Box>
      <Typography variant="body2" className='text-white' sx={{ mb: 2 }}>
        Publicado el <span>Hace una hora</span>
      </Typography>
      <Button variant="contained" color="info">
        Contactar
      </Button>
    </Paper>
  );
};

export default CardTarjera;