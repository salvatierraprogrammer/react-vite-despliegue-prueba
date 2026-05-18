import React, { useEffect, useState, memo, useCallback } from 'react';
import { Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, Tabs, Tab, Menu, MenuItem, LinearProgress, Tooltip } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import { generarSlugCompleto } from '../../utils/slugUtils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Plus,
  LayoutGrid,
  List,
  LayoutList,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Sparkles,
  FileText,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Search,
  Filter,
  Download,
  Copy,
  ExternalLink,
  Image,
  Clock,
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const EmptyState = memo(({ icon: Icon, title, description, action }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
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
        color: colors.primary,
        mb: 3,
      }}
    >
      <Icon size={36} />
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3, maxWidth: 300 }}>
      {description}
    </Typography>
    {action}
  </Box>
));

const PublicationCard = memo(({ pub, onEdit, onDelete, onToggle, onView }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    elevation={0}
    sx={{
      borderRadius: '20px',
      border: `1px solid ${colors.border}`,
      bgcolor: colors.surface,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        borderColor: alpha(colors.primary, 0.3),
        boxShadow: `0 12px 32px -8px ${alpha(colors.primary, 0.12)}`,
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Avatar
          src={pub.photo}
          variant="rounded"
          sx={{
            width: { xs: 48, sm: 64 },
            height: { xs: 48, sm: 64 },
            borderRadius: { xs: '12px', sm: '16px' },
            border: `2px solid ${alpha(colors.primary, 0.1)}`,
          }}
        >
          {pub.cliente?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 0.5 }} noWrap>
            {pub.paciente || pub.cliente}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={pub.zona || 'CABA'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                bgcolor: alpha(colors.primary, 0.08),
                color: colors.primary,
              }}
            />
            <Chip
              label={pub.estado || 'Disponible'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                bgcolor: alpha(colors.success, 0.1),
                color: colors.success,
              }}
            />
            {pub.cliente && (
              <Typography variant="caption" sx={{ color: colors.textMuted, alignSelf: 'center' }}>
                {pub.cliente}
              </Typography>
            )}
          </Box>
        </Box>
        <MenuTrigger pub={pub} onEdit={onEdit} onDelete={onDelete} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        <InfoItem icon={FileText} label="Paciente" value={pub.paciente} />
        <InfoItem icon={Calendar} label="Edad" value={pub.edad} />
        <InfoItem icon={MapPin} label="Localidad" value={pub.localidad} />
        <InfoItem icon={Sparkles} label="Diagnóstico" value={pub.diagnostico} />
      </Box>

      {pub.descripcion && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>
            Descripción
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textPrimary, lineHeight: 1.5 }}>
            {pub.descripcion.length > 100 ? `${pub.descripcion.substring(0, 100)}...` : pub.descripcion}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: pub.sexo === 'Femenino' ? alpha(colors.secondary, 0.1) : alpha(colors.primary, 0.1),
              color: pub.sexo === 'Femenino' ? colors.secondary : colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {pub.sexo?.charAt(0)}
          </Box>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {pub.sexo}
          </Typography>
        </Box>
        <Button
          variant="text"
          size="small"
          endIcon={<ChevronRight size={14} />}
          onClick={onView}
          sx={{ color: colors.primary }}
        >
          Ver más
        </Button>
      </Box>
    </Box>

    <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${colors.border}`, bgcolor: alpha(colors.background, 0.5), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Chip
        icon={pub.estado === 'Disponible' ? <CheckCircle size={12} /> : <XCircle size={12} />}
        label={pub.estado === 'Disponible' ? 'Activo' : 'Inactivo'}
        size="small"
        onClick={() => onToggle(pub.id, pub.estado)}
        clickable
        sx={{
          bgcolor: alpha(pub.estado === 'Disponible' ? colors.success : colors.textSecondary, 0.1),
          color: pub.estado === 'Disponible' ? colors.success : colors.textSecondary,
          fontWeight: 500,
          '&:hover': {
            bgcolor: alpha(pub.estado === 'Disponible' ? colors.success : colors.textSecondary, 0.2),
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Generar Flyer">
          <IconButton
            size="small"
            onClick={() => window.location.href = `/generarFlyer/${pub.id}`}
            sx={{ color: colors.warning }}
          >
            <Download size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver caso">
          <IconButton size="small" onClick={onView} sx={{ color: colors.primary }}>
            <Eye size={16} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  </Paper>
));

const PublicationList = memo(({ pub, onEdit, onDelete, onToggle, onView }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    elevation={0}
    sx={{
      borderRadius: '16px',
      border: `1px solid ${colors.border}`,
      bgcolor: colors.surface,
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2.5,
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: alpha(colors.primary, 0.3),
        bgcolor: alpha(colors.primary, 0.01),
      },
    }}
  >
    <Avatar src={pub.photo} variant="rounded" sx={{ width: 56, height: 56, borderRadius: '14px' }}>
      {(pub.paciente || pub.cliente)?.charAt(0)}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }} noWrap>
        {pub.paciente || pub.cliente}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          {pub.diagnostico}
        </Typography>
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: colors.textMuted }} />
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          {pub.localidad}
        </Typography>
        {pub.cliente && (
          <>
            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: colors.textMuted }} />
            <Typography variant="caption" sx={{ color: colors.textMuted }}>
              {pub.cliente}
            </Typography>
          </>
        )}
      </Box>
    </Box>
    <Chip
      label={pub.zona}
      size="small"
      sx={{ display: { xs: 'none', sm: 'flex' }, bgcolor: alpha(colors.primary, 0.06), color: colors.primary }}
    />
    <Chip
      label={pub.estado}
      size="small"
      onClick={() => onToggle(pub.id, pub.estado)}
      clickable
      sx={{
        bgcolor: alpha(pub.estado === 'Disponible' ? colors.success : colors.textSecondary, 0.1),
        color: pub.estado === 'Disponible' ? colors.success : colors.textSecondary,
        fontWeight: 500,
      }}
    />
    <IconButton onClick={onView} sx={{ color: colors.textSecondary }}>
      <ChevronRight size={18} />
    </IconButton>
  </Paper>
));

const MenuTrigger = memo(({ pub, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: colors.textSecondary }}>
        <MoreVertical size={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: '14px', minWidth: 160 } }}
      >
        <MenuItem onClick={() => { onEdit(pub.id); setAnchorEl(null); }} sx={{ gap: 1.5 }}>
          <Edit size={16} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { onDelete(pub.id); setAnchorEl(null); }} sx={{ gap: 1.5, color: colors.danger }}>
          <Trash2 size={16} /> Eliminar
        </MenuItem>
      </Menu>
    </>
  );
});

const InfoItem = memo(({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: alpha(colors.primary, 0.06), color: colors.primary }}>
      <Icon size={14} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }} noWrap>
        {value || '-'}
      </Typography>
    </Box>
  </Box>
));

const SearchBar = ({ value, onChange, placeholder }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.25,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.surface,
      transition: 'all 0.2s ease',
      '&:focus-within': {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.08)}`,
      },
    }}
  >
    <Search size={18} color={colors.textMuted} />
    <Box
      component="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '0.875rem',
        backgroundColor: 'transparent',
        '&::placeholder': { color: colors.textMuted },
      }}
    />
  </Box>
);

