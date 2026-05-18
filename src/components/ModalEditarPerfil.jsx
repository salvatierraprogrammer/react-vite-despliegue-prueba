import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Slider, IconButton, Stack, CircularProgress
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import Cropper from 'react-easy-crop';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { store } from '../firebaseConfg/firebase';
import { colors } from '../theme/theme';
import { ZoomIn, ZoomOut, RotateCw, X, Check, Camera } from 'lucide-react';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    maxWidth: 520,
    width: '100%',
    overflow: 'hidden',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
  },
});

const CropContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: 380,
  background: '#1a1a2e',
  borderRadius: '12px',
  overflow: 'hidden',
});

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * Math.sqrt(maxSize ** 2 + maxSize ** 2);

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

const ModalEditarPerfil = ({ open, onClose, onSave }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels_) => {
    setCroppedAreaPixels(croppedAreaPixels_);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const fileName = `profile_${Date.now()}.jpg`;
      const storageRef = ref(store, `profileImages/${fileName}`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadUrl = await getDownloadURL(storageRef);
      onSave(downloadUrl);
      handleClose();
    } catch (err) {
      console.error('Error uploading cropped image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.primaryLight} 100%)`, zIndex: 1 }} />

      <DialogTitle sx={{ pt: 4, pb: 1.5, px: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: `linear-gradient(135deg, ${alpha(colors.primary, 0.12)} 0%, ${alpha(colors.secondary, 0.06)} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={18} color={colors.primary} />
            </Box>
            <Stack spacing={0.25}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Editar Foto</Typography>
              <Typography variant="caption" sx={{ color: colors.textMuted }}>Ajustá y recortá tu foto de perfil</Typography>
            </Stack>
          </Stack>
          <IconButton onClick={handleClose} size="small" sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.04), color: colors.textMuted, '&:hover': { bgcolor: alpha(colors.primary, 0.1), color: colors.textPrimary } }}>
            <X size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {!imageSrc ? (
          <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, borderRadius: '16px', border: `2px dashed ${colors.border}`, bgcolor: alpha(colors.surfaceSecondary, 0.6), cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: colors.primary, bgcolor: alpha(colors.primary, 0.04) } }}>
            <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Camera size={24} color={colors.primary} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, mb: 0.5 }}>Seleccionar foto</Typography>
            <Typography variant="caption" sx={{ color: colors.textMuted }}>JPG, PNG — Máximo 5MB</Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <CropContainer>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                onRotationChange={setRotation}
              />
            </CropContainer>

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ZoomOut size={16} color={colors.textMuted} />
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(_, val) => setZoom(val)}
                  sx={{
                    color: colors.primary,
                    '& .MuiSlider-thumb': { width: 16, height: 16, '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(colors.primary, 0.12)}` } },
                    '& .MuiSlider-track': { height: 4, borderRadius: 2 },
                    '& .MuiSlider-rail': { height: 4, borderRadius: 2, bgcolor: alpha(colors.border, 0.5) },
                  }}
                />
                <ZoomIn size={16} color={colors.textMuted} />
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <RotateCw size={16} color={colors.textMuted} />
                <Slider
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(_, val) => setRotation(val)}
                  sx={{
                    color: colors.primary,
                    '& .MuiSlider-thumb': { width: 16, height: 16, '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(colors.primary, 0.12)}` } },
                    '& .MuiSlider-track': { height: 4, borderRadius: 2 },
                    '& .MuiSlider-rail': { height: 4, borderRadius: 2, bgcolor: alpha(colors.border, 0.5) },
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        {imageSrc ? (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setImageSrc(null); setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); }} variant="outlined" sx={{ borderRadius: '12px', borderColor: colors.border, color: colors.textSecondary, fontWeight: 600, px: 3, '&:hover': { borderColor: colors.textMuted, bgcolor: alpha(colors.primary, 0.03) } }}>
              Elegir otra
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={uploading} startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />} sx={{ borderRadius: '12px', fontWeight: 700, px: 4, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, boxShadow: `0 4px 16px ${alpha(colors.primary, 0.3)}`, '&:hover': { boxShadow: `0 8px 24px ${alpha(colors.primary, 0.35)}`, transform: 'translateY(-1px)' }, '&:disabled': { background: alpha(colors.primary, 0.4) } }}>
              {uploading ? 'Guardando...' : 'Guardar'}
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: '12px', borderColor: colors.border, color: colors.textSecondary, fontWeight: 600, px: 3, '&:hover': { borderColor: colors.textMuted, bgcolor: alpha(colors.primary, 0.03) } }}>
              Cancelar
            </Button>
          </Stack>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default ModalEditarPerfil;
