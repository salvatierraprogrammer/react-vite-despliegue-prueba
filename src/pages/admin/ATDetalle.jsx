import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Briefcase,
  Calendar,
  FileText,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { activarAT, obtenerATPorId } from '../../services/atExternoService';
import { CardSkeleton } from '../../components/skeletons';
import { colors } from '../../theme/theme';

const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

const ATDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [at, setAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAt = async () => {
      setLoading(true);
      setError(null);
      const data = await obtenerATPorId(id);
      if (!data) {
        setError('No se encontró el AT seleccionado.');
      } else {
        setAt(data);
      }
      setLoading(false);
    };

    if (id) fetchAt();
  }, [id]);

  const whatsappUrl = useMemo(() => {
    if (!at?.whatsapp) return null;
    const phone = normalizePhone(at.whatsapp);
    return phone ? `https://wa.me/${phone}` : null;
  }, [at]);

  const mailtoUrl = useMemo(() => {
    if (!at?.email) return null;
    return `mailto:${at.email}`;
  }, [at]);

  const handleActivarCuenta = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const resultado = await activarAT(id);
    if (resultado) {
      setSuccess('Cuenta activada correctamente.');
      setAt((prev) => ({ ...prev, estado: 'activo' }));
    } else {
      setError('No se pudo activar la cuenta. Intenta de nuevo.');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, md: 2 }, pt: { xs: 0.5, md: 1.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <CardSkeleton height={48} variant="rounded" lines={0} />
          <CardSkeleton height={200} variant="rectangular" lines={3} lineWidths={['60%', '80%', '40%']} />
          <CardSkeleton height={160} variant="rectangular" lines={2} lineWidths={['50%', '70%']} />
        </Box>
      </Box>
    );
  }

  if (error && !at) {
    return (
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, md: 2 }, pt: { xs: 0.5, md: 1.5 } }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/at-registrados')}
          sx={{ mb: 3, borderRadius: '10px' }}
        >
          Volver al listado
        </Button>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, md: 2 }, pt: { xs: 0.5, md: 1.5 } }}>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate('/at-registrados')}
        sx={{ mb: 3, borderRadius: '10px' }}
      >
        Volver al listado
      </Button>

      <Card sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {at.nombre || 'Acompañante Terapéutico'}
              </Typography>
              <Typography variant="body1" color={colors.textSecondary}>
                Detalle completo del registro AT. Revisa estado, contacto y especializaciones antes de activar.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
              <Box sx={{ flex: '1 1 340px', maxWidth: { lg: 380 } }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="subtitle2" color={colors.textSecondary} sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                    Resumen rápido
                  </Typography>

                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={at.estado ? at.estado.toUpperCase() : 'SIN ESTADO'}
                        color={at.estado === 'activo' ? 'success' : 'default'}
                        icon={at.estado === 'activo' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        size="small"
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                      <Chip
                        label={at.perfilPublicado ? 'Perfil publicado' : 'Perfil no publicado'}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={16} color={colors.primary} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Género</Typography>
                        <Chip label={at.genero || 'No especificado'} size="small" color={at.genero?.toLowerCase() === 'femenino' ? 'secondary' : 'primary'} sx={{ textTransform: 'capitalize', borderRadius: '8px', mt: 0.25, height: 24 }} />
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: alpha(colors.secondary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={16} color={colors.secondary} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Especializaciones</Typography>
                        <Typography variant="body2" sx={{ mt: 0.25 }}>{at.especializaciones || 'No especificadas'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Briefcase size={16} color={colors.warning} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferencia laboral</Typography>
                        <Typography variant="body2" sx={{ mt: 0.25 }}>{at.preferenciaLaboral || 'No definida'}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: alpha(colors.success, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={16} color={colors.success} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zonas</Typography>
                        <Typography variant="body2" sx={{ mt: 0.25 }}>{at.zonas?.join(', ') || 'No definidas'}</Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Typography variant="subtitle2" color={colors.textSecondary} sx={{ mb: 1.5, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.08em' }}>
                      Contacto
                    </Typography>
                    <Stack spacing={1.5}>
                      {at.whatsapp ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', backgroundColor: alpha(colors.success, 0.04), border: `1px solid ${alpha(colors.success, 0.1)}` }}>
                          <Phone size={16} color={colors.success} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{at.whatsapp}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color={colors.textMuted}>WhatsApp no disponible</Typography>
                      )}
                      {at.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '10px', backgroundColor: alpha(colors.primary, 0.04), border: `1px solid ${alpha(colors.primary, 0.1)}` }}>
                          <Mail size={16} color={colors.primary} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{at.email}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color={colors.textMuted}>Email no disponible</Typography>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Calendar size={18} color={colors.primary} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Disponibilidad
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                            {at.disponibilidad?.join(', ') || 'No registrada'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: alpha(colors.secondary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Star size={18} color={colors.secondary} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Tipos de acompañamiento
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                            {at.tiposAcompanamiento?.join(', ') || 'No especificados'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={18} color={colors.warning} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Experiencia
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                            {at.experiencia || 'No registrada'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, height: '100%' }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: alpha(colors.success, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Briefcase size={18} color={colors.success} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Monotributo
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                            {at.monotributo || 'No registrado'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={18} color={colors.primary} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color={colors.textSecondary} sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                            Descripción
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                            {at.descripcion || at.experiencia || 'No hay descripción disponible.'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Stack>

            {(success || error) && (
              <Box>
                {success && <Alert severity="success" sx={{ borderRadius: '12px' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<Phone size={16} />}
                href={whatsappUrl || '#'}
                target="_blank"
                rel="noreferrer"
                disabled={!whatsappUrl}
                sx={{ borderRadius: '10px' }}
              >
                Enviar WhatsApp
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<Mail size={16} />}
                href={mailtoUrl || '#'}
                disabled={!mailtoUrl}
                sx={{ borderRadius: '10px' }}
              >
                Enviar Email
              </Button>
              <Button
                fullWidth
                variant="contained"
                color={at.estado === 'activo' ? 'secondary' : 'success'}
                startIcon={at.estado === 'activo' ? <CheckCircle size={16} /> : <Globe size={16} />}
                onClick={handleActivarCuenta}
                disabled={saving || at.estado === 'activo'}
                sx={{ borderRadius: '10px' }}
              >
                {at.estado === 'activo' ? 'Cuenta activa' : 'Activar cuenta'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ATDetalle;
