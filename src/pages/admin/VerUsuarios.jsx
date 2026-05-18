import React, { useEffect, useState, useCallback, memo } from 'react';
import { Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, Tabs, Tab, Divider, Rating, LinearProgress, Tooltip, Badge } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Clock,
  Star,
  Verified,
  Edit,
  Trash2,
  MessageCircle,
  ChevronRight,
  Building2,
  User,
  Calendar,
  Award,
  Globe,
  FileText,
  Send,
  Eye,
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  borderRadius: '24px',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '300px',
    height: '300px',
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const StatBox = memo(({ icon: Icon, label, value, color }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: '12px',
      bgcolor: alpha(color, 0.1),
    }}
  >
    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(color, 0.15), color: color }}>
      <Icon size={16} />
    </Box>
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.textPrimary }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
        {label}
      </Typography>
    </Box>
  </Box>
));

const InfoRow = memo(({ icon: Icon, label, value, color = colors.primary }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      py: 1.5,
      px: 2,
      borderRadius: '12px',
      '&:hover': { bgcolor: alpha(color, 0.04) },
      transition: 'all 0.2s ease',
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        bgcolor: alpha(color, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}
    >
      <Icon size={16} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textPrimary }} noWrap>
        {value || 'No especificado'}
      </Typography>
    </Box>
  </Box>
));

const ActionButton = memo(({ icon: Icon, label, onClick, color = colors.primary }) => (
  <Button
    onClick={onClick}
    startIcon={<Icon size={16} />}
    sx={{
      justifyContent: 'flex-start',
      py: 1.5,
      px: 2,
      borderRadius: '12px',
      bgcolor: alpha(color, 0.06),
      color: color,
      border: `1px solid ${alpha(color, 0.1)}`,
      '&:hover': {
        bgcolor: alpha(color, 0.12),
        borderColor: alpha(color, 0.2),
        transform: 'translateX(4px)',
      },
      transition: 'all 0.2s ease',
    }}
  >
    {label}
  </Button>
));

