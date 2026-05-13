import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, Button, IconButton, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  ArrowLeft, Building2, Mail, Phone, MessageCircle,
  MapPin, Shield, Briefcase
} from 'lucide-react';

const ProfileCard = styled(Paper)({
  borderRadius: '20px',
  overflow: 'hidden',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
});

const ShowPerfilReclutador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reclutador, setReclutador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReclutador(docSnap.data());
        }
      } catch (error) {
        console.error('Error:', error);
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!reclutador) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: colors.textSecondary, mb: 2 }}>Perfil no encontrado</Typography>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate(-1)}>Volver</Button>
      </Box>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}
        sx={{ mb: 2.5, color: colors.textSecondary, '&:hover': { color: colors.textPrimary } }}>
        Volver
      </Button>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <ProfileCard elevation={0}>
            <Box sx={{
              p: 4, textAlign: 'center',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              position: 'relative', overflow: 'hidden',
              '&::before': {
                content: '""', position: 'absolute', top: '-30%', right: '-10%',
                width: 200, height: 200, borderRadius: '50%', background: alpha('#fff', 0.08),
              },
            }}>
              <Avatar src={reclutador.photo} sx={{
                width: 100, height: 100, mx: 'auto', mb: 2,
                border: `4px solid ${alpha('#fff', 0.3)}`, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}>
                {reclutador.nombreEntidad?.[0]}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                {reclutador.nombreEntidad || 'Reclutador'}
              </Typography>
              <Chip label="Reclutador" size="small"
                sx={{ height: 22, fontSize: '0.625rem', fontWeight: 600, bgcolor: alpha('#fff', 0.18), color: '#fff' }}
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reclutador.emailLaboral && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.04) }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                      <Mail size={16} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{reclutador.emailLaboral}</Typography>
                    </Box>
                  </Box>
                )}
                {reclutador.whatsapp && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha(colors.success, 0.04) }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(colors.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.success }}>
                      <Phone size={16} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.625rem' }}>WhatsApp</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{reclutador.whatsapp}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {reclutador.whatsapp && (
                  <Button fullWidth variant="contained" startIcon={<MessageCircle size={16} />}
                    href={`https://wa.me/${(reclutador.whatsapp || '').replace(/\D/g, '')}`}
                    target="_blank"
                    sx={{ py: 1.3, borderRadius: '12px', fontWeight: 600, background: 'linear-gradient(135deg, #25D366, #128C7E)', '&:hover': { background: 'linear-gradient(135deg, #20BD5C, #0E7A6B)' } }}>
                    Contactar por WhatsApp
                  </Button>
                )}
                {reclutador.emailLaboral && (
                  <Button fullWidth variant="outlined" startIcon={<Mail size={16} />}
                    href={`mailto:${reclutador.emailLaboral}`}
                    sx={{ py: 1.3, borderRadius: '12px', fontWeight: 600 }}>
                    Enviar Email
                  </Button>
                )}
              </Box>
            </Box>
          </ProfileCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShowPerfilReclutador;
