import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth, store } from '../firebaseConfg/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { colors } from '../theme/theme';
import {
  Send,
  X,
  CheckCircle,
  User,
  Mail,
  FileUp,
  Briefcase,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    boxShadow: `0 32px 80px ${alpha('#000', 0.2)}`,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    background: colors.surface,
  },
});

const StepDot = styled(Box, { shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed' })(({ active, completed }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: active
    ? colors.primary
    : completed
      ? alpha(colors.success, 0.15)
      : alpha(colors.border, 0.3),
  color: active
    ? '#fff'
    : completed
      ? colors.success
      : colors.textMuted,
  border: active
    ? `2px solid ${alpha(colors.primary, 0.3)}`
    : '2px solid transparent',
  boxShadow: active
    ? `0 4px 12px ${alpha(colors.primary, 0.3)}`
    : 'none',
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: alpha(colors.background, 0.4),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.02),
      '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
    },
    '&.Mui-focused': {
      backgroundColor: colors.surface,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: colors.primary,
      fontWeight: 600,
    },
  },
});

const UploadZone = styled(Box)(({ hasfile }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '20px 24px',
  borderRadius: '14px',
  border: `2px dashed ${hasfile ? colors.success : colors.border}`,
  backgroundColor: hasfile
    ? alpha(colors.success, 0.04)
    : alpha(colors.surfaceSecondary, 0.6),
  cursor: 'pointer',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: hasfile ? colors.success : colors.primary,
    backgroundColor: hasfile
      ? alpha(colors.success, 0.06)
      : alpha(colors.primary, 0.04),
    transform: 'translateY(-1px)',
    boxShadow: hasfile
      ? `0 4px 12px ${alpha(colors.success, 0.1)}`
      : `0 4px 12px ${alpha(colors.primary, 0.08)}`,
  },
}));

