import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import html2canvas from 'html2canvas';
import { Grid, Button, Typography, Paper, Box, IconButton, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import GetAppIcon from '@mui/icons-material/GetApp';
import ArrowBack from '@mui/icons-material/ArrowBack';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TitleIcon from '@mui/icons-material/Title';
import ImageIcon from '@mui/icons-material/Image';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { colors } from '../../theme/theme';
import { designs } from '../../data/data-desings';
import { fonts } from '../../data/data-fonts';
import { textoColor } from '../../data/data-textoColor';
import { tituloH1 } from '../../data/data-tituloH1';
import BotonCompartir from '../../components/BotonCompartir';
import Cargando from '../../components/Cargando';

const ControlPanel = styled(Paper)({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
  position: 'sticky',
  top: 24,
});

const ControlButton = styled(Button)({
  borderRadius: '12px',
  padding: '12px 16px',
  justifyContent: 'flex-start',
  fontWeight: 600,
  fontSize: '0.8125rem',
  textTransform: 'none',
});

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

  useEffect(() => {
    const fetchPublicacion = async () => {
      if (!id) { setLoading(false); setError('ID de publicación no válido.'); return; }
      try {
        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPublicacion(docSnap.data());
          if (docSnap.data().photo) convertImageToBase64(docSnap.data().photo);
        } else {
          setError('No se encontró la publicación.');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error al obtener la publicación.');
      } finally { setLoading(false); }
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
      setImageBase64(canvas.toDataURL('image/png'));
    };
  };

  const handleGenerateFlyer = () => {
    const flyerElement = document.getElementById('flyer');
    const originalStyle = flyerElement.style.cssText;
    flyerElement.style.width = '700px';
    flyerElement.style.boxSizing = 'border-box';
    const flyerWidth = flyerElement.offsetWidth;
    const flyerHeight = flyerElement.offsetHeight;
    const aspectRatio = flyerWidth / flyerHeight;
    const newHeight = Math.round(700 / aspectRatio);

    html2canvas(flyerElement, {
      scale: 2, useCORS: true, backgroundColor: null,
      width: 700, height: newHeight,
    }).then((canvas) => {
      flyerElement.style.cssText = originalStyle;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'flyer.png';
      link.click();
    }).catch(console.error);
  };

  const handleRandomProfessional = () => {
    setDesignIndex(Math.floor(Math.random() * designs.length));
    setFontIndex(Math.floor(Math.random() * fonts.length));
    setTextColorIndex(Math.floor(Math.random() * textoColor.length));
    setTitleIndex(Math.floor(Math.random() * tituloH1.length));
  };

  if (loading) return <Cargando />;
  if (error) return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
  if (!publicacion) return <Typography sx={{ p: 4, textAlign: 'center', color: colors.textSecondary }}>No se encontró la publicación.</Typography>;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: alpha(colors.primary, 0.08) }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary }}>Crear Flyer</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Personaliza y descarga tu flyer promocional</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Flyer Preview */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              id="flyer"
              elevation={0}
              sx={{
                background: designs[designIndex],
                padding: '32px',
                color: textoColor[textColorIndex],
                borderRadius: '20px',
                fontFamily: fonts[fontIndex] || 'Arial, sans-serif',
                fontSize: '17px',
                textAlign: 'center',
                maxWidth: 700,
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h5" sx={{ color: textoColor[textColorIndex], mb: 3, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.01em' }}>
                {tituloH1[titleIndex]}
              </Typography>

              {imageBase64 && (
                <Box component="img" src={imageBase64} alt="Foto"
                  sx={{ maxWidth: '130px', height: 'auto', borderRadius: '50%', mb: 3, border: `4px solid ${alpha(textoColor[textColorIndex], 0.2)}` }}
                />
              )}

              <Typography variant="h5" sx={{ mb: 2.5, fontWeight: 700, fontSize: '1.25rem' }}>
                {publicacion.cliente}
              </Typography>

              <Box component="ul" sx={{ textAlign: 'left', listStyleType: 'none', p: 0, m: 0, mb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { icon: 'user', label: 'Paciente', value: publicacion.sexo },
                  { icon: 'cake-candles', label: 'Edad', value: publicacion.edad },
                  { icon: 'location-dot', label: 'Localidad', value: publicacion.localidad },
                  { icon: 'globe', label: 'Zona', value: publicacion.zona },
                  { icon: 'notes-medical', label: 'Diagnóstico', value: publicacion.diagnostico },
                  { icon: 'comments', label: 'Descripción', value: publicacion.descripcion },
                  { icon: 'phone', label: 'Teléfono', value: publicacion.telefono },
                  { icon: 'envelope', label: 'Email', value: publicacion.email },
                ].map((item, i) => (
                  <Box key={i} component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.9375rem', opacity: 0.9 }}>
                    <i className={`fa-solid fa-${item.icon}`} style={{ width: 18, textAlign: 'center', opacity: 0.7 }} />
                    <span><strong>{item.label}:</strong> {item.value}</span>
                  </Box>
                ))}
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1.5, fontWeight: 700, fontSize: '1.1rem' }}>
                Síguenos en redes sociales
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <IconButton href="https://www.instagram.com" target="_blank" sx={{ color: textoColor[textColorIndex], opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton href="https://www.facebook.com" target="_blank" sx={{ color: textoColor[textColorIndex], opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton href="https://wa.me/" target="_blank" sx={{ color: textoColor[textColorIndex], opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <WhatsAppIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Control Panel */}
        <Grid item xs={12} md={5} lg={4}>
          <ControlPanel elevation={0}>
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SettingsIcon sx={{ color: colors.primary, fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Configurar diseño</Typography>
            </Box>

            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ControlButton variant="outlined" startIcon={<PaletteIcon />} onClick={() => setDesignIndex((prevIndex) => (prevIndex + 1) % designs.length)} fullWidth>
                Cambiar diseño
              </ControlButton>
              <ControlButton variant="outlined" startIcon={<TextFieldsIcon />} onClick={() => setFontIndex((prevIndex) => (prevIndex + 1) % fonts.length)} fullWidth>
                Cambiar fuente
              </ControlButton>
              <ControlButton variant="outlined" startIcon={<ImageIcon />} onClick={() => setTextColorIndex((prevIndex) => (prevIndex + 1) % textoColor.length)} fullWidth>
                Color del texto
              </ControlButton>
              <ControlButton variant="outlined" startIcon={<TitleIcon />} onClick={() => setTitleIndex((prevIndex) => (prevIndex + 1) % tituloH1.length)} fullWidth>
                Cambiar título
              </ControlButton>

              <Box sx={{ borderTop: `1px solid ${colors.border}`, my: 1, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <ControlButton variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleRandomProfessional} fullWidth
                  sx={{ bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' }, background: 'linear-gradient(135deg, #7C3AED, #2563EB)' }}>
                  Flyer Profesional Aleatorio
                </ControlButton>
                <ControlButton variant="contained" startIcon={<GetAppIcon />} onClick={handleGenerateFlyer} fullWidth sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryDark } }}>
                  Descargar flyer
                </ControlButton>
              </Box>

              <ControlButton variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)} fullWidth sx={{ color: colors.textSecondary, borderColor: colors.border }}>
                Volver
              </ControlButton>

              <BotonCompartir publicacion={publicacion} />
            </Box>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GenerarFlyer;
