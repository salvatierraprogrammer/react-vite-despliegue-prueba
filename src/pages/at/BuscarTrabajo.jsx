import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Card, CardContent, CardActions, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton, alpha, Badge, Tabs, Tab, Alert, Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import EnviarCV from '../../components/EnviarCV';
import {
  Search, MapPin, Clock, Phone, Mail, Heart,
  Send, Filter, Briefcase, User, Star, Calendar,
  Eye, ChevronRight, Sparkles, MapPinned,
  Building2, CheckCircle, XCircle, DollarSign,
  FileText, AlertCircle, SlidersHorizontal, AlertTriangle
} from 'lucide-react';

const SearchContainer = styled(Box)({
  position: 'relative',
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: colors.surface,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.02),
    },
    '&.Mui-focused': {
      backgroundColor: colors.surface,
      boxShadow: `0 0 0 4px ${alpha(colors.primary, 0.08)}`,
    },
  },
});

const FilterChip = styled(Chip, { shouldForwardProp: (prop) => prop !== 'selected' })(({ selected }) => ({
  borderRadius: '10px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  backgroundColor: selected ? alpha(colors.primary, 0.1) : 'transparent',
  color: selected ? colors.primary : colors.textSecondary,
  border: `1px solid ${selected ? colors.primary : colors.border}`,
  '&:hover': {
    backgroundColor: selected ? alpha(colors.primary, 0.15) : alpha(colors.primary, 0.04),
  },
}));