const EnviarCV = ({ show, handleClose, publicacionId, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cv, setCv] = useState(null);
  const [cvName, setCvName] = useState('');
  const [profileCvUrl, setProfileCvUrl] = useState('');
  const [profileCvName, setProfileCvName] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [userIdReclutador, setUserIdReclutador] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [compartirCV, setCompartirCV] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (publicacionId) {
      setNombre('');
      setApellido('');
      setEmail('');
      setDescripcion('');
      setCv(null);
      setCvName('');
      setProfileCvUrl('');
      setProfileCvName('');
      setError(null);
      setStep(1);
      setUploadProgress(0);
      fetchPublicacionData();
    }
  }, [publicacionId]);

  const fetchPublicacionData = async () => {
    try {
      const publicacionDoc = await getDoc(doc(db, 'publicaciones', publicacionId));
      if (publicacionDoc.exists()) {
        const data = publicacionDoc.data();
        setNombreCliente(data.cliente || 'Sin cliente');
        setUserIdReclutador(data.userId || '');
      }
    } catch (err) {
      console.error('Error fetching publicacion:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
        try {
          const perfilDoc = await getDoc(doc(db, 'perfilLaboral', user.uid));
          if (perfilDoc.exists()) {
            const data = perfilDoc.data();
            if (data.nombreCompleto) {
              const parts = data.nombreCompleto.split(' ');
              setNombre(parts[0] || '');
              setApellido(parts.slice(1).join(' ') || '');
            }
            if (data.cvURL) {
              setProfileCvUrl(data.cvURL);
              setProfileCvName(data.cvName || 'CV del perfil');
            }
          } else {
            setNombre(user.displayName?.split(' ')[0] || '');
            setApellido(user.displayName?.split(' ')[1] || '');
          }
        } catch (err) {
          setNombre(user.displayName?.split(' ')[0] || '');
          setApellido(user.displayName?.split(' ')[1] || '');
        }
      }
    };
    if (show) fetchData();
  }, [show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCv(file);
      setCvName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado.');

      if (!nombre || !apellido || !email || !descripcion) {
        throw new Error('Todos los campos son obligatorios.');
      }
      if (!cv && !profileCvUrl) {
        throw new Error('Debés adjuntar un CV o tener uno guardado en tu perfil.');
      }

      const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');

      let cvUrl = profileCvUrl || null;
      if (cv) {
        const storageRef = ref(store, `cvs/${Date.now()}_${cv.name}`);
        const uploadTask = uploadBytesResumable(storageRef, cv);

        cvUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => { reject(error); },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      const cvName = cv?.name || profileCvName || '';
      const cvExt = cvName.split('.').pop().toLowerCase();
      const cvTypeMap = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
      const cvType = cvTypeMap[cvExt] || 'application/octet-stream';

      await addDoc(mailEnviadosCollection, {
        userIdUsers: user.uid,
        userIdPublicacion: publicacionId,
        userIdReclutador: userIdReclutador || 'Desconocido',
        NombreCliente: nombreCliente || 'Sin cliente',
        nombre,
        apellido,
        email,
        descripcion,
        cvUrl,
        cvName,
        cvType,
        cvSize: cv?.size || 0,
        compartirCV,
        estado: 'Enviado',
        fechaEnvio: new Date(),
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al enviar el CV');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <StyledDialog
      open={show}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Gradient header bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.primaryLight} 100%)`,
          zIndex: 1,
        }}
      />

      <DialogTitle sx={{ pt: 4.5, pb: 1.5, px: { xs: 2.5, sm: 3.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.12)} 0%, ${alpha(colors.secondary, 0.06)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 2px 8px ${alpha(colors.primary, 0.08)}`,
                }}
              >
                <Send size={20} color={colors.primary} />
              </Box>
              <Stack spacing={0.25}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Enviar CV
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 400 }}>
                  Completá los datos para postularte
                </Typography>
              </Stack>
            </Stack>
            {nombreCliente && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 7.5 }}>
                <Briefcase size={13} color={colors.textMuted} />
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6875rem' }}>
                  Postulando a caso de <strong style={{ color: colors.textPrimary }}>{nombreCliente}</strong>
                </Typography>
              </Stack>
            )}
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: alpha(colors.primary, 0.04),
              color: colors.textMuted,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(colors.primary, 0.1),
                color: colors.textPrimary,
              },
            }}
          >
            <X size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          id="enviar-cv-form"
        >
          <Stack spacing={3}>
            {/* Step indicator */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {[1, 2].map((s, idx) => (
                  <React.Fragment key={s}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: idx === 0 ? 1 : 0 }}>
                      <StepDot active={step === s} completed={step > s}>
                        {step > s ? <CheckCircle size={14} /> : s}
                      </StepDot>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: step === s ? 600 : 400,
                          color: step === s ? colors.textPrimary : colors.textMuted,
                          display: { xs: 'none', sm: 'block' },
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {s === 1 ? 'Datos personales' : 'CV y presentación'}
                      </Typography>
                    </Stack>
                    {idx === 0 && (
                      <Box sx={{ flex: 1, height: 2, borderRadius: 1, bgcolor: step > 1 ? colors.primary : alpha(colors.border, 0.5) }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Stack>

            {/* Step 1: Personal info */}
            {step === 1 && (
              <AnimatePresence mode="wait">
                <Box
                  key="step1"
                  component={motion.div}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary }}>
                      Información personal
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <StyledTextField
                        fullWidth
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: <User size={16} style={{ marginRight: 10, color: colors.textMuted }} />,
                          },
                        }}
                      />
                      <StyledTextField
                        fullWidth
                        label="Apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        size="small"
                      />
                    </Stack>
                    <StyledTextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="small"
                      slotProps={{
                        input: {
                          startAdornment: <Mail size={16} style={{ marginRight: 10, color: colors.textMuted }} />,
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </AnimatePresence>
            )}

            {/* Step 2: CV + description */}
            {step === 2 && (
              <AnimatePresence mode="wait">
                <Box
                  key="step2"
                  component={motion.div}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Stack spacing={2.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.textPrimary }}>
                      CV y presentación
                    </Typography>

                    <Box component="label" sx={{ display: 'block', cursor: 'pointer' }}>
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                      />
                      <UploadZone hasfile={!!cv || !!profileCvUrl}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            backgroundColor: cv || profileCvUrl ? alpha(colors.success, 0.12) : alpha(colors.primary, 0.08),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {cv || profileCvUrl ? (
                            <CheckCircle size={22} color={colors.success} />
                          ) : (
                            <FileUp size={22} color={colors.primary} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: cv || profileCvUrl ? colors.success : colors.textPrimary }}>
                            {cv || profileCvUrl ? 'CV listo para enviar' : 'Adjuntar currículum'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted, display: 'block', mt: 0.25 }}>
                            {cv ? cvName : profileCvUrl ? profileCvName : 'PDF o Word — Máximo 10MB'}
                          </Typography>
                        </Box>
                        {cv && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              setCv(null);
                              setCvName('');
                            }}
                            sx={{
                              color: colors.textMuted,
                              bgcolor: alpha(colors.danger, 0.06),
                              '&:hover': { bgcolor: alpha(colors.danger, 0.12), color: colors.danger },
                            }}
                          >
                            <X size={14} />
                          </IconButton>
                        )}
                      </UploadZone>
                    </Box>

                  {loading && uploadProgress > 0 && (
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: colors.textMuted }}>Subiendo CV</Typography>
                          <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600 }}>{uploadProgress}%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: alpha(colors.primary, 0.1) }}>
                          <Box
                            sx={{
                              width: `${uploadProgress}%`,
                              height: '100%',
                              borderRadius: 2,
                              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={compartirCV}
                          onChange={(e) => setCompartirCV(e.target.checked)}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: colors.primary,
                              '&:hover': { backgroundColor: alpha(colors.primary, 0.08) },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: colors.primary,
                            },
                          }}
                        />
                      }
                      label={
                        <Stack spacing={0.25}>
                          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                            Compartir mi CV
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 400, fontSize: '0.625rem' }}>
                            El reclutador podrá ver tu currículum completo
                          </Typography>
                        </Stack>
                      }
                      sx={{
                        alignItems: 'flex-start',
                        ml: 0.5,
                        '& .MuiFormControlLabel-label': { ml: 1 },
                      }}
                    />

                    <StyledTextField
                      fullWidth
                      label="Mensaje de presentación"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                      multiline
                      rows={3}
                      size="small"
                      placeholder="Contanos brevemente tu experiencia y por qué te interesa este caso..."
                      slotProps={{
                        input: {
                          sx: {
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(colors.border, 0.8) },
                          },
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </AnimatePresence>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: '12px',
                  bgcolor: alpha(colors.danger, 0.06),
                  border: `1px solid ${alpha(colors.danger, 0.15)}`,
                  '& .MuiAlert-icon': { alignItems: 'center', color: colors.danger },
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, pb: 3, pt: 1 }}>
        {step === 2 ? (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              onClick={() => setStep(1)}
              variant="outlined"
              startIcon={<ChevronLeft size={16} />}
              sx={{
                borderRadius: '12px',
                borderColor: colors.border,
                color: colors.textSecondary,
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: colors.textMuted,
                  bgcolor: alpha(colors.primary, 0.03),
                },
              }}
            >
              Atrás
            </Button>
            <Button
              type="submit"
              form="enviar-cv-form"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                px: 4,
                minHeight: 44,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                boxShadow: `0 4px 16px ${alpha(colors.primary, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(colors.primary, 0.35)}`,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: alpha(colors.primary, 0.4),
                },
              }}
            >
              {loading ? 'Enviando...' : 'Enviar CV'}
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                borderColor: colors.border,
                color: colors.textSecondary,
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: colors.textMuted,
                  bgcolor: alpha(colors.primary, 0.03),
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setStep(2)}
              variant="contained"
              endIcon={<ChevronRight size={16} />}
              sx={{
                borderRadius: '12px',
                fontWeight: 600,
                px: 4,
                minHeight: 44,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                boxShadow: `0 4px 16px ${alpha(colors.primary, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(colors.primary, 0.35)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Siguiente
            </Button>
          </Stack>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default EnviarCV;
