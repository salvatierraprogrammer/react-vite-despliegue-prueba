import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import {
  Box, Grid, Typography, Paper, TextField, Button, Avatar,
  MenuItem, IconButton, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  ArrowLeft, Save, User, MapPin, Stethoscope, Phone,
  Mail, Heart, Calendar
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const StyledField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
  },
});

const EditarPublicacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    paciente: '', edad: '', sexo: '', localidad: '', zona: '',
    diagnostico: '', generoAt: '', descripcion: '', telefono: '', email: '',
  });

  useEffect(() => {
    const fetchPub = async () => {
      if (!id) { navigate(-1); return; }
      try {
        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            paciente: data.paciente || '',
            edad: data.edad || '',
            sexo: data.sexo || '',
            localidad: data.localidad || '',
            zona: data.zona || '',
            diagnostico: data.diagnostico || '',
            generoAt: data.generoAt || '',
            descripcion: data.descripcion || '',
            telefono: data.telefono || '',
            email: data.email || '',
          });
        } else {
          MySwal.fire({ title: 'Error', text: 'Publicación no encontrada', icon: 'error' });
          navigate(-1);
        }
      } catch (error) {
        console.error('Error:', error);
        MySwal.fire({ title: 'Error', text: 'Error al cargar la publicación', icon: 'error' });
      } finally { setLoading(false); }
    };
    fetchPub();
  }, [id, navigate]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.paciente) {
      MySwal.fire({ title: 'Validación', text: 'El nombre del paciente es obligatorio', icon: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'publicaciones', id), formData);
      await MySwal.fire({ title: 'Guardado', text: 'Publicación actualizada correctamente', icon: 'success' });
      navigate('/misPublicaciones');
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({ title: 'Error', text: 'No se pudo guardar', icon: 'error' });
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingPage />;

  const fieldSx = { '& .MuiInputBase-root': { bgcolor: colors.surface } };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: alpha(colors.primary, 0.08) }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Editar Publicación</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Actualiza los datos del caso</Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Grid container spacing={3}>
            {/* Datos del Paciente */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), color: colors.primary, display: 'flex' }}>
                  <User size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Datos del Paciente</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledField fullWidth label="Nombre del paciente" value={formData.paciente} onChange={handleChange('paciente')} required size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <StyledField fullWidth label="Edad" value={formData.edad} onChange={handleChange('edad')} size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <StyledField fullWidth select label="Sexo" value={formData.sexo} onChange={handleChange('sexo')} size="small" sx={fieldSx}>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </StyledField>
            </Grid>

            {/* Ubicación */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.secondary, 0.08), color: colors.secondary, display: 'flex' }}>
                  <MapPin size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Ubicación</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth label="Localidad" value={formData.localidad} onChange={handleChange('localidad')} size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth select label="Zona" value={formData.zona} onChange={handleChange('zona')} size="small" sx={fieldSx}>
                {['CABA', 'Zona Norte', 'Zona Sur', 'Zona Oeste'].map(z => <MenuItem key={z} value={z}>{z}</MenuItem>)}
              </StyledField>
            </Grid>

            {/* Detalles */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.success, 0.08), color: colors.success, display: 'flex' }}>
                  <Stethoscope size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Detalles</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth label="Diagnóstico" value={formData.diagnostico} onChange={handleChange('diagnostico')} size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth select label="Género del AT" value={formData.generoAt} onChange={handleChange('generoAt')} size="small" sx={fieldSx}>
                {['Indistinto', 'Masculino', 'Femenino'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </StyledField>
            </Grid>
            <Grid item xs={12}>
              <StyledField fullWidth multiline rows={3} label="Descripción" value={formData.descripcion} onChange={handleChange('descripcion')} size="small" sx={fieldSx} />
            </Grid>

            {/* Contacto */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.warning, 0.08), color: colors.warning, display: 'flex' }}>
                  <Phone size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>Contacto</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth label="Teléfono" value={formData.telefono} onChange={handleChange('telefono')} size="small" sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledField fullWidth label="Email" value={formData.email} onChange={handleChange('email')} size="small" sx={fieldSx} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button variant="contained" startIcon={<Save size={16} />} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditarPublicacion;