export const MisPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyOnly, setShowMyOnly] = useState(false);
  const navigate = useNavigate();

  const fetchPublicaciones = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDocs(collection(db, 'usuarios'));
      const userData = userDoc.docs.find(d => d.id === user.uid)?.data();
      if (!userData) return;

      setUserRol(userData.userRol);

      if (userData.userRol === 'reclutador' || userData.userRol === 'administrador' || userData.userRol === 'familiar') {
        const pubSnap = await getDocs(collection(db, 'publicaciones'));
        const rawPubs = pubSnap.docs
          .filter(d => userData.userRol === 'administrador' || d.data().userId === user.uid)
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aTime = a.fechaCreacion?.seconds || a.fechaCreacion?.getTime?.() || 0;
            const bTime = b.fechaCreacion?.seconds || b.fechaCreacion?.getTime?.() || 0;
            return bTime - aTime;
          });
        const slugWrites = [];
        for (const p of rawPubs) {
          if (!p.slug && p.id) {
            const slug = generarSlugCompleto(p.cliente, p.localidad, p.id, p.diagnostico);
            const shortId = slug.split('-').pop();
            slugWrites.push(
              updateDoc(doc(db, 'publicaciones', p.id), { slug, shortId })
                .then(() => { p.slug = slug; })
                .catch(() => {})
            );
          }
        }
        await Promise.all(slugWrites);
        setPublicaciones(rawPubs);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  const handleActivar = async (id, currentEstado) => {
    const newEstado = currentEstado === 'Disponible' ? 'No disponible' : 'Disponible';
    await updateDoc(doc(db, 'publicaciones', id), { estado: newEstado });
    setPublicaciones(prev => prev.map(pub => pub.id === id ? { ...pub, estado: newEstado } : pub));
  };

  const handleEliminar = async (id) => {
    const result = await MySwal.fire({
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      cancelButtonColor: colors.textSecondary,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, 'publicaciones', id));
      setPublicaciones(prev => prev.filter(pub => pub.id !== id));
      MySwal.fire('¡Eliminado!', 'La publicación ha sido eliminada.', 'success');
    }
  };

  const allPublicaciones = publicaciones;
  const user = auth.currentUser;
  const displayPubs = userRol === 'administrador' && showMyOnly
    ? allPublicaciones.filter(p => p.userId === user?.uid)
    : allPublicaciones;

  const filteredPublicaciones = displayPubs.filter(pub =>
    pub.cliente?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.localidad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pub.diagnostico?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingPage />;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ maxWidth: 1400, mx: 'auto' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
            {userRol === 'administrador' ? 'Todas las Publicaciones' : 'Mis Publicaciones'}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {userRol === 'administrador' 
              ? `${allPublicaciones.length} publicación${allPublicaciones.length !== 1 ? 'es' : ''}${showMyOnly ? ` (${displayPubs.length} mías)` : ''}`
              : `${publicaciones.length} publicación${publicaciones.length !== 1 ? 'es' : ''} creada${publicaciones.length !== 1 ? 's' : ''}`
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: colors.textSecondary }}>
            <ArrowLeft size={20} />
          </IconButton>
          {userRol === 'reclutador' || userRol === 'administrador' || userRol === 'familiar' ? (
            <Button
              component={Link}
              to="/nuevaPublicacion"
              variant="contained"
              startIcon={<Plus size={18} />}
              sx={{ borderRadius: '12px' }}
            >
              Nueva Publicación
            </Button>
          ) : null}
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por cliente, localidad o diagnóstico..." />
          {userRol === 'administrador' && (
            <Chip
              label={showMyOnly ? 'Mis publicaciones' : 'Todas'}
              icon={<Filter size={14} />}
              size="small"
              onClick={() => setShowMyOnly(!showMyOnly)}
              sx={{
                height: 32, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: showMyOnly ? alpha(colors.primary, 0.1) : 'transparent',
                color: showMyOnly ? colors.primary : colors.textSecondary,
                border: `1px solid ${showMyOnly ? colors.primary : colors.border}`,
              }}
            />
          )}
          <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
            {[0, 1, 2].map((mode) => (
              <IconButton
                key={mode}
                onClick={() => setViewMode(mode)}
                sx={{
                  borderRadius: '10px',
                  bgcolor: viewMode === mode ? alpha(colors.primary, 0.08) : 'transparent',
                  color: viewMode === mode ? colors.primary : colors.textSecondary,
                  '&:hover': { bgcolor: alpha(colors.primary, 0.06) },
                }}
              >
                {mode === 0 ? <LayoutGrid size={18} /> : mode === 1 ? <LayoutList size={18} /> : <List size={18} />}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Paper>

      {filteredPublicaciones.length > 0 ? (
        <AnimatePresence mode="wait">
          {viewMode === 0 ? (
            <Grid container spacing={3}>
              {filteredPublicaciones.map((pub, index) => (
                <Grid item xs={12} md={6} lg={4} key={pub.id}>
                  <PublicationCard
                    pub={pub}
                    onEdit={(id) => navigate(`/editar-publicacion/${id}`)}
                    onDelete={handleEliminar}
                    onToggle={handleActivar}
                    onView={() => navigate(pub.slug ? `/ver-caso/${pub.slug}` : `/ver-caso/${pub.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : viewMode === 1 ? (
            <Grid container spacing={2}>
              {filteredPublicaciones.map((pub) => (
                <Grid item xs={12} key={pub.id}>
                  <PublicationCard
                    pub={pub}
                    onEdit={(id) => navigate(`/editar-publicacion/${id}`)}
                    onDelete={handleEliminar}
                    onToggle={handleActivar}
                    onView={() => navigate(pub.slug ? `/ver-caso/${pub.slug}` : `/ver-caso/${pub.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredPublicaciones.map((pub) => (
                <PublicationList
                  key={pub.id}
                  pub={pub}
                  onEdit={(id) => navigate(`/editar-publicacion/${id}`)}
                  onDelete={handleEliminar}
                  onToggle={handleActivar}
                  onView={() => navigate(pub.slug ? `/ver-caso/${pub.slug}` : `/ver-caso/${pub.id}`)}
                />
              ))}
            </Box>
          )}
        </AnimatePresence>
      ) : (
        <EmptyState
          icon={FileText}
          title="Sin publicaciones"
          description="Aún no has creado ninguna publicación. ¡Comienza ahora!"
          action={
            userRol === 'reclutador' || userRol === 'administrador' || userRol === 'familiar' ? (
              <Button component={Link} to="/nuevaPublicacion" startIcon={<Plus size={18} />}>
                Crear primera publicación
              </Button>
            ) : null
          }
        />
      )}
    </Box>
  );
};

export default MisPublicaciones;