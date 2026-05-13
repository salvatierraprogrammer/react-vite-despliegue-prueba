import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  InputBase, IconButton, Dialog, DialogTitle, DialogContent,
  TextField, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, getDoc, query, where, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  Briefcase, FileText, Mail, Eye, Clock, Search, Plus,
  Users, TrendingUp, Calendar, Star, MapPin, Phone,
  Edit, Trash2, ExternalLink, Filter, ChevronRight,
  Send, CheckCircle, Building2, User
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
      '&:hover': { transform: 'translateY(-2px)' },
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
        alignItems: 'center', justifyContent: 'center', color
      }}>
        {icon}
      </Box>
      {subtitle && (
        <Chip label={subtitle} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontSize: '0.7rem' }} />
      )}
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary }}>{title}</Typography>
  </Paper>
));

const PublicacionCard = memo(({ pub, onEdit, onDelete, onViewApplicants }) => {
  const estadoColors = {
    activa: colors.success,
    pausada: colors.warning,
    finalizada: colors.textMuted,
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`,
        bgcolor: colors.surface, transition: 'all 0.2s ease',
        '&:hover': { borderColor: colors.primary, transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{pub.titulo}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MapPin size={14} color={colors.textMuted} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>{pub.localidad}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={pub.estado || 'activa'}
              size="small"
              sx={{ bgcolor: alpha(estadoColors[pub.estado] || colors.success, 0.1), color: estadoColors[pub.estado] || colors.success }}
            />
            {pub.fechaCreacion && (
              <Typography variant="caption" sx={{ color: colors.textMuted, alignSelf: 'center' }}>
                {new Date(pub.fechaCreacion.seconds * 1000).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => onViewApplicants(pub)}>
            <Users size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(pub)}>
            <Edit size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(pub.id)} sx={{ color: colors.danger }}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }} noWrap>
        {pub.descripcion}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {pub.etiquetas?.map((tag, i) => (
          <Chip key={i} label={tag} size="small" sx={{ fontSize: '0.7rem' }} />
        ))}
      </Box>
    </Paper>
  );
});

const CvRecibidoCard = memo(({ cv, onView }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.5, sm: 2.5 }, borderRadius: '16px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 },
      cursor: 'pointer', transition: 'all 0.2s ease',
      '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.02) },
    }}
    onClick={() => onView(cv)}
  >
    <Avatar src={cv.photoUrl} sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, fontSize: { xs: '0.75rem', sm: '1rem' }, bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}>
      {cv.nombre?.[0] || cv.nombreCompleto?.[0]}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }} noWrap>
        {cv.nombreCompleto || `${cv.nombre || ''} ${cv.apellido || ''}`}
      </Typography>
    </Box>
    <Chip
      label={cv.estado === 'enviada' ? 'Nuevo' : cv.estado || 'nuevo'}
      size="small"
      sx={{
        height: { xs: 20, sm: 24 }, fontSize: { xs: '0.6rem', sm: '0.7rem' },
        bgcolor: cv.estado && cv.estado !== 'enviada' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
        color: cv.estado && cv.estado !== 'enviada' ? colors.success : colors.warning,
      }}
    />
  </Paper>
));

const DashboardReclutador = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [publicaciones, setPublicaciones] = useState([]);
  const [cvsRecibidos, setCvsRecibidos] = useState([]);
  const [stats, setStats] = useState({ totalPubs: 0, cvsRecibidos: 0, activos: 0, vistas: 0 });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const pubsSnap = await getDocs(query(
        collection(db, 'publicaciones'),
        where('userId', '==', user.uid)
      ));
      const pubsData = pubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = a.fechaCreacion?.seconds || a.fechaCreacion?.getTime?.() || 0;
          const bTime = b.fechaCreacion?.seconds || b.fechaCreacion?.getTime?.() || 0;
          return bTime - aTime;
        });

      const cvsSnap = await getDocs(query(
        collection(db, 'mailEnviadosPostulado'),
        where('userIdReclutador', '==', user.uid)
      ));
      const cvsData = cvsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const cvsWithPhotos = await Promise.all(cvsData.map(async (cv) => {
        if (cv.userIdUsers) {
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', cv.userIdUsers));
            if (userDoc.exists()) {
              return { ...cv, photoUrl: userDoc.data().photo || userDoc.data().photoURL || '' };
            }
          } catch (e) { /* ignore */ }
        }
        return cv;
      }));

      setPublicaciones(pubsData);
      setCvsRecibidos(cvsWithPhotos);
      setStats({
        totalPubs: pubsData.length,
        cvsRecibidos: cvsData.length,
        activos: pubsData.filter(p => p.estado === 'Disponible' || p.estado === 'activa').length,
        vistas: pubsData.reduce((acc, p) => acc + (p.vistas || 0), 0),
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

  const handleDeletePub = async (pubId) => {
    if (window.confirm('¿Eliminar esta publicación?')) {
      await deleteDoc(doc(db, 'publicaciones', pubId));
      fetchData();
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Panel del Reclutador
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Gestiona tus publicaciones y candidatos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Search size={16} />} onClick={() => navigate('/buscar-acompanante')}>
            Buscar AT
          </Button>
          <Button variant="outlined" startIcon={<Mail size={16} />} onClick={() => navigate('/cv-recibido')}>
            CVs Recibidos ({stats.cvsRecibidos})
          </Button>
          <Button variant="outlined" startIcon={<User size={16} />} onClick={() => navigate('/miCuenta')}>
            Mi Perfil
          </Button>
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate('/nuevaPublicacion')}>
            Nueva Publicación
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <Briefcase size={24} />, title: 'Publicaciones', value: stats.totalPubs, color: colors.primary },
          { icon: <CheckCircle size={24} />, title: 'Activas', value: stats.activos, color: colors.success, subtitle: 'activas' },
          { icon: <Mail size={24} />, title: 'CVs Recibidos', value: stats.cvsRecibidos, color: colors.secondary },
          { icon: <Eye size={24} />, title: 'Vistas Totales', value: stats.vistas, color: colors.warning },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...item} delay={i} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Mis Publicaciones</Typography>
              <Button size="small" onClick={() => navigate('/misPublicaciones')}>Ver todas</Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {publicaciones.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Briefcase size={40} color={colors.textMuted} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                    No tienes publicaciones aún
                  </Typography>
                  <Button variant="text" onClick={() => navigate('/nuevaPublicacion')} sx={{ mt: 1 }}>
                    Crear primera publicación
                  </Button>
                </Box>
              ) : (
                publicaciones.slice(0, 4).map(pub => (
                  <PublicacionCard
                    key={pub.id}
                    pub={pub}
                    onEdit={(p) => navigate(`/editar-publicacion/${p.id}`)}
                    onDelete={handleDeletePub}
                    onViewApplicants={(p) => navigate('/cv-recibido')}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>CVs Recibidos Recientemente</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cvsRecibidos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Mail size={40} color={colors.textMuted} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                    No has recibido CVs aún
                  </Typography>
                </Box>
              ) : (
                cvsRecibidos.slice(0, 5).map(cv => (
                  <CvRecibidoCard key={cv.id} cv={cv} onView={() => navigate('/cv-recibido')} />
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardReclutador;