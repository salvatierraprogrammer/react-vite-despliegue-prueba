import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, InputAdornment, IconButton, Tabs, Tab,
  Card, CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogActions, Fab, Badge
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  Search, Filter, MapPin, Star, Calendar, Heart,
  Plus, Send, Eye, MessageCircle, Clock, CheckCircle,
  Briefcase, Home, ChevronRight, Phone,
  Mail, User, Heart as HeartFilled, X, MapPinned,
  SlidersHorizontal
} from 'lucide-react';

const SearchFilters = memo(({ filters, onChange }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
    {[
      { label: 'Todos', value: 'todos' },
      { label: 'Zona Norte', value: 'norte' },
      { label: 'Zona Sur', value: 'sur' },
      { label: 'CABA', value: 'caba' },
      { label: 'Zona Oeste', value: 'oeste' },
    ].map(zone => (
      <Chip
        key={zone.value}
        label={zone.label}
        onClick={() => onChange({ ...filters, zona: zone.value })}
        variant={filters.zona === zone.value ? 'filled' : 'outlined'}
        sx={{
          bgcolor: filters.zona === zone.value ? colors.primary : 'transparent',
          color: filters.zona === zone.value ? '#fff' : colors.textSecondary,
        }}
      />
    ))}
  </Box>
));