const TabPanel = ({ children, value, index }) => (
  <AnimatePresence mode="wait">
    {value === index && (
      <motion.div
        key={`tab-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const VerUsuarios = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilLaboral, setPerfilLaboral] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', id));
      if (!userDoc.exists()) {
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      setUsuario(userData);

      if (userData.userRol === 'empleado') {
        const perfilSnap = await getDoc(doc(db, 'perfilesLaborales', id));
        if (perfilSnap.exists()) {
          setPerfilLaboral(perfilSnap.data());
        }
      }

      if (userData.userRol === 'reclutador' || userData.userRol === 'administrador') {
        const pubSnap = await getDocs(collection(db, 'publicaciones'));
        const userPubs = pubSnap.docs.filter(d => d.data().userId === id).map(d => ({ id: d.id, ...d.data() }));
        setPublicaciones(userPubs);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingPage />;
  if (!usuario) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: colors.textSecondary }}>
          Usuario no encontrado
        </Typography>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate('/admin')} sx={{ mt: 2 }}>
          Volver al Dashboard
        </Button>
      </Box>
    );
  }

  const roleColors = {
    administrador: colors.danger,
    reclutador: colors.secondary,
    empleado: colors.success,
    familiar: colors.warning,
  };

  const roleLabels = {
    administrador: 'Administrador',
    reclutador: 'Reclutador',
    empleado: 'Acompañante Terapéutico',
    familiar: 'Familiar',
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{ maxWidth: 1200, mx: 'auto' }}
    >
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: colors.textSecondary }}
      >
        Volver
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ProfileHeader>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  src={usuario.photo || usuario.photoURL}
                  sx={{
                    width: 80,
                    height: 80,
                    border: `3px solid ${alpha('#fff', 0.3)}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                >
                  {usuario.nombre?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                    {usuario.nombre} {usuario.apellido}
                  </Typography>
                  <Chip
                    label={roleLabels[usuario.userRol] || usuario.userRol}
                    size="small"
                    sx={{
                      bgcolor: alpha('#fff', 0.2),
                      color: '#fff',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Tooltip title={usuario.email}>
                  <IconButton sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}>
                    <Mail size={18} />
                  </IconButton>
                </Tooltip>
                <IconButton href={`tel:${usuario.phoneNumber}`} sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}>
                  <Phone size={18} />
                </IconButton>
                {usuario.whatsapp && (
                  <IconButton href={`https://wa.me/${usuario.whatsapp}`} target="_blank" sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}>
                    <MessageCircle size={18} />
                  </IconButton>
                )}
              </Box>
            </ProfileHeader>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Estadísticas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {usuario.userRol === 'reclutador' && (
                  <StatBox icon={FileText} label="Publicaciones" value={publicaciones.length} color={colors.primary} />
                )}
                {usuario.userRol === 'empleado' && (
                  <>
                    <StatBox icon={Briefcase} label="Postulaciones" value="5" color={colors.success} />
                    <StatBox icon={Star} label="Calificación" value="4.8" color={colors.warning} />
                  </>
                )}
                <StatBox icon={Calendar} label="Miembro desde" value="Ene 2024" color={colors.secondary} />
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Información
                </Typography>
                <Chip
                  label={usuario.estado || 'Activo'}
                  size="small"
                  sx={{
                    bgcolor: alpha(colors.success, 0.1),
                    color: colors.success,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <InfoRow icon={User} label="Nombre completo" value={`${usuario.nombre} ${usuario.apellido}`} />
              <InfoRow icon={Mail} label="Email" value={usuario.email} />
              <InfoRow icon={Phone} label="Teléfono" value={usuario.phoneNumber} />
              {usuario.dni && <InfoRow icon={FileText} label="DNI" value={usuario.dni} />}
              {usuario.nombreEntidad && <InfoRow icon={Building2} label="Entidad" value={usuario.nombreEntidad} />}
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <ActionButton icon={Edit} label="Editar Usuario" onClick={() => navigate(`/editar-usuario/${id}`)} />
              {usuario.userRol === 'empleado' && (
                <ActionButton icon={Eye} label="Ver Perfil Público" onClick={() => navigate(`/perfil/${id}`)} color={colors.success} />
              )}
              <Button
                startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyId}
                fullWidth
                sx={{ py: 1.5, borderRadius: '12px', color: colors.textSecondary }}
              >
                {copied ? 'ID Copiado' : 'Copiar ID'}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: `1px solid ${colors.border}`, px: 2 }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ minHeight: 56 }}>
                <Tab label="Detalles" />
                {usuario.userRol === 'empleado' && <Tab label="Perfil Laboral" />}
                {usuario.userRol === 'reclutador' && <Tab label="Publicaciones" />}
                {usuario.userRol === 'administrador' && <Tab label="Actividad" />}
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="overline" sx={{ color: colors.textMuted, mb: 2, display: 'block' }}>
                      Datos Personales
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <InfoRow icon={User} label="Nombre" value={usuario.nombre} />
                      <InfoRow icon={User} label="Apellido" value={usuario.apellido} />
                      <InfoRow icon={Mail} label="Email" value={usuario.email} />
                      <InfoRow icon={Phone} label="Teléfono" value={usuario.phoneNumber} />
                      {usuario.whatsapp && <InfoRow icon={MessageCircle} label="WhatsApp" value={usuario.whatsapp} />}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="overline" sx={{ color: colors.textMuted, mb: 2, display: 'block' }}>
                      Datos Laborales
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {usuario.nombreEntidad && <InfoRow icon={Building2} label="Entidad" value={usuario.nombreEntidad} />}
                      {usuario.emailLaboral && <InfoRow icon={Mail} label="Email Laboral" value={usuario.emailLaboral} />}
                      <InfoRow icon={FileText} label="Rol" value={roleLabels[usuario.userRol]} color={roleColors[usuario.userRol]} />
                      <InfoRow icon={Check} label="Estado" value={usuario.estado || 'Activo'} color={colors.success} />
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {usuario.userRol === 'empleado' && (
                <TabPanel value={tabValue} index={1}>
                  {perfilLaboral ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Perfil Profesional
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoRow icon={Briefcase} label="Título" value={perfilLaboral.titulo} />
                        <InfoRow icon={GraduationCap} label="Formación" value={perfilLaboral.formacion} />
                        <InfoRow icon={Award} label="Experiencia" value={`${perfilLaboral.experiencia} años`} color={colors.success} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <InfoRow icon={MapPin} label="Localidad" value={perfilLaboral.localidad} />
                        <InfoRow icon={Globe} label="Zona" value={perfilLaboral.zona} />
                        <InfoRow icon={Heart} label="Preferencia" value={perfilLaboral.preferenciaLaboral} color={colors.secondary} />
                      </Grid>
                      {perfilLaboral.sobreMi && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>
                            Sobre mí
                          </Typography>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(colors.primary, 0.03), borderRadius: '12px' }}>
                            <Typography variant="body2">{perfilLaboral.sobreMi}</Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ color: colors.textSecondary }}>
                        Este usuario no tiene perfil laboral creado
                      </Typography>
                      <Button sx={{ mt: 2 }} onClick={() => navigate(`/crear-perfil-laboral/${id}`)}>
                        Crear Perfil
                      </Button>
                    </Box>
                  )}
                </TabPanel>
              )}

              {usuario.userRol === 'reclutador' && (
                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={2}>
                    {publicaciones.length > 0 ? (
                      publicaciones.map(pub => (
                        <Grid item xs={12} key={pub.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: '16px',
                              border: `1px solid ${colors.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.02) },
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                            }}
                          >
                            <Avatar src={pub.photo} sx={{ width: 48, height: 48, borderRadius: '12px' }}>
                              {pub.cliente?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {pub.cliente}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                {pub.diagnostico} • {pub.localidad}
                              </Typography>
                            </Box>
                            <Chip
                              label={pub.estado}
                              size="small"
                              sx={{
                                bgcolor: alpha(pub.estado === 'Disponible' ? colors.success : colors.textSecondary, 0.1),
                                color: pub.estado === 'Disponible' ? colors.success : colors.textSecondary,
                                fontWeight: 500,
                              }}
                            />
                            <IconButton onClick={() => navigate(pub.slug ? `/ver-caso/${pub.slug}` : `/ver-caso/${pub.id}`)}>
                              <ChevronRight size={18} />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <FileText size={40} color={colors.textMuted} style={{ marginBottom: 8 }} />
                          <Typography sx={{ color: colors.textSecondary }}>
                            No hay publicaciones creadas
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>
              )}

              {usuario.userRol === 'administrador' && (
                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(colors.primary, 0.03), borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Actividad Reciente
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: `1px solid ${colors.border}` }}>
                            <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(colors.success, 0.1), color: colors.success }}>
                              <User size={14} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>Usuario activo</Typography>
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Hace 2 horas</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(colors.secondary, 0.03), borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Permisos
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                            <Typography variant="body2">Gestionar usuarios</Typography>
                            <Check size={16} color={colors.success} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                            <Typography variant="body2">Moderar contenido</Typography>
                            <Check size={16} color={colors.success} />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                            <Typography variant="body2">Ver reportes</Typography>
                            <Check size={16} color={colors.success} />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VerUsuarios;