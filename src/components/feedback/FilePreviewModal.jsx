import React from 'react';
import {
  Dialog, DialogContent, IconButton, Typography, Box, Chip, alpha, Tooltip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, File, FileText, Image, Archive, ExternalLink } from 'lucide-react';
import { colors } from '../../theme/theme';

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const isImage = (ct, name) => ct?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)$/i.test(name || '');
const isPDF = (ct, name) => ct?.includes('pdf') || /\.pdf$/i.test(name || '');
const isOffice = (name) => /\.(doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp)$/i.test(name || '');
const isVideo = (ct, name) => ct?.startsWith('video/') || /\.(mp4|webm|avi|mov|mkv|wmv)$/i.test(name || '');

const FilePreviewModal = ({ open, file, onClose }) => {
  if (!file) return null;

  const contentType = file.contentType || '';
  const fileName = file.name || '';
  const isImg = isImage(contentType, fileName);
  const isPdf = isPDF(contentType, fileName);
  const isOff = isOffice(fileName);
  const isVid = isVideo(contentType, fileName);
  const canPreview = isImg || isPdf || isOff || isVid;

  const viewerUrl = file.url
    ? isOff
      ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file.url)}`
      : isPdf
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`
        : null
    : null;

  const getIcon = () => {
    if (isImg) return <Image size={20} />;
    if (isPdf || isOff) return <FileText size={20} />;
    return <File size={20} />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isImg ? 'lg' : 'md'}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: colors.surface,
          overflow: 'hidden',
          minHeight: isImg ? undefined : 400,
        },
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 3, py: 2, borderBottom: `1px solid ${colors.border}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  bgcolor: alpha(colors.primary, 0.08), color: colors.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {getIcon()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }} noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    {formatBytes(file.size)} · {contentType || 'Desconocido'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                {file.url && (
                  <Tooltip title="Descargar">
                    <IconButton
                      component="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener"
                      size="small"
                      sx={{ width: 36, height: 36, borderRadius: '10px', color: colors.textSecondary, '&:hover': { bgcolor: alpha(colors.primary, 0.06), color: colors.primary } }}
                    >
                      <Download size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Cerrar">
                  <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ width: 36, height: 36, borderRadius: '10px', color: colors.textSecondary, '&:hover': { bgcolor: alpha(colors.danger, 0.08), color: colors.danger } }}
                  >
                    <X size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0, bgcolor: colors.background, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isImg ? (
                <Box
                  component="img"
                  src={file.url}
                  alt={file.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : viewerUrl ? (
                <Box sx={{ width: '100%', height: '80vh' }}>
                  <iframe
                    src={viewerUrl}
                    title={file.name}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box sx={{
                    width: 72, height: 72, borderRadius: '20px',
                    bgcolor: alpha(colors.primary, 0.06), color: colors.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                  }}>
                    {getIcon()}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Vista previa no disponible
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                    No se puede previsualizar este tipo de archivo
                  </Typography>
                  {file.url && (
                    <Chip
                      icon={<ExternalLink size={14} />}
                      label="Abrir en nueva pestaña"
                      component="a"
                      href={file.url}
                      target="_blank"
                      rel="noopener"
                      clickable
                      sx={{ borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                    />
                  )}
                </Box>
              )}
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default FilePreviewModal;
