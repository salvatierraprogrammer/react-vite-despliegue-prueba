import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button,
  Card, CardContent, CardActions, IconButton, Divider, alpha, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../theme/theme';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Phone, Mail, FileText,
  Heart, Shield, Clock, Star, CheckCircle, Send, User,
  MessageCircle, AlertCircle, BadgeCheck
} from 'lucide-react';
import Cargando from '../../components/Cargando';
import VerReclutadorEmail from '../../components/VerReclutadorEmail';

const PageContainer = styled(Box)({
  minHeight: '100vh',
  background: `linear-gradient(180deg, ${colors.surface} 0%, ${alpha(colors.primary, 0.03)} 100%)`,
  py: 4,
});

const HeaderBanner = styled(Box)({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  borderRadius: '24px',
  padding: '40px 32px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: alpha('#fff', 0.1),
  },
});

const InfoCard = styled(Card)(({ variant }) => ({
  borderRadius: '20px',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: `0 12px 32px ${alpha(colors.primary, 0.1)}`,
  },
}));

const PatientAvatar = styled(Avatar)({
  width: 140,
  height: 140,
  border: `6px solid rgba(255,255,255,0.3)`,
  boxShadow: `0 12px 32px rgba(0,0,0,0.2)`,
});

const InfoItem = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '16px 0',
  borderBottom: `1px solid ${colors.border}`,
  '&:last-child': { borderBottom: 'none' },
});

const StatusBadge = styled(Chip, { shouldForwardProp: (prop) => prop !== 'estado' })(({ estado }) => ({
  borderRadius: '12px',
  fontWeight: 600,
  backgroundColor: estado === 'Activa' ? alpha(colors.success, 0.1) : 
                   estado === 'Cerrada' ? alpha(colors.danger, 0.1) : 
                   alpha(colors.warning, 0.1),
  color: estado === 'Activa' ? colors.success : 
         estado === 'Cerrada' ? colors.danger : 
         colors.warning,
}));

const MailCard = styled(Paper)({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  padding: 20,
  marginBottom: 16,
  backgroundColor: colors.surface,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateX(4px)',
  },
});

