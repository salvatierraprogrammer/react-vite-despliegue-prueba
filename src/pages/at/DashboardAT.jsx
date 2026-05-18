import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Divider, List, ListItem, ListItemIcon,
  ListItemText, Card, CardContent, CardActions, CircularProgress,
  FormControlLabel, Switch, Tooltip, DialogContentText, LinearProgress,
  Tabs, Tab, Stack
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, getDoc, query, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { signOut, updatePassword, deleteUser } from 'firebase/auth';
import { auth, db } from '../../firebaseConfg/firebase';
import { generarSlugCompleto, generarShortId } from '../../utils/slugUtils';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import EnviarCV from '../../components/EnviarCV';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  User, Briefcase,   Send, Eye, Star, MapPin, FileText, Calendar, Clock,
  CheckCircle, XCircle, Edit, EyeOff, TrendingUp,
  MessageCircle, Phone, Mail, Heart, Award, Globe,
  ChevronRight, Plus, Sparkles, LogOut, Shield, Users,
  Package, MapPinned,
  BadgeCheck, GraduationCap, Languages,
  Building2, DollarSign,
  Home, Grid3x3, List as ListIcon, SendHorizontal,
  FileCheck, UserCheck, SlidersHorizontal, Key, Trash2, Crown, Bell, Settings, Search, Save
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const StatCard = memo(({ icon, title, value, color, subtitle }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    elevation={0}
    sx={{
      p: 3, borderRadius: '20px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, position: 'relative', overflow: 'hidden',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(color, 0.15)}` },
      transition: 'all 0.2s ease',
    }}
  >
    <Box sx={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
    }} />
    <Box sx={{
      width: 48, height: 48, borderRadius: '14px',
      backgroundColor: alpha(color, 0.1), display: 'flex',
      alignItems: 'center', justifyContent: 'center', color, mb: 2
    }}>
      {icon}
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary }}>{title}</Typography>
    {subtitle && (
      <Chip label={subtitle} size="small" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: alpha(color, 0.1), color, fontSize: '0.65rem' }} />
    )}
  </Paper>
));

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

