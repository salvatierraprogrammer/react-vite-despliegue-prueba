import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import html2canvas from 'html2canvas';
import { Container, Grid, Button, Typography, Paper, Box, IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import GetAppIcon from '@mui/icons-material/GetApp';
import GoBackIcon from '@mui/icons-material/ArrowBack';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsIcon from '@mui/icons-material/Settings';
import { designs } from '../data/data-desings';
import { fonts } from '../data/data-fonts'; 
import { textoColor } from '../data/data-textoColor'; 
import { tituloH1 } from '../data/data-tituloH1'; 
import BotonCompartir from './BotonCompartir';
import Cargando from './Cargando';

const GenerarFlyer = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [designIndex, setDesignIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [textColorIndex, setTextColorIndex] = useState(0);
  const [titleIndex, setTitleIndex] = useState(0);
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Va a la página anterior
  }; 
  useEffect(() => {
    const fetchPublicacion = async () => {
      if (!id) {
        console.error('No se ha proporcionado un ID válido.');
        setLoading(false);
        return;
      }

      try {
        console.log('Buscando publicación con ID:', id);
        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Publicación encontrada:', docSnap.data());
          setPublicacion(docSnap.data());

          if (docSnap.data().photo) {
            convertImageToBase64(docSnap.data().photo);
          }
        } else {
          console.log('No existe el documento con el ID proporcionado.');
          setError('No se encontró la publicación.');
        }
      } catch (error) {
        console.error('Error al obtener el documento:', error);
        setError('Error al obtener la publicación.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicacion();
  }, [id]);

  const convertImageToBase64 = (url) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      setImageBase64(dataURL);
    };
    img.onerror = (error) => {
      console.error('Error al convertir la imagen:', error);
    };
  };

  const handleGenerateFlyer = () => {
    const flyerElement = document.getElementById('flyer');
  
    // Guarda el estilo original
    const originalStyle = flyerElement.style.cssText;
  
    // Ajusta el tamaño del flyer temporalmente
    flyerElement.style.width = '700px';
    flyerElement.style.boxSizing = 'border-box'; // Asegúrate de incluir el padding y el border en el ancho
  
    // Calcula el alto proporcional
    const flyerWidth = flyerElement.offsetWidth;
    const flyerHeight = flyerElement.offsetHeight;
    const aspectRatio = flyerWidth / flyerHeight;
    const newHeight = Math.round(700 / aspectRatio);
  
    html2canvas(flyerElement, {
      scale: 2, // Ajusta la escala según la calidad deseada
      useCORS: true,
      backgroundColor: null,
      width: 700, // Establece el ancho máximo
      height: newHeight, // Calcula la altura proporcional
    })
      .then((canvas) => {
        // Restaura el estilo original
        flyerElement.style.cssText = originalStyle;
  
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'flyer.png';
        link.click();
      })
      .catch((error) => {
        console.error('Error al generar el flyer:', error);
      });
  };

  const handleNextDesign = () => {
    setDesignIndex((prevIndex) => (prevIndex + 1) % designs.length);
  };

  const handleNextFont = () => {
    setFontIndex((prevIndex) => (prevIndex + 1) % fonts.length);
  };

  const handleNextTextColor = () => {
    setTextColorIndex((prevIndex) => (prevIndex + 1) % textoColor.length);
  };

  const handleNextTitle = () => {
    setTitleIndex((prevIndex) => (prevIndex + 1) % tituloH1.length);
  };

  if (loading) {
    return <Typography variant="h6"><Cargando/></Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error">{error}</Typography>;
  }

  return (
    <Container className="container mt-4">
      <Typography className='text-white' variant="h4" gutterBottom>
            Crear Flyer
          </Typography>
      {publicacion ? (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
          <Paper 
              id="flyer"
              elevation={3}
              sx={{
                background: designs[designIndex],
                padding: '20px',
                color: textoColor[textColorIndex],
                borderRadius: 3,
                boxShadow: 6,
                fontFamily: fonts[fontIndex] || 'Arial, sans-serif',
                fontSize: '18px',
                textAlign: 'center',
                maxWidth: '700px',
                margin: 'auto'
              }}
            >
  <Typography 
    variant="h5" 
    sx={{ color: textoColor[textColorIndex], mb: 3, fontWeight: 'bold' }}
  >
    {tituloH1[titleIndex]}
  </Typography>
  {imageBase64 && (
    <Box
      component="img"
      src={imageBase64}
      alt="Imagen de perfil"
      sx={{ maxWidth: '150px', height: 'auto', borderRadius: '50%', mb: 3 }}
    />
  )}
  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
    {publicacion.cliente}
  </Typography>
  <Box component="ul" sx={{ textAlign: 'left', listStyleType: 'none', p: 0, mb: 4 }}>
    <li><i className="fa-solid fa-user me-2"></i>Paciente: {publicacion.sexo}</li>
    <li><i className="fa-solid fa-cake-candles me-2"></i>Edad: {publicacion.edad}</li>
    <li><i className="fa-solid fa-location-dot me-2"></i>Localidad: {publicacion.localidad}</li>
    <li><i className="fa-solid fa-globe me-2"></i>Zona: {publicacion.zona}</li>
    <li><i className="fa-solid fa-notes-medical me-2"></i>Diagnóstico: {publicacion.diagnostico}</li>
    <li><i className="fa-solid fa-comments me-2"></i>Descripción: {publicacion.descripcion}</li>
    <li><i className="fa-solid fa-phone me-2"></i>Teléfono: {publicacion.telefono}</li>
    <li><i className="fa-solid fa-envelope me-2"></i>Email: {publicacion.email}</li>
  </Box>
  <Typography variant="h5" sx={{ mt: 4, fontWeight: 'bold' }}>
    ¡Síguenos en redes sociales!
  </Typography>
  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
    <IconButton href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" color="secondary">
      <InstagramIcon />
    </IconButton>
    <IconButton href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" color="primary">
      <FacebookIcon />
    </IconButton>
    <IconButton href="https://wa.me/" target="_blank" rel="noopener noreferrer" sx={{ color: '#25D366' }}>
      <WhatsAppIcon />
    </IconButton>
  </Box>
</Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className='card' elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1, color: 'white' }} />
            <Typography className='text-white'  variant="h6" align="center">Configurar diseño</Typography>
          </Box>
              
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" color="secondary" onClick={handleNextDesign}>
                  <i className="fa-solid fa-paintbrush me-2"></i> Cambiar diseño
                </Button>
                <Button variant="contained" color="secondary" onClick={handleNextFont}>
                  <i className="fa-solid fa-font me-2"></i> Cambiar fuente
                </Button>
                <Button variant="contained" color="secondary" onClick={handleNextTextColor}>
                  <i className="fa-solid fa-palette me-2"></i> Color del texto
                </Button>
                <Button variant="contained" color="secondary" onClick={handleNextTitle}>
                  <i className="fa-solid fa-heading me-2"></i> Cambiar título
                </Button>
                <Button variant="contained" color="success" onClick={handleGenerateFlyer} startIcon={<GetAppIcon />}>
                  Descargar flyer
                </Button>
                <Button variant="outlined" className='text-white'  color="primary" onClick={handleGoBack}  startIcon={<GoBackIcon />}>
                  Volver al listado
                </Button>
                <BotonCompartir publicacion={publicacion}/>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="h6">No se encontró la publicación.</Typography>
      )}
    </Container>
  );
};

export default GenerarFlyer;