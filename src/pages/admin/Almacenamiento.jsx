import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, Button, IconButton, Table, TableContainer,
  TableHead, TableBody, TableRow, TableCell, alpha, Tooltip, LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { ref, listAll, getMetadata, deleteObject, getDownloadURL } from 'firebase/storage';
import { store } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import {
  HardDrive, Trash2, Download, FileText, File, Image, Archive,
  FolderOpen, AlertCircle, Search, ChevronRight, Eye,
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import FilePreviewModal from '../../components/feedback/FilePreviewModal';

const MySwal = withReactContent(Swal);

const StyledTable = styled(TableContainer)({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: colors.textMuted,
    backgroundColor: alpha(colors.background, 0.5),
    borderBottom: `1px solid ${colors.border}`,
    py: 2,
  },
  '& .MuiTableCell-body': {
    fontSize: '0.8125rem',
    color: colors.textPrimary,
    borderBottom: `1px solid ${alpha(colors.border, 0.5)}`,
    py: 1.5,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(colors.primary, 0.02),
  },
});

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileIcon = (name, contentType) => {
  if (contentType?.startsWith('image/')) return <Image size={16} />;
  if (contentType?.includes('pdf')) return <FileText size={16} />;
  if (name?.endsWith('.zip') || name?.endsWith('.rar')) return <Archive size={16} />;
  return <File size={16} />;
};

const Almacenamiento = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('cvs');
  const [previewFile, setPreviewFile] = useState(null);

  const loadFolder = useCallback(async (folderPath) => {
    setLoading(true);
    try {
      const folderRef = ref(store, folderPath);
      const result = await listAll(folderRef);
      const fileData = await Promise.all(
        result.items.map(async (itemRef) => {
          const meta = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef).catch(() => null);
          return {
            name: meta.name || itemRef.name,
            fullPath: itemRef.fullPath,
            size: meta.size,
            contentType: meta.contentType,
            timeCreated: meta.timeCreated,
            updated: meta.updated,
            url,
          };
        })
      );
      fileData.sort((a, b) => new Date(b.timeCreated || 0) - new Date(a.timeCreated || 0));
      setFiles(fileData);
    } catch (error) {
      console.error('Error loading storage:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolder(currentFolder);
  }, [currentFolder, loadFolder]);

  const handleDelete = async (file) => {
    const result = await MySwal.fire({
      title: '¿Eliminar archivo?',
      text: `${file.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    setDeleting(file.fullPath);
    try {
      const fileRef = ref(store, file.fullPath);
      await deleteObject(fileRef);
      setFiles(prev => prev.filter(f => f.fullPath !== file.fullPath));
      MySwal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      MySwal.fire({ title: 'Error', text: 'No se pudo eliminar el archivo', icon: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const folders = [
    { path: 'cvs', label: 'CVs', icon: FileText },
    { path: 'images', label: 'Imágenes', icon: Image },
  ];

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(colors.primary, 0.08), color: colors.primary, display: 'flex' }}>
              <HardDrive size={22} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Almacenamiento</Typography>
            <Chip
              label={`${files.length} archivos`}
              size="small"
              sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            {formatBytes(totalSize)} utilizados
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {folders.map((f) => {
          const Icon = f.icon;
          return (
            <Chip
              key={f.path}
              icon={<Icon size={14} />}
              label={f.label}
              onClick={() => setCurrentFolder(f.path)}
              variant={currentFolder === f.path ? 'filled' : 'outlined'}
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.8125rem',
                bgcolor: currentFolder === f.path ? alpha(colors.primary, 0.1) : 'transparent',
                color: currentFolder === f.path ? colors.primary : colors.textSecondary,
                borderColor: currentFolder === f.path ? 'transparent' : colors.border,
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(colors.primary, 0.06) },
              }}
            />
          );
        })}
      </Box>

      {loading ? (
        <Box sx={{ py: 6 }}>
          <LinearProgress sx={{ borderRadius: 4, bgcolor: alpha(colors.primary, 0.08), '& .MuiLinearProgress-bar': { bgcolor: colors.primary } }} />
        </Box>
      ) : files.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '20px',
            bgcolor: alpha(colors.primary, 0.06), display: 'flex',
            alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, color: colors.primary,
          }}>
            <FolderOpen size={28} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Carpeta vacía</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            No hay archivos en esta carpeta
          </Typography>
        </Box>
      ) : (
        <StyledTable>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Archivo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Tamaño</TableCell>
                <TableCell>Subido</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, i) => (
                <TableRow key={file.fullPath}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: alpha(colors.primary, 0.06), color: colors.textSecondary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {getFileIcon(file.name, file.contentType)}
                      </Box>
                      <Typography
                        variant="body2"
                        onClick={() => file.url && setPreviewFile(file)}
                        sx={{ fontWeight: 500, fontSize: '0.8125rem', cursor: file.url ? 'pointer' : 'default', '&:hover': file.url ? { color: colors.primary, textDecoration: 'underline' } : {} }}
                        noWrap
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {file.contentType || 'Desconocido'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatBytes(file.size)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {formatDate(file.timeCreated)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {file.url && (
                        <>
                          <Tooltip title="Vista previa">
                            <IconButton
                              size="small"
                              onClick={() => setPreviewFile(file)}
                              sx={{ width: 32, height: 32, borderRadius: '8px', color: colors.textSecondary, '&:hover': { bgcolor: alpha(colors.primary, 0.06), color: colors.primary } }}
                            >
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar">
                            <IconButton
                              component="a"
                              href={file.url}
                              target="_blank"
                              rel="noopener"
                              size="small"
                              sx={{ width: 32, height: 32, borderRadius: '8px', color: colors.textSecondary, '&:hover': { bgcolor: alpha(colors.primary, 0.06), color: colors.primary } }}
                            >
                              <Download size={14} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(file)}
                          disabled={deleting === file.fullPath}
                          sx={{ width: 32, height: 32, borderRadius: '8px', color: colors.textMuted, '&:hover': { bgcolor: alpha(colors.danger, 0.08), color: colors.danger } }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTable>
      )}
      <FilePreviewModal
        open={Boolean(previewFile)}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </Box>
  );
};

export default Almacenamiento;
