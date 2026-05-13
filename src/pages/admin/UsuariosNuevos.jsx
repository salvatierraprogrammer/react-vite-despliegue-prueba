import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import {
  Box, Typography, Paper, Chip, IconButton, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, DialogActions,
  alpha, InputBase
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import { colors } from '../../theme/theme';
import { UserPlus, Search, Trash2, Eye, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

const MySwal = withReactContent(Swal);

const StyledTable = styled(Table)({
  '& .MuiTableCell-head': {
    color: colors.textMuted, fontWeight: 600, fontSize: '0.6875rem',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: `1px solid ${colors.border}`, padding: '14px 20px',
    backgroundColor: alpha(colors.primary, 0.02),
  },
  '& .MuiTableCell-body': {
    color: colors.textPrimary, fontSize: '0.875rem',
    borderBottom: `1px solid ${colors.border}`, padding: '12px 20px',
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-body': { borderBottom: 'none' },
  '& .MuiTableRow-root': { transition: 'all 0.15s ease', '&:hover': { backgroundColor: alpha(colors.primary, 0.02) } },
});

const RoleChip = styled(Chip)({
  height: 24, fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
  '&:hover': { opacity: 0.8 },
});

const UsuariosNuevos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) setUserRol(userDoc.data().userRol);
        const data = await getDocs(collection(db, 'usuarios'));
        setUsuarios(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleChangeRole = async () => {
    if (selectedUser) {
      await updateDoc(doc(db, 'usuarios', selectedUser.id), { userRol: newRole });
      setShowRoleDialog(false);
      const data = await getDocs(collection(db, 'usuarios'));
      setUsuarios(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }
  };

  const handleDelete = (id) => {
    MySwal.fire({
      title: '¿Eliminar usuario?', text: 'Esta acción no se puede deshacer.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
    }).then(async (r) => {
      if (r.isConfirmed) {
        await deleteDoc(doc(db, 'usuarios', id));
        setUsuarios(prev => prev.filter(u => u.id !== id));
        MySwal.fire('Eliminado', 'Usuario eliminado correctamente', 'success');
      }
    });
  };

  if (loading) return <LoadingPage />;
  if (userRol !== 'administrador') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <AlertTriangle size={48} color={colors.danger} style={{ marginBottom: 16 }} />
        <Typography variant="h5" sx={{ color: colors.danger, mb: 2 }}>No tienes permiso para acceder a esta página.</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>Volver al Dashboard</Button>
      </Box>
    );
  }

  const totalUsers = usuarios.length;
  const roles = ['todos', 'empleado', 'reclutador', 'administrador'];

  const filtered = usuarios
    .filter(u => selectedRoleFilter === 'todos' || u.userRol === selectedRoleFilter)
    .filter(u => `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
              Gestión de Usuarios
            </Typography>
            <Chip label={`${totalUsers} usuarios`} size="small"
              sx={{ height: 24, fontSize: '0.6875rem', fontWeight: 600, bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>Administra los usuarios registrados en la plataforma</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200, bgcolor: alpha(colors.background, 0.5), borderRadius: '10px', px: 1.5, border: `1px solid ${colors.border}` }}>
          <Search size={18} color={colors.textMuted} />
          <InputBase placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flex: 1, fontSize: '0.875rem', py: 0.75 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {roles.map(role => (
            <Chip key={role} label={role === 'todos' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
              size="small"
              onClick={() => setSelectedRoleFilter(role)}
              sx={{
                height: 28, fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: selectedRoleFilter === role ? colors.primary : 'transparent',
                color: selectedRoleFilter === role ? '#fff' : colors.textSecondary,
                border: `1px solid ${selectedRoleFilter === role ? colors.primary : colors.border}`,
                '&:hover': { bgcolor: selectedRoleFilter === role ? colors.primary : alpha(colors.primary, 0.06) },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: colors.textMuted }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5, color: colors.primary }}>
                      <UserPlus size={22} />
                    </Box>
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((usuario) => (
                  <TableRow key={usuario.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/ver-usuario/${usuario.id}`)}>
                    <TableCell sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={usuario.photo} sx={{ width: 36, height: 36, bgcolor: alpha(colors.primary, 0.08), color: colors.primary, fontSize: '0.8125rem' }}>
                          {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{usuario.nombre} {usuario.apellido}</Typography>
                          <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>{usuario.dni || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{usuario.email}</Typography></TableCell>
                    <TableCell>
                      <RoleChip label={usuario.userRol || 'Sin rol'} size="small"
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(usuario); setNewRole(usuario.userRol || 'empleado'); setShowRoleDialog(true); }}
                        sx={{
                          bgcolor: usuario.userRol === 'administrador' ? alpha(colors.warning, 0.1) : usuario.userRol === 'reclutador' ? alpha(colors.primary, 0.1) : alpha(colors.success, 0.1),
                          color: usuario.userRol === 'administrador' ? colors.warning : usuario.userRol === 'reclutador' ? colors.primary : colors.success,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={usuario.estado || 'pendiente'} size="small"
                        sx={{
                          height: 22, fontSize: '0.625rem', fontWeight: 600,
                          bgcolor: usuario.estado === 'activo' ? alpha(colors.success, 0.1) : usuario.estado === 'premium' ? alpha(colors.warning, 0.1) : alpha(colors.textMuted, 0.1),
                          color: usuario.estado === 'activo' ? colors.success : usuario.estado === 'premium' ? colors.warning : colors.textMuted,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                        <IconButton onClick={() => navigate(`/ver-usuario/${usuario.id}`)}
                          sx={{ width: 32, height: 32, bgcolor: alpha(colors.primary, 0.08), color: colors.primary, borderRadius: '8px', '&:hover': { bgcolor: alpha(colors.primary, 0.15) } }}>
                          <Eye size={14} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(usuario.id)}
                          sx={{ width: 32, height: 32, bgcolor: alpha(colors.danger, 0.08), color: colors.danger, borderRadius: '8px', '&:hover': { bgcolor: alpha(colors.danger, 0.15) } }}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Paper>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onClose={() => setShowRoleDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Cambiar Rol</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            {selectedUser?.nombre} {selectedUser?.apellido}
          </Typography>
          <FormControl fullWidth size="small">
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value)} sx={{ borderRadius: '10px' }}>
              <MenuItem value="empleado">Empleado</MenuItem>
              <MenuItem value="reclutador">Reclutador</MenuItem>
              <MenuItem value="administrador">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowRoleDialog(false)} variant="outlined" sx={{ borderRadius: '10px' }}>Cancelar</Button>
          <Button onClick={handleChangeRole} variant="contained" sx={{ borderRadius: '10px' }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosNuevos;