const VerCaso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publicacion, setPublicacion] = useState(null);
  const [mailEnviados, setMailEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserId(currentUser.uid);

          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().userRol);
          }

          const docRef = doc(db, 'publicaciones', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPublicacion(data);

            const mailQuery = query(
              collection(db, 'mailEnviadosPostulado'),
              where('userIdPublicacion', '==', id),
              where('userIdUsers', '==', currentUser.uid)
            );
            const mailQuerySnapshot = await getDocs(mailQuery);
            const mails = [];
            mailQuerySnapshot.forEach(doc => {
              mails.push({ id: doc.id, ...doc.data() });
            });
            setMailEnviados(mails);
          } else {
            setPublicacion(null);
          }
        }
      } catch (error) {
        console.error("Error al obtener la publicación:", error);
      }
      setLoading(false);
    };

    fetchPublicacion();
  }, [id]);

  if (loading) {
    return <Cargando />;
  }

  if (!publicacion) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">No se encontró la publicación.</Alert>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: alpha(colors.primary, 0.08) }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Detalles del Caso</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Información completa de la publicación
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={userRole === 'empleado' ? 5 : 6}>
            <InfoCard elevation={0}>
              <Box sx={{ p: 3, bgcolor: alpha(colors.primary, 0.03), borderBottom: `1px solid ${colors.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Avatar
                      src={publicacion.photo}
                      sx={{ width: 80, height: 80, border: `3px solid ${colors.primary}` }}
                    >
                      {publicacion.cliente?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{publicacion.cliente}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <StatusBadge estado={publicacion.estado || 'Activa'} label={publicacion.estado || 'Activa'} size="small" />
                        {publicacion.verificado && (
                          <Chip icon={<BadgeCheck size={14} />} label="Verificado" size="small" sx={{ bgcolor: alpha(colors.success, 0.1), color: colors.success }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <CardContent sx={{ p: 3 }}>
                <InfoItem>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={18} color={colors.primary} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>Edad</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{publicacion.edad || 'No especificada'}</Typography>
                  </Box>
                </InfoItem>

                <InfoItem>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(colors.secondary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Heart size={18} color={colors.secondary} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>Sexo</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{publicacion.sexo || 'No especificado'}</Typography>
                  </Box>
                </InfoItem>

                <InfoItem>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(colors.success, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} color={colors.success} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>Localidad</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{publicacion.localidad}</Typography>
                    {publicacion.zona && (
                      <Chip label={publicacion.zona} size="small" sx={{ mt: 0.5, bgcolor: alpha(colors.primary, 0.08) }} />
                    )}
                  </Box>
                </InfoItem>

                <InfoItem>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color={colors.warning} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>Diagnóstico</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{publicacion.diagnostico}</Typography>
                  </Box>
                </InfoItem>

                {publicacion.etiquetas?.length > 0 && (
                  <Box sx={{ py: 2 }}>
                    <Typography variant="caption" sx={{ color: colors.textMuted, mb: 1, display: 'block' }}>Etiquetas</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {publicacion.etiquetas.map((tag, i) => (
                        <Chip key={i} label={tag} size="small" sx={{ bgcolor: alpha(colors.primary, 0.08) }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" sx={{ color: colors.textSecondary, lineHeight: 1.8 }}>
                  {publicacion.descripcion}
                </Typography>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} lg={userRole === 'empleado' ? 7 : 6}>
            <InfoCard elevation={0} sx={{ mb: 3 }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}` }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageCircle size={20} color={colors.primary} />
                  Información de Contacto
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {publicacion.email && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Mail size={15} />}
                      href={`mailto:${publicacion.email}`}
                      sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', py: 1, px: 2, color: colors.primary, borderColor: alpha(colors.primary, 0.3) }}
                    >
                      Email
                    </Button>
                  )}
                  {publicacion.telefono && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Phone size={15} />}
                      href={`tel:${publicacion.telefono}`}
                      sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', py: 1, px: 2, color: colors.success, borderColor: alpha(colors.success, 0.3) }}
                    >
                      Llamar
                    </Button>
                  )}
                  {publicacion.telefono && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MessageCircle size={15} />}
                      href={`https://wa.me/${(publicacion.telefono || '').replace(/\D/g, '')}`}
                      target="_blank"
                      sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem', py: 1, px: 2, color: '#25D366', borderColor: alpha('#25D366', 0.3), '&:hover': { bgcolor: alpha('#25D366', 0.04) } }}
                    >
                      WhatsApp
                    </Button>
                  )}
                </Box>
              </CardContent>
            </InfoCard>

            {userRole === 'empleado' && (
              <InfoCard elevation={0}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}`, bgcolor: alpha(colors.primary, 0.02) }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Send size={20} color={colors.primary} />
                    Correos Enviados ({mailEnviados.length})
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {mailEnviados.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {mailEnviados.map((mail) => (
                        <MailCard key={mail.id} elevation={0}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {mail.nombre} {mail.apellido}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textMuted }}>
                                {mail.email}
                              </Typography>
                            </Box>
                            <Chip
                              label={mail.estado || 'Enviado'}
                              size="small"
                              sx={{
                                height: 22, fontSize: '0.625rem', fontWeight: 600,
                                bgcolor: mail.estado === 'Aceptado' ? alpha(colors.success, 0.1) : 
                                         mail.estado === 'Rechazado' ? alpha(colors.danger, 0.1) : 
                                         alpha(colors.warning, 0.1),
                                color: mail.estado === 'Aceptado' ? colors.success : 
                                       mail.estado === 'Rechazado' ? colors.danger : 
                                       colors.warning,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                            {mail.descripcion}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Clock size={14} color={colors.textMuted} />
                            <Typography variant="caption" sx={{ color: colors.textMuted }}>
                              Enviado: {formatDate(mail.fechaEnvio)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {mail.email && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Mail size={14} />}
                                href={`mailto:${mail.email}`}
                                sx={{ borderRadius: '8px', fontSize: '0.75rem', color: colors.primary, borderColor: alpha(colors.primary, 0.3) }}
                              >
                                Email
                              </Button>
                            )}
                            {mail.telefono && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<MessageCircle size={14} />}
                                href={`https://wa.me/${mail.telefono.replace(/\D/g, '')}`}
                                target="_blank"
                                sx={{ borderRadius: '8px', fontSize: '0.75rem', color: '#25D366', borderColor: alpha('#25D366', 0.3) }}
                              >
                                WhatsApp
                              </Button>
                            )}
                          </Box>
                        </MailCard>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Box sx={{ width: 80, height: 80, borderRadius: '24px', bgcolor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                        <AlertCircle size={36} color={colors.warning} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Sin correos enviados</Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
                        Aún no has enviado tu CV para este caso
                      </Typography>
                      <Button variant="contained" startIcon={<Send size={16} />} onClick={() => navigate(`/buscar-trabajo`)}>
                        Verificar Postulación
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </InfoCard>
            )}

            {userRole === 'reclutador' && (
              <VerReclutadorEmail />
            )}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default VerCaso;