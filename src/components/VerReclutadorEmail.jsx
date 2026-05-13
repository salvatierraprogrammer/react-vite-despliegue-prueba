import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import {
  Box, Typography, Paper, Chip, Button, Avatar, IconButton, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../theme/theme';
import Cargando from './Cargando';
import {
  Mail, Phone, MessageCircle, ArrowLeft,
  Clock, FileText, Send, User, Eye
} from 'lucide-react';

const MailCard = styled(Paper)({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  padding: 20,
  marginBottom: 16,
  backgroundColor: colors.surface,
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    borderColor: colors.primary,
    boxShadow: `0 8px 24px ${alpha(colors.primary, 0.08)}`,
  },
});

const ContactButton = styled(Button)({
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '6px 14px',
  minWidth: 0,
});

const VerReclutadorEmail = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [mailEnviados, setMailEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) { setLoading(false); return; }

        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPublicacion(data);

          const mailQuery = query(
            collection(db, 'mailEnviadosPostulado'),
            where('userIdPublicacion', '==', id)
          );
          const mailQuerySnapshot = await getDocs(mailQuery);
          const mails = mailQuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setMailEnviados(mails);

          if (mails.length > 0) {
            const lastMail = mails[mails.length - 1];
            const mailDocRef = doc(db, 'mailEnviadosPostulado', lastMail.id);
            await updateDoc(mailDocRef, { estado: 'Leído' });
          }
        } else {
          setPublicacion(null);
        }
      } catch (error) {
        console.error('Error al obtener la publicación:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Cargando />;

  if (!publicacion) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">No se encontró la publicación.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: alpha(colors.primary, 0.08) }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Send size={20} color={colors.primary} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Correos Recibidos ({mailEnviados.length})
          </Typography>
        </Box>
      </Box>

      {mailEnviados.length > 0 ? (
        <Box>
          {mailEnviados.map((mail, index) => (
            <motion.div
              key={mail.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MailCard elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary, width: 40, height: 40 }}>
                    {mail.nombre?.[0] || <User size={20} />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                          {mail.nombre} {mail.apellido}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted }}>
                          {mail.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={mail.estado === 'Leído' ? 'Leído' : mail.estado || 'Enviado'}
                        size="small"
                        sx={{
                          height: 22, fontSize: '0.625rem', fontWeight: 600,
                          bgcolor: mail.estado === 'Leído' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
                          color: mail.estado === 'Leído' ? colors.success : colors.warning,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mb: 2, pl: 7 }}>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, lineHeight: 1.6 }}>
                    {mail.descripcion}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pl: 7, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Clock size={12} color={colors.textMuted} />
                    <Typography variant="caption" sx={{ color: colors.textMuted }}>
                      {mail.fechaEnvio?.seconds
                        ? new Date(mail.fechaEnvio.seconds * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Fecha no disponible'}
                    </Typography>
                  </Box>
                  {mail.cvUrl && (
                    <Chip
                      icon={<FileText size={12} />}
                      label="Ver CV"
                      size="small"
                      component="a"
                      href={mail.cvUrl}
                      target="_blank"
                      clickable
                      sx={{ height: 24, fontSize: '0.625rem', bgcolor: alpha(colors.primary, 0.06), color: colors.primary }}
                    />
                  )}
                </Box>

                <Box sx={{ pl: 7, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {mail.userIdUsers && (
                    <ContactButton
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={14} />}
                      onClick={() => navigate(`/showPerfil/${mail.userIdUsers}`)}
                      sx={{ color: colors.primary, borderColor: alpha(colors.primary, 0.3) }}
                    >
                      Ver Perfil
                    </ContactButton>
                  )}
                  {mail.email && (
                    <ContactButton
                      variant="outlined"
                      size="small"
                      startIcon={<Mail size={14} />}
                      href={`mailto:${mail.email}`}
                      sx={{ color: colors.primary, borderColor: alpha(colors.primary, 0.3) }}
                    >
                      Email
                    </ContactButton>
                  )}
                  {mail.telefono && (
                    <ContactButton
                      variant="outlined"
                      size="small"
                      startIcon={<Phone size={14} />}
                      href={`tel:${mail.telefono}`}
                      sx={{ color: colors.success, borderColor: alpha(colors.success, 0.3) }}
                    >
                      Llamar
                    </ContactButton>
                  )}
                  {mail.telefono && (
                    <ContactButton
                      variant="outlined"
                      size="small"
                      startIcon={<MessageCircle size={14} />}
                      href={`https://wa.me/${mail.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      sx={{ color: '#25D366', borderColor: alpha('#25D366', 0.3), '&:hover': { bgcolor: alpha('#25D366', 0.04) } }}
                    >
                      WhatsApp
                    </ContactButton>
                  )}
                </Box>
              </MailCard>
            </motion.div>
          ))}
        </Box>
      ) : (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '20px', bgcolor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <Send size={28} color={colors.warning} />
          </Box>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            No se encontraron correos para esta publicación
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default VerReclutadorEmail;
