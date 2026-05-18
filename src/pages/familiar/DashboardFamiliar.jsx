import { useEffect, useState, memo, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, Stack, Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  Briefcase, MapPin, Eye, Clock, Search, Plus,
  Users, MessageCircle, User, Home, ChevronRight,
  FileText, Sparkles, ArrowRight, Star, Shield
} from 'lucide-react';

const StatCard = memo(({ icon, title, value, color, subtitle }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    elevation={0}
    sx={{
      p: 3, borderRadius: '20px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 12px 32px -8px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <Box sx={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
    }} />
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: '14px',
        backgroundColor: alpha(color, 0.1), display: 'flex',
        alignItems: 'center', justifyContent: 'center', color,
        transition: 'transform 0.3s ease',
        '&:hover': { transform: 'scale(1.05)' },
      }}>
        {icon}
      </Box>
      {subtitle && (
        <Chip label={subtitle} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontSize: '0.7rem', fontWeight: 600 }} />
      )}
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.03em' }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>{title}</Typography>
  </Paper>
));

const CasoCard = memo(({ caso, onView }) => (
  <Paper
    elevation={0}
    component={motion.div}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    sx={{
      p: { xs: 2, sm: 3 }, borderRadius: '16px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, cursor: 'pointer', transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: colors.primary, transform: 'translateY(-2px)',
        boxShadow: `0 8px 24px -6px ${alpha(colors.primary, 0.1)}`,
      },
    }}
    onClick={() => onView(caso)}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.75, fontSize: { xs: '0.875rem', sm: '1rem' }, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {caso.paciente || caso.titulo || 'Sin nombre'}
        </Typography>
        {caso.codigo && (
          <Chip
            label={caso.codigo}
            size="small"
            sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700, borderRadius: '4px', bgcolor: alpha(colors.primary, 0.08), color: colors.primary, mb: 1, letterSpacing: '0.04em' }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MapPin size={13} color={colors.textMuted} />
          <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>{caso.localidad || caso.zona || 'Sin ubicación'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={caso.estado === 'Disponible' ? 'Abierto' : caso.estado || 'Abierto'}
            size="small"
            sx={{
              height: 22, fontSize: '0.6875rem', fontWeight: 600,
              bgcolor: alpha(caso.estado === 'Disponible' ? colors.success : colors.warning, 0.1),
              color: caso.estado === 'Disponible' ? colors.success : colors.warning,
            }}
          />
          {(caso.fechaPublicacion || caso.fechaCreacion) && (
            <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
              {(() => {
                const ts = caso.fechaPublicacion || caso.fechaCreacion;
                const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : new Date(ts?.seconds ? ts.seconds * 1000 : ts);
                return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
              })()}
            </Typography>
          )}
        </Box>
      </Box>
      <IconButton size="small" sx={{ color: colors.textMuted, alignSelf: 'center', '&:hover': { color: colors.primary, bgcolor: alpha(colors.primary, 0.06) } }}>
        <ChevronRight size={18} />
      </IconButton>
    </Box>
    {caso.descripcion && (
      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.75rem', lineHeight: 1.5 }} noWrap>
        {caso.descripcion}
      </Typography>
    )}
  </Paper>
));

const AcompananteMiniCard = memo(({ at, onView, onContact }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2.5 }, borderRadius: '16px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 },
      cursor: 'pointer', transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.02),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 16px -4px ${alpha(colors.primary, 0.08)}`,
      },
    }}
    onClick={() => onView(at)}
  >
    <Avatar
      src={typeof at.images === 'string' ? at.images : at.images?.[0] || at.photo}
      sx={{
        width: { xs: 36, sm: 44 }, height: { xs: 36, sm: 44 },
        fontSize: { xs: '0.8125rem', sm: '1rem' },
        bgcolor: alpha(colors.primary, 0.1), color: colors.primary,
        border: `2px solid ${alpha(colors.primary, 0.1)}`,
      }}
    >
      {at.nombreCompleto?.[0]}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontFamily: '"Plus Jakarta Sans", sans-serif' }} noWrap>
        {at.nombreCompleto || 'Sin nombre'}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem', display: 'block' }}>
        {at.titulo || 'Acompañante Terapéutico'}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>
        {at.zona || at.localidad || 'Sin ubicación'}
      </Typography>
    </Box>
    {at.telefono && (
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); onContact(at); }}
        sx={{
          color: '#25D366', bgcolor: alpha('#25D366', 0.1), width: 32, height: 32,
          '&:hover': { bgcolor: alpha('#25D366', 0.2) },
        }}
      >
        <MessageCircle size={14} />
      </IconButton>
    )}
  </Paper>
));

function formatWhatsAppNumber(phone) {
  const clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('549')) return clean;
  if (clean.startsWith('54')) return '549' + clean.slice(2);
  if (clean.startsWith('0')) return '549' + clean.slice(1);
  return '549' + clean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const DashboardFamiliar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [misCasos, setMisCasos] = useState([]);
  const [acompanantes, setAcompanantes] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const casosSnap = await getDocs(query(
        collection(db, 'publicaciones'),
        where('userId', '==', user?.uid)
      ));
      const casosData = casosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.fechaPublicacion?.seconds || a.fechaCreacion?.seconds || 0;
          const bTime = b.fechaPublicacion?.seconds || b.fechaCreacion?.seconds || 0;
          return bTime - aTime;
        });

      const atSnap = await getDocs(collection(db, 'perfilLaboral'));
      const atData = atSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setMisCasos(casosData);
      setAcompanantes(atData.filter(a => a.estado === 'Disponible' || !a.estado));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    totalCasos: misCasos.length,
    activos: misCasos.filter(c => c.estado === 'Disponible' || c.estado === 'abierta').length,
    atsDisponibles: acompanantes.length,
    vistas: misCasos.reduce((acc, c) => acc + (c.vistas || 0), 0),
  };

  if (loading) return <LoadingPage />;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} variants={containerVariants}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.02em', mb: 0.5 }}>
            Panel Familiar
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
            Encuentra el mejor acompañante terapéutico
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Search size={15} />}
            onClick={() => navigate('/buscar-acompanante')}
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Buscar AT
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<User size={15} />}
            onClick={() => navigate('/miCuenta')}
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Mi Perfil
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={15} />}
            onClick={() => navigate('/nuevaPublicacion')}
            disableElevation
            sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', boxShadow: `0 4px 12px ${alpha(colors.primary, 0.2)}` }}
          >
            Publicar Caso
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard icon={<Briefcase size={20} />} title="Casos publicados" value={stats.totalCasos} color={colors.primary} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<Clock size={20} />} title="Casos activos" value={stats.activos} color={colors.success} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<Users size={20} />} title="ATs disponibles" value={stats.atsDisponibles} color={colors.warning} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard icon={<Eye size={20} />} title="Vistas totales" value={stats.vistas} color={colors.secondary} />
        </Grid>
      </Grid>

      {/* Main content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color={colors.primary} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Mis Casos
                </Typography>
              </Box>
              {misCasos.length > 0 && (
                <Button
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  onClick={() => navigate('/misPublicaciones')}
                  sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  Ver todos
                </Button>
              )}
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {misCasos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: alpha(colors.primary, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                    <Home size={28} color={alpha(colors.primary, 0.3)} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5, fontSize: '0.9375rem' }}>
                    No has publicado casos aún
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2.5, maxWidth: 300, mx: 'auto', fontSize: '0.8125rem' }}>
                    Publicá tu primer caso y empezá a encontrar al acompañante ideal para tu familiar
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Sparkles size={16} />}
                    onClick={() => navigate('/nuevaPublicacion')}
                    disableElevation
                    sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem' }}
                  >
                    Publicar primer caso
                  </Button>
                </Box>
              ) : (
                misCasos.slice(0, 4).map(caso => (
                  <CasoCard
                    key={caso.id}
                    caso={caso}
                    onView={(c) => navigate(c.slug ? `/ver-caso/${c.slug}` : `/ver-caso/${c.id}`)}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: alpha(colors.success, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color={colors.success} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9375rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                Acompañantes
              </Typography>
              {acompanantes.length > 0 && (
                <Chip label={acompanantes.length} size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700, bgcolor: alpha(colors.success, 0.1), color: colors.success }} />
              )}
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {acompanantes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: alpha(colors.warning, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                    <Users size={28} color={alpha(colors.warning, 0.3)} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5, fontSize: '0.9375rem' }}>
                    Sin acompañantes
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.75rem', maxWidth: 260, mx: 'auto' }}>
                    No hay acompañantes registrados aún. Volvé pronto.
                  </Typography>
                </Box>
              ) : (
                acompanantes.slice(0, 5).map(at => (
                  <AcompananteMiniCard
                    key={at.id}
                    at={at}
                    onView={(a) => navigate(`/perfil/${a.slug || a.id}`)}
                    onContact={(a) => {
                      const waUrl = a.telefono ? `https://wa.me/${formatWhatsAppNumber(a.telefono)}?text=${encodeURIComponent('¡Hola! 👋 Vi tu perfil en El Canal del AT. Me interesa tu perfil profesional. ¿Podemos coordinar? 😊')}` : '';
                      if (waUrl) window.open(waUrl, '_blank');
                    }}
                  />
                ))
              )}
              {acompanantes.length > 5 && (
                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Button
                    size="small"
                    endIcon={<ArrowRight size={14} />}
                    onClick={() => navigate('/buscar-acompanante')}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Ver {acompanantes.length - 5} más
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardFamiliar;
