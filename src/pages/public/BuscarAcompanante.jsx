import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Button,
  Select, MenuItem, FormControl, alpha, styled
} from '@mui/material';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import {
  MapPin, GraduationCap, Briefcase, Search,
  ChevronRight, Star, BadgeCheck, Users
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const ProfileCard = styled(Paper)({
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-6px)',
    borderColor: alpha(colors.primary, 0.25),
    boxShadow: `0 20px 48px -12px ${alpha(colors.primary, 0.15)}`,
  },
});

const CardHeader = styled(Box)({
  padding: '28px 24px 0',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
});

const CardBody = styled(Box)({
  padding: '16px 24px 24px',
});

const CardFooter = styled(Box)({
  padding: '16px 24px',
  borderTop: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: alpha(colors.background, 0.5),
});

const InfoRow = ({ icon: Icon, label, value, blurred }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '10px',
      backgroundColor: alpha(colors.primary, 0.06),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color: colors.primary,
    }}>
      <Icon size={14} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        color: colors.textPrimary, fontWeight: 500, fontSize: '0.8125rem',
        filter: blurred ? 'blur(4px)' : 'none',
        userSelect: blurred ? 'none' : 'auto',
      }} noWrap>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
);

const BuscarAcompanante = () => {
  const { userRol } = useAuth();
  const [perfilLaboral, setPerfilLaboral] = useState([]);
  const [filteredPerfilLaboral, setFilteredPerfilLaboral] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('Todos');
  const navigate = useNavigate();
  const canViewData = userRol === 'reclutador' || userRol === 'administrador';

  const perfilLaboralCollection = collection(db, 'perfilLaboral');

  const getPerfilLaboral = useCallback(async () => {
    try {
      const data = await getDocs(perfilLaboralCollection);
      const perfiles = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setPerfilLaboral(perfiles);
      setFilteredPerfilLaboral(perfiles);
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
    }
  }, [perfilLaboralCollection]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPerfilLaboral();
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getPerfilLaboral]);

  useEffect(() => {
    const filtered = perfilLaboral.filter(a =>
      selectedZone === 'Todos' || a.zona === selectedZone
    );
    setFilteredPerfilLaboral(filtered);
  }, [selectedZone, perfilLaboral]);

  const handleContactClick = (acompananteId) => {
    const user = auth.currentUser;
    if (!user) {
      MySwal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor, inicia sesión para ver el perfil del acompañante.',
        icon: 'warning',
        confirmButtonText: 'Iniciar sesión'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
    } else if (!canViewData) {
      MySwal.fire({
        title: 'Solo para reclutadores',
        text: 'Debes tener rol de reclutador para ver los datos del acompañante.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    } else {
      navigate(`/showPerfil/${acompananteId}`);
    }
  };

  if (loading) return <LoadingPage />;

  const zonas = ['Todos', ...new Set(perfilLaboral.map(a => a.zona).filter(Boolean))];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
              Buscar Acompañantes
            </Typography>
            <Chip
              label={`${filteredPerfilLaboral.length} profesionales`}
              size="small"
              sx={{
                height: 24, fontSize: '0.6875rem', fontWeight: 600,
                bgcolor: alpha(colors.primary, 0.08),
                color: colors.primary,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Encuentra profesionales certificados para el cuidado
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{
        p: 2, mb: 4, borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.textMuted }}>
          <Search size={18} />
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
            Filtrar por zona
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            sx={{
              borderRadius: '10px',
              backgroundColor: colors.surface,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
            }}
          >
            {zonas.map(z => (
              <MenuItem key={z} value={z}>{z}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
          {zonas.filter(z => z !== 'Todos').map(z => (
            <Chip
              key={z}
              label={z}
              size="small"
              onClick={() => setSelectedZone(z)}
              variant={selectedZone === z ? 'filled' : 'outlined'}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                bgcolor: selectedZone === z ? alpha(colors.primary, 0.1) : 'transparent',
                color: selectedZone === z ? colors.primary : colors.textSecondary,
                borderColor: selectedZone === z ? 'transparent' : colors.border,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(colors.primary, 0.06) },
              }}
            />
          ))}
        </Box>
      </Paper>

      {filteredPerfilLaboral.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '20px',
            backgroundColor: alpha(colors.primary, 0.06),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3, color: colors.primary,
          }}>
            <Users size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Sin resultados</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            No hay acompañantes para la zona seleccionada
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPerfilLaboral.map((a, index) => (
            <Grid item xs={12} sm={6} lg={4} key={a.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              >
                <ProfileCard elevation={0}>
                  <CardHeader>
                    <Avatar
                      src={a.images}
                      sx={{
                        width: 56, height: 56, borderRadius: '16px',
                        border: `2px solid ${alpha(colors.primary, 0.1)}`,
                        fontSize: '1.25rem', fontWeight: 700,
                        bgcolor: alpha(colors.primary, 0.08),
                        color: colors.primary,
                      }}
                    >
                      {a.nombreCompleto?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9375rem', color: colors.textPrimary }} noWrap>
                          {a.nombreCompleto}
                        </Typography>
                        {a.estado === 'Disponible' && <BadgeCheck size={14} color={colors.success} />}
                      </Box>
                      <Chip
                        label={a.estado || 'Disponible'}
                        size="small"
                        sx={{
                          height: 22, fontSize: '0.625rem', fontWeight: 600,
                          bgcolor: a.estado === 'Disponible' ? alpha(colors.success, 0.1) : alpha(colors.textMuted, 0.08),
                          color: a.estado === 'Disponible' ? colors.success : colors.textMuted,
                        }}
                      />
                    </Box>
                  </CardHeader>

                  <CardBody>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <InfoRow icon={MapPin} label="Ubicación" value={`${a.localidad || ''} ${a.zona ? `- ${a.zona}` : ''}`} blurred={!canViewData} />
                      <InfoRow icon={GraduationCap} label="Formación" value={a.formacion} blurred={!canViewData} />
                      <InfoRow icon={Briefcase} label="Experiencia" value={a.experiencia || a.titulo} blurred={!canViewData} />
                    </Box>
                  </CardBody>

                  <CardFooter>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star size={12} color={colors.warning} />
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                        Perfil completo
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ChevronRight size={14} />}
                      onClick={() => handleContactClick(a.id)}
                      sx={{
                        fontWeight: 600, fontSize: '0.8125rem',
                        color: colors.primary,
                        '&:hover': { gap: 0.5, backgroundColor: 'transparent', color: colors.primaryDark },
                      }}
                    >
                      Ver perfil
                    </Button>
                  </CardFooter>
                </ProfileCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BuscarAcompanante;