const PublicacionCard = styled(Card, { shouldForwardProp: (prop) => prop !== 'enviado' })(({ enviado }) => ({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: colors.surface,
  position: 'relative',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px -12px ${alpha(colors.primary, 0.15)}`,
    '& .card-glow': {
      opacity: 1,
    },
  },
}));

const CardGlow = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  opacity: 0,
  transition: 'opacity 0.3s ease',
});

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 4,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '24px',
        backgroundColor: alpha(colors.primary, 0.08),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <Icon size={36} color={colors.primary} />
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 400 }}>
      {description}
    </Typography>
    {action}
  </Box>
);

const BuscarTrabajo = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cvEnviado, setCvEnviado] = useState({});
  const [selectedZone, setSelectedZone] = useState('Todos');
  const [hasPerfilLaboral, setHasPerfilLaboral] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showNoPerfilModal, setShowNoPerfilModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();

  const publicacionesCollection = collection(db, 'publicaciones');
  const usersCollection = collection(db, 'usuarios');
  const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');

  useEffect(() => {
    const checkCvEnviado = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userId = user.uid;
          const querySnapshot = await getDocs(mailEnviadosCollection);
          const enviado = {};
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.userIdUsers === userId) {
              enviado[data.userIdPublicacion] = true;
            }
          });
          setCvEnviado(enviado);
        } catch (error) {
          console.error('Error checking CVs:', error);
        }
      }
    };

    checkCvEnviado();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setUserRol(userDoc.data().userRol);
          }

          const perfilDoc = await getDoc(doc(db, 'perfilLaboral', user.uid));
          setHasPerfilLaboral(perfilDoc.exists());
        }

        const pubsSnap = await getDocs(publicacionesCollection);
        setPublicaciones(pubsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const usersSnap = await getDocs(usersCollection);
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowModal = (publicacionId) => {
    const user = auth.currentUser;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (userRol !== 'empleado') {
      setShowRoleModal(true);
      return;
    }
    if (!hasPerfilLaboral) {
      setShowNoPerfilModal(true);
      return;
    }
    setSelectedPublicacion(publicacionId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPublicacion(null);
  };

  const handleCvEnviado = (publicacionId) => {
    setCvEnviado((prev) => ({ ...prev, [publicacionId]: true }));
  };

  const zonas = ['Todos', 'Zona Sur', 'CABA', 'Zona Norte', 'Zona Oeste'];

  const publicacionesDisponibles = useMemo(() => {
    return publicaciones.filter(pub => {
      const matchesZone = selectedZone === 'Todos' || pub.zona === selectedZone;
      const matchesSearch = !searchTerm || 
        pub.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.localidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.diagnostico?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesZone && matchesSearch && pub.estado === 'Disponible';
    });
  }, [publicaciones, selectedZone, searchTerm]);

  if (loading) return <LoadingPage />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ pb: 4 }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Buscar Trabajo
        </Typography>
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Explora las oportunidades disponibles y encuentra tu próximo caso
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchContainer sx={{ flex: 1, minWidth: 280 }}>
            <TextField
              fullWidth
              placeholder="Buscar por paciente, ubicación o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color={colors.textMuted} />
                  </InputAdornment>
                ),
              }}
            />
          </SearchContainer>

          <FormControl sx={{ minWidth: 160 }}>
            <Select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '12px' }}
            >
              {zonas.map((zona) => (
                <MenuItem key={zona} value={zona}>{zona}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {publicacionesDisponibles.length} caso{publicacionesDisponibles.length !== 1 ? 's' : ''} encontrado{publicacionesDisponibles.length !== 1 ? 's' : ''}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setViewMode('grid')}
            sx={{ bgcolor: viewMode === 'grid' ? alpha(colors.primary, 0.1) : 'transparent' }}
          >
            <Grid3x3Icon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('list')}
            sx={{ bgcolor: viewMode === 'list' ? alpha(colors.primary, 0.1) : 'transparent' }}
          >
            <ListIcon />
          </IconButton>
        </Box>
      </Box>

      {publicacionesDisponibles.length > 0 ? (
        <Grid container spacing={3}>
          {publicacionesDisponibles.map((pub, index) => (
            <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} key={pub.id}>
              <PublicacionCard
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                elevation={0}
                sx={{ height: '100%' }}
              >
                <CardGlow className="card-glow" />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        src={pub.photo}
                        sx={{
                          width: 56,
                          height: 56,
                          border: `3px solid ${alpha(colors.primary, 0.2)}`,
                          boxShadow: `0 4px 12px ${alpha(colors.primary, 0.15)}`,
                        }}
                      >
                        {pub.cliente?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {pub.cliente}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {pub.edad} años • {pub.sexo}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={pub.zona || 'Sin zona'}
                      size="small"
                      sx={{
                        bgcolor: alpha(colors.primary, 0.08),
                        color: colors.primary,
                        fontWeight: 500,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MapPinned size={16} color={colors.textMuted} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        {pub.localidad}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FileText size={16} color={colors.textMuted} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        <strong>Diagnóstico:</strong> {pub.diagnostico}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: alpha(colors.primary, 0.03),
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {pub.descripcion}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, justifyContent: 'space-between', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Eye size={14} />}
                    onClick={() => navigate(`/verCaso/${pub.id}`)}
                  >
                    Ver detalle
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={cvEnviado[pub.id] ? <CheckCircle size={14} /> : <Send size={14} />}
                    disabled={cvEnviado[pub.id]}
                    onClick={() => handleShowModal(pub.id)}
                    sx={{
                      minWidth: 120,
                      ...(cvEnviado[pub.id] && {
                        bgcolor: alpha(colors.success, 0.1),
                        color: colors.success,
                        borderColor: colors.success,
                      }),
                    }}
                  >
                    {cvEnviado[pub.id] ? 'CV enviado' : 'Enviar CV'}
                  </Button>
                </CardActions>
              </PublicacionCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No hay casos disponibles"
          description={
            selectedZone === 'Todos'
              ? 'Actualmente no hay publicaciones disponibles. Intenta más tarde.'
              : `No hay publicaciones en ${selectedZone}. Prueba con otra zona.`
          }
          action={
            selectedZone !== 'Todos' && (
              <Button variant="outlined" onClick={() => setSelectedZone('Todos')}>
                Ver todas las zonas
              </Button>
            )
          }
        />
      )}

      <EnviarCV
        show={showModal}
        handleClose={handleCloseModal}
        publicacionId={selectedPublicacion}
        correoPublicacion={publicaciones.find(pub => pub.id === selectedPublicacion)?.email}
        onSuccess={() => handleCvEnviado(selectedPublicacion)}
      />

      <Dialog
        open={showNoPerfilModal}
        onClose={() => setShowNoPerfilModal(false)}
        PaperProps={{
          sx: { borderRadius: '20px', maxWidth: 420, p: 1 },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              backgroundColor: alpha(colors.warning, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <AlertTriangle size={32} color={colors.warning} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Perfil laboral requerido
          </Typography>
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 3, lineHeight: 1.7 }}>
            Necesitas crear tu perfil laboral antes de poder postularte a casos.
            Completá tu información profesional para que los reclutadores puedan conocerte.
          </Typography>
          <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => {
                setShowNoPerfilModal(false);
                navigate(`/editarPerfilLaboral/${auth.currentUser?.uid}`);
              }}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                px: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Crear perfil laboral
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowNoPerfilModal(false)}
              sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary }}
            >
              Ahora no
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Auth required modal */}
      <Dialog
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        PaperProps={{
          sx: { borderRadius: '20px', maxWidth: 420, p: 1 },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              backgroundColor: alpha(colors.primary, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <User size={32} color={colors.primary} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Inicia sesión
          </Typography>
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 3, lineHeight: 1.7 }}>
            Necesitás iniciar sesión o registrarte como Acompañante Terapéutico para poder postularte a los casos disponibles.
          </Typography>
          <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => {
                setShowAuthModal(false);
                navigate('/login');
              }}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                px: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setShowAuthModal(false);
                navigate('/crearCuenta');
              }}
              sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary }}
            >
              Registrarse
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Wrong role modal */}
      <Dialog
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        PaperProps={{
          sx: { borderRadius: '20px', maxWidth: 420, p: 1 },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              backgroundColor: alpha(colors.danger, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <AlertCircle size={32} color={colors.danger} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Solo para Acompañantes Terapéuticos
          </Typography>
          <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 3, lineHeight: 1.7 }}>
            Esta sección es exclusiva para Acompañantes Terapéuticos. Si querés publicar un caso o buscar profesionales, podés hacerlo desde la sección correspondiente.
          </Typography>
          <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => {
                setShowRoleModal(false);
                navigate('/buscar-acompanante');
              }}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                px: 3,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Buscar Acompañante
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowRoleModal(false)}
              sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary }}
            >
              Entendido
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const Grid3x3Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <rect x="15" y="15" width="6" height="6" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default BuscarTrabajo;
