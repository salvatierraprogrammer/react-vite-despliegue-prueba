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
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth, store } from '../firebaseConfg/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { colors } from '../theme/theme';
import {
  Send,
  FileText,
  Upload,
  X,
  CheckCircle,
  User,
  Mail,
  FileUp,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

const EnviarCV = ({ show, handleClose, publicacionId, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cv, setCv] = useState(null);
  const [cvName, setCvName] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [userIdReclutador, setUserIdReclutador] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (publicacionId) {
      setNombre('');
      setApellido('');
      setEmail('');
      setDescripcion('');
      setCv(null);
      setCvName('');
      setError(null);
      setStep(1);
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
    const user = auth.currentUser;
    if (user) {
      setNombre(user.displayName?.split(' ')[0] || '');
      setApellido(user.displayName?.split(' ')[1] || '');
      setEmail(user.email || '');
    }
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

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado.');

      if (!nombre || !apellido || !email || !descripcion || !cv) {
        throw new Error('Todos los campos son obligatorios.');
      }

      const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');

      let cvUrl = null;
      if (cv) {
        const storageRef = ref(store, `cvs/${Date.now()}_${cv.name}`);
        const uploadTask = uploadBytesResumable(storageRef, cv);

        cvUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => { reject(error); },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

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
        estado: 'Enviado',
        fechaEnvio: new Date(),
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Error al enviar el CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={show}
      onClose={handleClose}
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
      {/* Decorative header bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      />

      <DialogTitle sx={{ pt: 4, pb: 1, px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={18} color={colors.primary} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Enviar CV
              </Typography>
            </Stack>
            {nombreCliente && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 6.5 }}>
                <Briefcase size={14} color={colors.textMuted} />
                <Typography variant="caption" color={colors.textSecondary}>
                  Postulando a caso de <strong>{nombreCliente}</strong>
                </Typography>
              </Stack>
            )}
          </Stack>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              color: colors.textMuted,
              '&:hover': { backgroundColor: alpha(colors.primary, 0.06) },
            }}
          >
            <X size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          id="enviar-cv-form"
          sx={{ mt: 1 }}
        >
          <Stack spacing={2.5}>
            {/* Step indicator */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              {[1, 2].map((s) => (
                <Box
                  key={s}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: '2px',
                    backgroundColor: step >= s ? colors.primary : alpha(colors.border, 0.5),
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Stack>

            {/* Step 1: Personal info */}
            {step === 1 && (
              <AnimatePresence mode="wait">
                <Box
                  component={motion.div}
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.8125rem' }}>
                    Tus datos
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        size="small"
                        InputProps={{
                          startAdornment: <User size={16} style={{ marginRight: 8, color: colors.textMuted }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
                          },
                        }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="small"
                      InputProps={{
                        startAdornment: <Mail size={16} style={{ marginRight: 8, color: colors.textMuted }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
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
                  component={motion.div}
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, fontSize: '0.8125rem' }}>
                    CV y presentación
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      component="label"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        borderRadius: '12px',
                        border: `2px dashed ${cv ? colors.success : colors.border}`,
                        backgroundColor: cv ? alpha(colors.success, 0.04) : colors.surfaceSecondary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: cv ? colors.success : colors.primary,
                          backgroundColor: cv ? alpha(colors.success, 0.06) : alpha(colors.primary, 0.04),
                        },
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                      />
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          backgroundColor: cv ? alpha(colors.success, 0.1) : alpha(colors.primary, 0.06),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {cv ? <CheckCircle size={20} color={colors.success} /> : <FileUp size={20} color={colors.primary} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: cv ? colors.success : colors.textPrimary }}>
                          {cv ? 'CV adjuntado' : 'Adjuntar CV'}
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                          {cv ? cvName : 'PDF o Word — Máximo 10MB'}
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
                          sx={{ color: colors.textMuted }}
                        >
                          <X size={14} />
                        </IconButton>
                      )}
                    </Box>

                    <TextField
                      fullWidth
                      label="Mensaje de presentación"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                      multiline
                      rows={3}
                      size="small"
                      placeholder="Contanos brevemente tu experiencia y por qué te interesa este caso..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary, borderWidth: '2px' },
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
                sx={{ borderRadius: '10px', '& .MuiAlert-icon': { alignItems: 'center' } }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        {step === 2 ? (
          <>
            <Button
              onClick={() => setStep(1)}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                borderColor: colors.border,
                color: colors.textPrimary,
                fontWeight: 600,
              }}
            >
              Atrás
            </Button>
            <Button
              type="submit"
              form="enviar-cv-form"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                px: 4,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                '&:hover': { boxShadow: `0 8px 24px ${alpha(colors.primary, 0.3)}` },
              }}
            >
              {loading ? 'Enviando...' : 'Enviar CV'}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                borderColor: colors.border,
                color: colors.textPrimary,
                fontWeight: 600,
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setStep(2)}
              variant="contained"
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                px: 4,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              }}
            >
              Siguiente
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EnviarCV;
