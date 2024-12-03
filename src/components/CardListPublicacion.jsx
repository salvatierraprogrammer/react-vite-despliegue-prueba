import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';

const CardListPublicacion = ({ pub }) => {
  return (
    <Paper 
      className='card' 
      elevation={2} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%', 
        maxWidth: '800px', // Ajusta el ancho máximo de la tarjeta
        margin: 'auto',
        borderRadius: 5, // Centra la tarjeta horizontalmente
      }}
    >
<Typography variant="h5" className='text-white' sx={{ mb: 2 }}>
        Solicito Acompañante Terapéutico
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <img
          src={pub.photo}
          alt={`Foto de paciente ${pub.paciente}`}
          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
        />
        <Typography variant="h4" className='text-white' sx={{ ml: 2 }}>
          {pub.cliente}
        </Typography>
      </Box>
      <Box className='text-start' sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', mb: 1 }}>
  <Typography variant="body1" className='text-white'>
    <i className="fa fa-venus-mars" aria-hidden="true"></i> <b className='text-white'>Preferentemente: </b>
    <span>{pub.generoAt}</span>
  </Typography>
  <Typography variant="body1" style={{marginLeft: 15,}} className='text-white'>
    <i className="fas fa-map-marker-alt"></i> <span>{pub.zona}</span>
  </Typography>
</Box>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-map-marker" aria-hidden="true"></i> <b className='text-white'>Localidad:</b> {pub.localidad}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-venus-mars" aria-hidden="true"></i> <b className='text-white'>Género:</b> {pub.sexo}
        </Typography>
        <Typography variant="body1" className='text-white' sx={{ mb: 1 }}>
          <i className="fa fa-book" aria-hidden="true"></i> <b className='text-white'>Abordaje:</b> {pub.descripcion}
        </Typography>
      </Box>
      <Typography variant="body2" className='text-white' sx={{ mb: 2 }}>
        Publicado el <span>Hace una hora</span>
      </Typography>
      <Button className='btn btn-secondary '>
        Contactar
      </Button>
    </Paper>
  );
};

export default CardListPublicacion;