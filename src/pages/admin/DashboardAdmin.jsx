import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  Box, Grid, Typography, Paper, Avatar, Chip, LinearProgress,
  Button, InputBase, IconButton, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import {
  Users, Briefcase, FileText, TrendingUp, Eye, Clock,
  RefreshCw, Search, MoreVertical, CheckCircle, XCircle,
  AlertCircle, UserCheck, UserX, Sparkles, ChevronRight,
  Mail, Phone, Shield, Activity, User, Plus
} from 'lucide-react';

const MetricCard = memo(({ icon, title, value, color, delay }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    elevation={0}
    sx={{
      p: 3, borderRadius: '20px', border: `1px solid ${colors.border}`,
      bgcolor: colors.surface, position: 'relative', overflow: 'hidden',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(color, 0.15)}` },
      transition: 'all 0.2s ease',
    }}
  >
    <Box sx={{
      position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
    }} />
    <Box sx={{
      width: 48, height: 48, borderRadius: '14px',
      backgroundColor: alpha(color, 0.1), display: 'flex',
      alignItems: 'center', justifyContent: 'center', color, mb: 2
    }}>
      {icon}
    </Box>
    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{value}</Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary }}>{title}</Typography>
  </Paper>
));

const StatusChip = ({ status }) => {
  const config = {
    activo: { color: colors.success, label: 'Activo', icon: <CheckCircle size={12} /> },
    pendiente: { color: colors.warning, label: 'Pendiente', icon: <AlertCircle size={12} /> },
    inactivo: { color: colors.danger, label: 'Inactivo', icon: <XCircle size={12} /> },
  };
  const { color, label, icon } = config[status] || config.pendiente;
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 500, '& .MuiChip-icon': { color } }}
    />
  );
};

const UserActionsMenu = ({ user, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = () => setAnchorEl(null);

  const handleAction = async (action) => {
    handleClose();
    await onUpdate(user.id, action);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleAction('view')}>
          <Eye size={14} style={{ marginRight: 8 }} /> Ver perfil
        </MenuItem>
        {user.estado !== 'activo' && (
          <MenuItem onClick={() => handleAction('activate')}>
            <UserCheck size={14} style={{ marginRight: 8 }} /> Activar
          </MenuItem>
        )}
        {user.estado === 'activo' && (
          <MenuItem onClick={() => handleAction('deactivate')} sx={{ color: colors.danger }}>
            <UserX size={14} style={{ marginRight: 8 }} /> Desactivar
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const DashboardAdmin = () => {
  const { userRol } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState({ total: 0, activos: 0, pendientes: 0, empleados: 0, reclutadores: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

  const fetchData = useCallback(async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'usuarios'));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const activos = usersData.filter(u => u.estado === 'activo').length;
      const pendientes = usersData.filter(u => u.estado === 'pendiente' || u.estado === undefined).length;
      const empleados = usersData.filter(u => u.userRol === 'empleado').length;
      const reclutadores = usersData.filter(u => u.userRol === 'reclutador').length;

      setStats({
        total: usersData.length,
        activos,
        pendientes,
        empleados,
        reclutadores,
      });
      setUsuarios(usersData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateUser = async (userId, action) => {
    if (action === 'view') {
      navigate(`/ver-usuario/${userId}`);
    } else if (action === 'activate' || action === 'deactivate') {
      const estado = action === 'activate' ? 'activo' : 'inactivo';
      await updateDoc(doc(db, 'usuarios', userId), { estado });
      fetchData();
    }
  };

  const filteredUsers = usuarios.filter(user => {
    const matchSearch = user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'todos' || user.userRol === filterRole;
    return matchSearch && matchRole;
  });

  if (userRol !== 'administrador') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: colors.textSecondary }}>
          No tienes permisos para acceder a esta sección
        </Typography>
      </Box>
    );
  }

  if (loading) return <LoadingPage />;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Panel de Administración
          </Typography>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            Gestiona usuarios y actividades de la plataforma
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<User size={16} />} onClick={() => navigate('/miCuenta')}>
            Mi Perfil
          </Button>
          <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => navigate('/nuevaPublicacion')}>
            Nueva Publicación
          </Button>
          <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={fetchData}>
            Actualizar
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <Users size={24} />, title: 'Total Usuarios', value: stats.total, color: colors.primary },
          { icon: <UserCheck size={24} />, title: 'Activos', value: stats.activos, color: colors.success },
          { icon: <AlertCircle size={24} />, title: 'Pendientes', value: stats.pendientes, color: colors.warning },
          { icon: <Shield size={24} />, title: 'Reclutadores', value: stats.reclutadores, color: colors.secondary },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <MetricCard {...item} delay={i} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200, bgcolor: colors.surfaceSecondary, borderRadius: '12px', px: 2 }}>
            <Search size={18} color={colors.textMuted} />
            <InputBase placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['todos', 'administrador', 'reclutador', 'empleado', 'familiar'].map(role => (
              <Chip
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                onClick={() => setFilterRole(role)}
                variant={filterRole === role ? 'filled' : 'outlined'}
                sx={{
                  bgcolor: filterRole === role ? colors.primary : 'transparent',
                  color: filterRole === role ? '#fff' : colors.textSecondary,
                }}
              />
            ))}
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.slice(0, 20).map((user) => (
                <TableRow key={user.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/ver-usuario/${user.id}`)}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={user.photo} sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}>
                        {user.nombre?.[0]}{user.apellido?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.nombre} {user.apellido}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          {user.dni}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={user.userRol || 'Sin rol'} size="small" sx={{ bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={user.estado || 'pendiente'} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {user.fechaCreacion ? new Date(user.fechaCreacion.seconds * 1000).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <UserActionsMenu user={user} onUpdate={handleUpdateUser} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DashboardAdmin;