const InfoBadge = ({ icon, label }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
    <Box sx={{
      width: 24, height: 24, borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: alpha(colors.primary, 0.06), flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{
      color: colors.textSecondary, fontSize: '0.8125rem',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {label}
    </Typography>
  </Stack>
);

const CaseCard = memo(({ pub, sentCvs, onApply, onVerCaso }) => {
  const hasSent = sentCvs.includes(pub.id);
  const zoneStyle = zonaColors[pub.zona] || { color: '#6C4CF1', bg: alpha('#6C4CF1', 0.08), border: alpha('#6C4CF1', 0.15) };
  const timeAgo = getTimeAgo(pub.fechaCreacion);

  return (
    <Card
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surface,
        position: 'relative',
        overflow: 'visible',
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
              {pub.edad ? `${pub.edad} a\u00f1os \u2022 ${pub.sexo}` : pub.reclutadorNombre || ''}
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
          <InfoBadge icon={<MapPinned size={12} color={colors.textSecondary} />} label={pub.localidad} />
          {pub.diagnostico && (
            <InfoBadge icon={<FileText size={12} color={colors.textSecondary} />} label={pub.diagnostico} />
          )}
          {pub.horario && (
            <InfoBadge icon={<Clock size={12} color={colors.textSecondary} />} label={pub.horario} />
          )}
          {pub.remuneracion && (
            <InfoBadge icon={<TrendingUp size={12} color={colors.success} />} label={pub.remuneracion} />
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
            onClick={() => onVerCaso(pub)}
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

          {hasSent ? (
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
              onClick={() => onApply(pub)}
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
  );
});

const PostulacionCard = memo(({ postulacion, onView, onWithdraw }) => {
  const estadoColors = {
    enviada: colors.warning,
    vista: colors.primary,
    aceptada: colors.success,
    rechazada: colors.danger,
  };
  const estadoLabels = {
    enviada: 'Pendiente',
    vista: 'Revisado',
    aceptada: 'Aceptado',
    rechazada: 'Rechazado',
  };

  return (
    <Paper
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      sx={{
        p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`,
        bgcolor: colors.surface, display: 'flex', alignItems: 'center', gap: 2,
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: colors.primary, transform: 'translateX(4px)' },
      }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: '12px',
        backgroundColor: alpha(colors.primary, 0.1), display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: colors.primary,
        flexShrink: 0
      }}>
        <Briefcase size={20} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
          {postulacion.titulo || 'Oferta de trabajo'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MapPin size={12} color={colors.textMuted} />
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {postulacion.localidad}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: colors.textMuted }}>
          {postulacion.fechaEnvio ? new Date(postulacion.fechaEnvio.seconds * 1000).toLocaleDateString() : 'Fecha no disponible'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={estadoLabels[postulacion.estado] || 'Enviada'}
          size="small"
          sx={{
            bgcolor: alpha(estadoColors[postulacion.estado] || colors.warning, 0.1),
            color: estadoColors[postulacion.estado] || colors.warning,
            fontSize: '0.7rem'
          }}
        />
        <IconButton size="small" onClick={() => onView(postulacion)}>
          <Eye size={16} />
        </IconButton>
        <IconButton size="small" onClick={() => onWithdraw(postulacion.id)} sx={{ color: colors.danger }}>
          <XCircle size={16} />
        </IconButton>
      </Box>
    </Paper>
  );
});

const PerfilCompletitud = ({ porcentaje, onComplete }) => {
  const secciones = [
    { label: 'Datos personales', completo: porcentaje > 20 },
    { label: 'Foto de perfil', completo: porcentaje > 40 },
    { label: 'Especialidades', completo: porcentaje > 60 },
    { label: 'Experiencia laboral', completo: porcentaje > 80 },
    { label: 'Formación académica', completo: porcentaje >= 100 },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Completitud del Perfil</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.primary }}>{porcentaje}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={porcentaje}
        sx={{
          height: 10, borderRadius: 5, mb: 3,
          bgcolor: alpha(colors.primary, 0.1),
          '& .MuiLinearProgress-bar': {
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderRadius: 5,
          },
        }}
      />
      <List dense>
        {secciones.map((sec, i) => (
          <ListItem key={i} sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {sec.completo ? (
                <CheckCircle size={16} color={colors.success} />
              ) : (
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${colors.border}` }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={sec.label}
              primaryTypographyProps={{ variant: 'body2', color: sec.completo ? colors.textPrimary : colors.textMuted }}
            />
          </ListItem>
        ))}
      </List>
      <Button
        fullWidth
        variant={porcentaje < 100 ? 'contained' : 'outlined'}
        startIcon={porcentaje < 100 ? <Edit size={14} /> : <CheckCircle size={14} />}
        onClick={onComplete}
        sx={{ mt: 2 }}
      >
        {porcentaje < 100 ? 'Completar perfil' : 'Perfil completo'}
      </Button>
    </Paper>
  );
};

const DashboardAT = () => {
  const { user, userData, userRol } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [perfilLaboral, setPerfilLaboral] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({ cvsEnviados: 0, entrevistas: 0, ofertas: 0, visitas: 0 });

  const [showModal, setShowModal] = useState(false);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState({ nombre: '', apellido: '', phoneNumber: '' });
  const [newPassword, setNewPassword] = useState('');

  const fetchData = useCallback(async () => {
    try {
      if (user) {
        const perfilSnap = await getDocs(query(
          collection(db, 'perfilLaboral'),
          where('userId', '==', user.uid)
        ));
        if (!perfilSnap.empty) {
          setPerfilLaboral({ id: perfilSnap.docs[0].id, ...perfilSnap.docs[0].data() });
        } else {
          const perfilDoc = await getDoc(doc(db, 'perfilLaboral', user.uid));
          if (perfilDoc.exists()) {
            setPerfilLaboral({ id: perfilDoc.id, ...perfilDoc.data() });
          } else {
            setPerfilLaboral(null);
          }
        }

        const postSnap = await getDocs(query(
          collection(db, 'mailEnviadosPostulado'),
          where('userIdUsers', '==', user.uid)
        ));
        setPostulaciones(postSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }

      const pubsSnap = await getDocs(collection(db, 'publicaciones'));
      const pubs = pubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      pubs.sort((a, b) => {
        const aTime = a.fechaCreacion?.seconds || a.fechaCreacion?.getTime?.() || 0;
        const bTime = b.fechaCreacion?.seconds || b.fechaCreacion?.getTime?.() || 0;
        return bTime - aTime;
      });
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

      setStats({
        cvsEnviados: postulaciones.length,
        entrevistas: Math.floor(Math.random() * 5),
        ofertas: Math.floor(Math.random() * 3),
        visitas: perfilLaboral?.visitas || 0,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sentCvIds = postulaciones.map(p => p.userIdPublicacion).filter(Boolean);

  const handleApply = (pub) => {
    if (!user) {
      MySwal.fire({ title: 'Error', text: 'Debes iniciar sesión para enviar tu CV', icon: 'error' });
      return;
    }
    setSelectedPublicacion(pub.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPublicacion(null);
  };

  const handleCvEnviado = () => {
    fetchData();
  };

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
    });
    if (result.isConfirmed) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const handleEditAccount = async () => {
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), updatedUserData);
      MySwal.fire({ title: '¡Actualizado!', text: 'Tus datos han sido actualizados correctamente', icon: 'success' });
      setShowEditModal(false);
    } catch (error) {
      MySwal.fire({ title: 'Error', text: 'No se pudo actualizar los datos', icon: 'error' });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      MySwal.fire({ title: 'Error', text: 'La contraseña debe tener al menos 6 caracteres', icon: 'error' });
      return;
    }
    try {
      await updatePassword(user, newPassword);
      MySwal.fire({ title: '¡Contraseña cambiada!', text: 'Tu contraseña ha sido actualizada', icon: 'success' });
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      MySwal.fire({ title: 'Error', text: 'No se pudo cambiar la contraseña', icon: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    const result = await MySwal.fire({
      title: '¿Estás seguro?',
      html: '<p>Esta acción eliminará permanentemente tu cuenta y todos tus datos.<br/><strong>No podrás revertir esta acción.</strong></p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar mi cuenta',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'usuarios', user.uid));
        await deleteUser(user);
        MySwal.fire({ title: 'Cuenta eliminada', text: 'Tu cuenta ha sido eliminada', icon: 'success' });
        navigate('/');
      } catch (error) {
        MySwal.fire({ title: 'Error', text: 'No se pudo eliminar la cuenta', icon: 'error' });
      }
    }
  };

  const activePublicaciones = publicaciones.filter(p => p.estado === 'Activa' || p.estado === 'Disponible');

  if (loading) return <LoadingPage />;

  const perfilCompletitud = perfilLaboral ? (() => {
    let count = 0;
    if (perfilLaboral.nombreCompleto) count += 20;
    if (perfilLaboral.images) count += 20;
    if (perfilLaboral.experiencia) count += 20;
    if (perfilLaboral.formacion) count += 20;
    if (perfilLaboral.localidad) count += 20;
    return count;
  })() : 0;
  const isPremium = userData?.plan === 'premium' || userData?.isPremium;

return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Panel del Acompañante
            </Typography>
            {isPremium && (
              <Chip icon={<Crown size={14} />} label="Premium" size="small" sx={{ bgcolor: alpha(colors.warning, 0.1), color: colors.warning }} />
            )}
          </Box>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Gestiona tu perfil, postulaciones y encuentra oportunidades
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<User size={16} />} onClick={() => navigate('/miCuenta')}>
            Mi Cuenta
          </Button>
          <Button variant="contained" startIcon={<Briefcase size={16} />} onClick={() => setTabValue(2)}>
            Ver Ofertas ({activePublicaciones.length})
          </Button>
        </Box>
      </Box>



      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${colors.border}` }}
      >
        <Tab label="Inicio" icon={<Home size={16} />} iconPosition="start" />
        <Tab label="Mis Postulaciones" icon={<Send size={16} />} iconPosition="start" />
        <Tab label="Casos Disponibles" icon={<Briefcase size={16} />} iconPosition="start" />
        <Tab label="Mi Perfil" icon={<User size={16} />} iconPosition="start" />
      </Tabs>

      <AnimatePresence mode="wait">
        {tabValue === 0 && (
          <motion.div key="tab-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Últimos Casos Subidos</Typography>
                  <Chip label="Más recientes" size="small" icon={<Clock size={12} />} sx={{ ml: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => setViewMode('grid')} sx={{ bgcolor: viewMode === 'grid' ? alpha(colors.primary, 0.1) : 'transparent' }}>
                      <Grid3x3 size={16} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setViewMode('list')} sx={{ bgcolor: viewMode === 'list' ? alpha(colors.primary, 0.1) : 'transparent' }}>
                      <ListIcon size={16} />
                    </IconButton>
                  </Box>
                </Box>

                {activePublicaciones.length === 0 ? (
                  <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
                    <Briefcase size={48} color={colors.textMuted} />
                    <Typography variant="h6" sx={{ mt: 2 }}>No hay casos disponibles</Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Próximamente se agregarán nuevas ofertas
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2.5}>
                    {activePublicaciones.slice(0, 6).map(pub => (
                      <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 6 : 12} key={pub.id}>
                        <CaseCard pub={pub} sentCvs={sentCvIds} onApply={handleApply} onVerCaso={(p) => navigate(p.slug ? `/ver-caso/${p.slug}` : `/ver-caso/${p.id}`)} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12} lg={4}>
                <PerfilCompletitud porcentaje={perfilCompletitud} onComplete={() => navigate(`/editarPerfilLaboral/${user?.uid}`)} />

                <Paper elevation={0} sx={{ mt: 3, p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Acciones Rápidas</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button fullWidth variant="outlined" startIcon={<Send size={16} />} onClick={() => setTabValue(2)}>
                      Ver casos ({activePublicaciones.length})
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<FileCheck size={16} />} onClick={() => setTabValue(1)}>
                      Mis postulaciones ({postulaciones.length})
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<Eye size={16} />} onClick={() => setTabValue(3)}>
                      Ver/Editar perfil
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<Settings size={16} />} onClick={() => navigate('/miCuenta')}>
                      Mi cuenta
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div key="tab-postulaciones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {postulaciones.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
                <Send size={48} color={colors.textMuted} />
                <Typography variant="h6" sx={{ mt: 2 }}>Sin postulaciones</Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Explora los casos disponibles y envía tu CV
                </Typography>
                <Button variant="contained" onClick={() => setTabValue(2)} sx={{ mt: 2 }}>
                  Ver casos
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {postulaciones.map(post => (
                  <PostulacionCard
                    key={post.id}
                    postulacion={post}
                    onView={() => console.log('view', post.id)}
                    onWithdraw={async (id) => {
                      if (await MySwal.fire({ title: '¿Retirar postulación?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí' }).then(r => r.isConfirmed)) {
                        await deleteDoc(doc(db, 'mailEnviadosPostulado', id));
                        fetchData();
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </motion.div>
        )}

        {tabValue === 2 && (
          <motion.div key="tab-casos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Buscar casos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color={colors.textMuted} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, maxWidth: 400 }}
              />
              <Button variant="outlined" startIcon={<SlidersHorizontal size={16} />}>
                Filtros
              </Button>
            </Box>

            <Grid container spacing={2.5}>
              {activePublicaciones.map(pub => (
                <Grid item xs={12} sm={6} lg={4} key={pub.id}>
                  <CaseCard pub={pub} sentCvs={sentCvIds} onApply={handleApply} onVerCaso={(p) => navigate(p.slug ? `/ver-caso/${p.slug}` : `/ver-caso/${p.id}`)} />
                </Grid>
              ))}
            </Grid>

            {activePublicaciones.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Briefcase size={48} color={colors.textMuted} />
                <Typography variant="h6" sx={{ mt: 2 }}>No hay casos disponibles</Typography>
              </Box>
            )}
          </motion.div>
        )}

        {tabValue === 3 && (
          <motion.div key="tab-perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                {perfilLaboral ? (
                  <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                    <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                      <Avatar src={perfilLaboral.images} sx={{ width: 80, height: 80 }}>
                        {perfilLaboral.nombreCompleto?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{perfilLaboral.nombreCompleto}</Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>Acompañante Terapéutico</Typography>
                        <Chip label={perfilLaboral.estado === 'Disponible' ? 'Disponible' : 'Consultar'} size="small" color={perfilLaboral.estado === 'Disponible' ? 'success' : 'warning'} sx={{ mt: 1 }} />
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Localidad</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.localidad || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Zona</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.zona || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Experiencia</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.experiencia || 'Sin especificar'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Formación</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.formacion || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Teléfono</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.telefono || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{perfilLaboral.email || '-'}</Typography>
                      </Grid>
                    </Grid>
                    {perfilLaboral.sobreMi && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>Sobre mí</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>{perfilLaboral.sobreMi}</Typography>
                      </>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button variant="contained" startIcon={<Edit size={16} />} onClick={() => navigate(`/editarPerfilLaboral/${user?.uid}`)}>
                        Editar Perfil
                      </Button>
                      <Button variant="outlined" startIcon={<Eye size={16} />} onClick={() => navigate('/perfilLaboralUpdate')}>
                        Vista Previa
                      </Button>
                    </Box>
                  </Paper>
                ) : (
                  <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', textAlign: 'center' }}>
                    <User size={48} color={colors.textMuted} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Aún no tienes un perfil laboral</Typography>
                    <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate(`/editarPerfilLaboral/${user?.uid}`)} sx={{ mt: 2 }}>
                      Crear Perfil
                    </Button>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12} lg={4}>
                <PerfilCompletitud porcentaje={perfilCompletitud} onComplete={() => navigate(`/editarPerfilLaboral/${user?.uid}`)} />
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: `0 32px 80px ${alpha('#000', 0.15)}`,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, zIndex: 1 }} />
        <DialogTitle sx={{ pt: 4, pb: 1, px: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit size={18} color={colors.primary} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Editar Datos</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="Nombre" value={updatedUserData.nombre} onChange={(e) => setUpdatedUserData({ ...updatedUserData, nombre: e.target.value })} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' } } }} />
            <TextField fullWidth label="Apellido" value={updatedUserData.apellido} onChange={(e) => setUpdatedUserData({ ...updatedUserData, apellido: e.target.value })} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' } } }} />
            <TextField fullWidth label="Teléfono" value={updatedUserData.phoneNumber} onChange={(e) => setUpdatedUserData({ ...updatedUserData, phoneNumber: e.target.value })} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' } } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setShowEditModal(false)} variant="outlined" sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary, fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleEditAccount} variant="contained" startIcon={<Save size={16} />} sx={{ borderRadius: '10px', fontWeight: 700, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, '&:hover': { boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}` } }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: `0 32px 80px ${alpha('#000', 0.15)}`,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, zIndex: 1 }} />
        <DialogTitle sx={{ pt: 4, pb: 1, px: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color={colors.primary} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Cambiar Contraseña</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2 }}>
          <TextField fullWidth type="password" label="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} size="small" helperText="Mínimo 6 caracteres" sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' } } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setShowPasswordModal(false)} variant="outlined" sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary, fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleChangePassword} variant="contained" startIcon={<Shield size={16} />} sx={{ borderRadius: '10px', fontWeight: 700, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, '&:hover': { boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}` } }}>Cambiar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: `0 32px 80px ${alpha('#000', 0.15)}`,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${colors.danger} 0%, ${alpha(colors.danger, 0.5)} 100%)`, zIndex: 1 }} />
        <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '20px', backgroundColor: alpha(colors.danger, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
            <Trash2 size={32} color={colors.danger} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Eliminar Cuenta</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.7, mb: 3 }}>
            ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción eliminará permanentemente tu cuenta y todos tus datos. <strong>No podrás revertir esta acción.</strong>
          </Typography>
          <Stack spacing={1.5} direction="row" justifyContent="center">
            <Button onClick={() => setShowDeleteModal(false)} variant="outlined" sx={{ borderRadius: '10px', borderColor: colors.border, color: colors.textPrimary, fontWeight: 600, px: 3 }}>Cancelar</Button>
            <Button onClick={handleDeleteAccount} variant="contained" color="error" startIcon={<Trash2 size={16} />} sx={{ borderRadius: '10px', fontWeight: 700, px: 3 }}>Eliminar</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <EnviarCV
        show={showModal}
        handleClose={handleCloseModal}
        publicacionId={selectedPublicacion}
        correoPublicacion={publicaciones.find(pub => pub.id === selectedPublicacion)?.email}
        onSuccess={handleCvEnviado}
      />

    </Box>
  );
};

export default DashboardAT;