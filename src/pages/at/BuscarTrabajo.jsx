import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Card, CardContent, CardActions, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton, alpha, Badge, Tabs, Tab, Alert, Stack, Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { generarSlugCompleto, generarShortId } from '../../utils/slugUtils';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import EnviarCV from '../../components/EnviarCV';
import {
  Search, MapPin, Clock, Phone, Mail, Heart,
  Send, Filter, Briefcase, User, Star, Calendar,
  Eye, ChevronRight, Sparkles, MapPinned,
  Building2, CheckCircle, XCircle, DollarSign,
  FileText, AlertCircle, SlidersHorizontal, AlertTriangle,
  TrendingUp
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

const zonaColors = {
  'CABA': { color: '#6C4CF1', bg: alpha('#6C4CF1', 0.08), border: alpha('#6C4CF1', 0.15) },
  'Zona Norte': { color: '#10B981', bg: alpha('#10B981', 0.08), border: alpha('#10B981', 0.15) },
  'Zona Sur': { color: '#F59E0B', bg: alpha('#F59E0B', 0.08), border: alpha('#F59E0B', 0.15) },
  'Zona Oeste': { color: '#8B5CF6', bg: alpha('#8B5CF6', 0.08), border: alpha('#8B5CF6', 0.15) },
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

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
        const pubs = pubsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const slugWrites = [];
        for (const p of pubs) {
          if (!p.slug && p.id) {
            const slug = generarSlugCompleto(p.cliente, p.localidad, p.id, p.diagnostico);
            const shortId = generarShortId(p.id);
            slugWrites.push(
              updateDoc(doc(db, 'publicaciones', p.id), { slug, shortId })
                .then(() => { p.slug = slug; })
                .catch(() => {})
            );
          }
        }
        await Promise.all(slugWrites);
        setPublicaciones(pubs);

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
        <Grid container spacing={2.5}>
          {publicacionesDisponibles.map((pub, index) => {
            const zoneStyle = zonaColors[pub.zona] || { color: '#6C4CF1', bg: alpha('#6C4CF1', 0.08), border: alpha('#6C4CF1', 0.15) };
            const timeAgo = getTimeAgo(pub.fechaCreacion);
            return (
            <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} key={pub.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.surface,
                  position: 'relative',
                  overflow: 'visible',
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: zoneStyle.color,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 16px 32px -8px ${alpha(zoneStyle.color, 0.12)}`,
                    '& .card-zone-bar': { opacity: 1 },
                  },
                }}
              >
                <Box className="card-zone-bar" sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  bgcolor: zoneStyle.color, opacity: 0,
                  transition: 'opacity 0.3s ease',
                  borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                }} />

                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Avatar
                      src={pub.photo}
                      sx={{
                        width: 44, height: 44,
                        border: `2px solid ${alpha(zoneStyle.color, 0.2)}`,
                        fontSize: '1rem', fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {pub.cliente?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                        <Typography sx={{
                          fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3,
                          color: colors.textPrimary, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {pub.cliente || pub.titulo}
                        </Typography>
                        <Box sx={{
                          width: 4, height: 4, borderRadius: '50%',
                          bgcolor: colors.textMuted, flexShrink: 0,
                        }} />
                        <Typography sx={{
                          color: colors.textMuted, fontSize: '0.75rem',
                          fontWeight: 450, whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {timeAgo}
                        </Typography>
                      </Stack>
                      <Typography sx={{
                        color: colors.textMuted, fontSize: '0.8125rem',
                        fontWeight: 450,
                      }}>
                        {pub.edad ? `${pub.edad} a\u00f1os \u2022 ${pub.sexo}` : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={pub.zona || pub.estado || 'Activa'}
                      size="small"
                      sx={{
                        bgcolor: zoneStyle.bg,
                        color: zoneStyle.color,
                        fontWeight: 600,
                        fontSize: '0.6875rem',
                        height: 24,
                        borderRadius: '6px',
                        border: `1px solid ${zoneStyle.border}`,
                        flexShrink: 0,
                        mt: 0.25,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{
                        width: 24, height: 24, borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(colors.primary, 0.06), flexShrink: 0,
                      }}>
                        <MapPinned size={12} color={colors.textSecondary} />
                      </Box>
                      <Typography sx={{
                        color: colors.textSecondary, fontSize: '0.8125rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {pub.localidad}
                      </Typography>
                    </Stack>
                    {pub.diagnostico && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: alpha(colors.primary, 0.06), flexShrink: 0,
                        }}>
                          <FileText size={12} color={colors.textSecondary} />
                        </Box>
                        <Typography sx={{
                          color: colors.textSecondary, fontSize: '0.8125rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {pub.diagnostico}
                        </Typography>
                      </Stack>
                    )}
                    {pub.horario && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: alpha(colors.primary, 0.06), flexShrink: 0,
                        }}>
                          <Clock size={12} color={colors.textSecondary} />
                        </Box>
                        <Typography sx={{
                          color: colors.textSecondary, fontSize: '0.8125rem',
                        }}>
                          {pub.horario}
                        </Typography>
                      </Stack>
                    )}
                    {pub.remuneracion && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: alpha('#10B981', 0.08), flexShrink: 0,
                        }}>
                          <TrendingUp size={12} color="#10B981" />
                        </Box>
                        <Typography sx={{
                          fontWeight: 600, color: '#10B981', fontSize: '0.8125rem',
                        }}>
                          {pub.remuneracion}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {pub.descripcion && (
                    <Typography sx={{
                      color: colors.textSecondary,
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {pub.descripcion}
                    </Typography>
                  )}

                  {pub.etiquetas?.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                      {pub.etiquetas.map((tag, i) => (
                        <Chip
                          key={i}
                          label={tag}
                          size="small"
                          sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            height: 22,
                            borderRadius: '4px',
                            bgcolor: alpha(colors.primary, 0.04),
                            color: colors.textMuted,
                            border: `1px solid ${alpha(colors.border, 0.5)}`,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </CardContent>

                <Divider sx={{ mx: 2.5, borderColor: alpha(colors.border, 0.5) }} />

                <Box sx={{ px: 2.5, py: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Eye size={15} />}
                      onClick={() => navigate(pub.slug ? `/ver-caso/${pub.slug}` : `/ver-caso/${pub.id}`)}
                      sx={{
                        color: colors.textMuted,
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                        borderRadius: '8px',
                        px: 1.5,
                        minHeight: 34,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(colors.primary, 0.06),
                          color: colors.primary,
                        },
                      }}
                    >
                      Ver detalle
                    </Button>

                    <Box sx={{ flex: 1 }} />

                    {cvEnviado[pub.id] ? (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        px: 1.5, py: 0.625, borderRadius: '8px',
                        bgcolor: alpha('#10B981', 0.08),
                        border: `1px solid ${alpha('#10B981', 0.2)}`,
                      }}>
                        <CheckCircle size={14} color="#10B981" />
                        <Typography sx={{ fontWeight: 600, color: '#10B981', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          Postulado
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<Send size={14} />}
                        onClick={() => handleShowModal(pub.id)}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          minHeight: 34,
                          px: 2,
                          bgcolor: '#6C4CF1',
                          color: '#fff',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#5B3FE0',
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha('#6C4CF1', 0.3)}`,
                          },
                        }}
                      >
                        Postularme
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Card>
            </Grid>
            );
          })}
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