const AcompananteCard = memo(({ at, onView, onContact, onFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      elevation={0}
      sx={{
        borderRadius: '20px', border: `1px solid ${colors.border}`,
        overflow: 'hidden', transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: colors.primary,
          boxShadow: `0 12px 32px ${alpha(colors.primary, 0.12)}`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{
        height: 120,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        position: 'relative',
      }}>
        <IconButton
          onClick={() => setIsFavorite(!isFavorite)}
          sx={{
            position: 'absolute', top: 8, right: 8,
            bgcolor: alpha('#fff', 0.9),
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          {isFavorite ? <HeartFilled size={18} color={colors.danger} /> : <Heart size={18} />}
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6 }}>
        <Avatar
          src={at.images?.[0] || at.photo}
          sx={{
            width: 80, height: 80, border: `4px solid ${colors.surface}`,
            boxShadow: `0 8px 24px ${alpha('#000', 0.15)}`,
          }}
        >
          {at.nombreCompleto?.[0]}
        </Avatar>
      </Box>
      <CardContent sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {at.nombreCompleto}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          {at.titulo || 'Acompañante Terapéutico'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          {at.verificado && (
            <Chip
              icon={<CheckCircle size={12} />}
              label="Verificado"
              size="small"
              sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success, fontSize: '0.7rem' }}
            />
          )}
          <Chip
            icon={<Star size={12} />}
            label={at.calificacion || '4.8'}
            size="small"
            sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning, fontSize: '0.7rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <MapPin size={14} color={colors.textMuted} />
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {at.localidad || at.zona || 'Buenos Aires'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {at.especialidades?.slice(0, 3).map((esp, i) => (
            <Chip key={i} label={esp} size="small" sx={{ fontSize: '0.65rem' }} />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Eye size={14} />}
          onClick={() => onView(at.id)}
        >
          Ver perfil
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<MessageCircle size={14} />}
          onClick={() => onContact(at)}
        >
          Contactar
        </Button>
      </CardActions>
    </Card>
  );
});

const CasoCard = memo(({ caso, onView }) => (
  <Paper
    elevation={0}
    component={motion.div}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    sx={{
      p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, cursor: 'pointer', transition: 'all 0.2s ease',
      '&:hover': { borderColor: colors.primary, transform: 'translateX(4px)' },
    }}
    onClick={() => onView(caso.id)}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {caso.titulo}
      </Typography>
      <Chip
        label={caso.estado || 'abierto'}
        size="small"
        sx={{
          bgcolor: caso.estado === 'cerrado' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
          color: caso.estado === 'cerrado' ? colors.success : colors.warning,
        }}
      />
    </Box>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <MapPin size={14} color={colors.textMuted} />
        <Typography variant="caption">{caso.localidad}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Clock size={14} color={colors.textMuted} />
        <Typography variant="caption">
          {caso.fechaPublicacion ? new Date(caso.fechaPublicacion.seconds * 1000).toLocaleDateString() : 'Reciente'}
        </Typography>
      </Box>
    </Box>
  </Paper>
));

const PublicarCasoDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', localidad: '', zona: '', urgencia: 'media',
  });

  const handleSubmit = () => {
    if (formData.titulo && formData.descripcion) {
      onSubmit(formData);
      setFormData({ titulo: '', descripcion: '', localidad: '', zona: '', urgencia: 'media' });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Publicar un Caso</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título del caso"
            fullWidth
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Se busca AT para niño con TEA"
          />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe las necesidades, horarios, requisitos..."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Localidad"
              fullWidth
              value={formData.localidad}
              onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
            />
            <TextField
              label="Zona"
              fullWidth
              select
              value={formData.zona}
              onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
            >
              {['CABA', 'Zona Norte', 'Zona Sur', 'Zona Oeste', 'Zona Este'].map(z => (
                <MenuItem key={z} value={z}>{z}</MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            label="Nivel de urgencia"
            fullWidth
            select
            value={formData.urgencia}
            onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
          >
            <MenuItem value="baja">Baja</MenuItem>
            <MenuItem value="media">Media</MenuItem>
            <MenuItem value="alta">Alta</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Publicar Caso</Button>
      </DialogActions>
    </Dialog>
  );
};

const DashboardFamiliar = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [acompanantes, setAcompanantes] = useState([]);
  const [misCasos, setMisCasos] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({ zona: 'todos', search: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const atSnap = await getDocs(collection(db, 'perfilesLaborales'));
      const atData = atSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let casosSnap;
      if (user) {
        casosSnap = await getDocs(query(
          collection(db, 'publicaciones'),
          where('userId', '==', user.uid)
        ));
      } else {
        casosSnap = await getDocs(collection(db, 'publicaciones'));
      }
      const casosData = casosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setAcompanantes(atData);
      setMisCasos(casosData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePublishCaso = async (data) => {
    try {
      await addDoc(collection(db, 'publicaciones'), {
        ...data,
        userId: user?.uid,
        userNombre: userData?.nombre,
        estado: 'abierta',
        fechaPublicacion: new Date(),
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <LoadingPage />;

  const filteredAt = acompanantes.filter(at => {
    if (filters.zona !== 'todos' && at.zona !== filters.zona) return false;
    if (filters.search && !at.nombreCompleto?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Panel Familiar
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Encuentra el mejor acompañante terapéutico
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setDialogOpen(true)}>
          Publicar Caso
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={`Buscar AT (${acompanantes.length})`} />
        <Tab label={`Mis Casos (${misCasos.length})`} />
      </Tabs>

      <AnimatePresence mode="wait">
        {tabValue === 0 && (
          <motion.div key="tab0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchFilters filters={filters} onChange={setFilters} />

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre o especialidad..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color={colors.textMuted} />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 500 }}
              />
            </Box>

            <Grid container spacing={3}>
              {filteredAt.map(at => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={at.id}>
                  <AcompananteCard
                    at={at}
                    onView={(id) => navigate(`/showPerfil/${id}`)}
                    onContact={() => window.open(`https://wa.me/${at.telefono}`, '_blank')}
                    onFavorite={(id) => console.log('favorite', id)}
                  />
                </Grid>
              ))}
            </Grid>

            {filteredAt.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Search size={48} color={colors.textMuted} />
                <Typography variant="h6" sx={{ mt: 2 }}>No se encontraron acompañantes</Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Intenta cambiar los filtros de búsqueda
                </Typography>
              </Box>
            )}
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div key="tab1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3}>
              {misCasos.map(caso => (
                <Grid item xs={12} md={6} key={caso.id}>
                  <CasoCard caso={caso} onView={(id) => navigate(`/verCaso/${id}`)} />
                </Grid>
              ))}
            </Grid>

            {misCasos.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Briefcase size={48} color={colors.textMuted} />
                <Typography variant="h6" sx={{ mt: 2 }}>No has publicado casos aún</Typography>
                <Button variant="text" onClick={() => setDialogOpen(true)} sx={{ mt: 1 }}>
                  Publicar tu primer caso
                </Button>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PublicarCasoDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handlePublishCaso} />
    </Box>
  );
};

export default DashboardFamiliar;