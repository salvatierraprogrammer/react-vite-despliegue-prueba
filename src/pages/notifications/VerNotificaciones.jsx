import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, IconButton, Tab, Tabs,
  alpha, Divider, Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';
import {
  Bell, User, Settings, CheckCheck, ArrowLeft,
  Mail, Briefcase, Clock, Eye, Star, AlertCircle,
  Users, FileText, MessageCircle,
} from 'lucide-react';

const PageHeader = styled(Box)({
  mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
});

const NotificationCard = styled(Paper, { shouldForwardProp: (prop) => prop !== 'unread' })(({ unread }) => ({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  backgroundColor: unread ? alpha(colors.primary, 0.03) : colors.surface,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: `0 4px 16px ${alpha(colors.primary, 0.06)}`,
    borderColor: alpha(colors.primary, 0.15),
  },
}));

const roleNotifications = {
  empleado: [
    { id: 1, title: 'Nueva postulación recibida', description: 'Un reclutador ha mostrado interés en tu perfil. Revisa los detalles de la oportunidad.', time: 'Hace 5 min', icon: User, read: false },
    { id: 2, title: 'Tu CV fue visto por un reclutador', description: 'El reclutador Carlos López ha visto tu perfil laboral.', time: 'Hace 1 hora', icon: Eye, read: false },
    { id: 3, title: 'Perfil actualizado correctamente', description: 'Los cambios en tu perfil laboral han sido guardados.', time: 'Ayer', icon: Settings, read: true },
    { id: 4, title: 'Nuevo caso disponible', description: 'Hay un nuevo caso de acompañamiento en tu zona.', time: 'Hace 2 días', icon: Briefcase, read: true },
    { id: 5, title: 'Recordatorio: completa tu perfil', description: 'Tu perfil está incompleto. Agrega tu formación y experiencia para recibir más postulaciones.', time: 'Hace 3 días', icon: AlertCircle, read: true },
  ],
  reclutador: [
    { id: 1, title: 'Nuevo postulante para tu caso', description: 'María González ha aplicado a tu caso de acompañamiento.', time: 'Hace 10 min', icon: User, read: false },
    { id: 2, title: 'CV recibido de acompañante', description: 'Juan Pérez ha enviado su CV para tu publicación.', time: 'Hace 2 horas', icon: FileText, read: false },
    { id: 3, title: 'Publicación actualizada', description: 'Tu caso ha sido actualizado y está visible para los AT.', time: 'Ayer', icon: Settings, read: true },
    { id: 4, title: 'Nuevo AT disponible en tu zona', description: 'Un nuevo acompañante terapéutico se ha registrado en tu área.', time: 'Hace 2 días', icon: Users, read: true },
    { id: 5, title: 'Recordatorio: revisa tus postulaciones', description: 'Tienes postulaciones pendientes por revisar.', time: 'Hace 4 días', icon: Bell, read: true },
  ],
  administrador: [
    { id: 1, title: 'Nuevo usuario registrado', description: 'Un nuevo usuario se ha registrado en la plataforma.', time: 'Hace 15 min', icon: User, read: false },
    { id: 2, title: 'AT pendiente de verificación', description: 'Hay 3 acompañantes terapéuticos esperando verificación de documentos.', time: 'Hace 30 min', icon: Clock, read: false },
    { id: 3, title: 'Reporte semanal disponible', description: 'El reporte de actividad semanal ya está disponible para descargar.', time: 'Ayer', icon: Settings, read: true },
    { id: 4, title: 'Nuevo reclutador registrado', description: 'Una agencia de reclutamiento ha solicitado acceso a la plataforma.', time: 'Hace 2 días', icon: Briefcase, read: true },
    { id: 5, title: 'Actualización del sistema', description: 'La plataforma ha sido actualizada con nuevas funcionalidades.', time: 'Hace 5 días', icon: Star, read: true },
  ],
  familiar: [
    { id: 1, title: 'Postulación a tu caso', description: 'Un acompañante ha aplicado al caso que publicaste.', time: 'Hace 20 min', icon: User, read: false },
    { id: 2, title: 'Actualización de caso', description: 'El estado de tu caso ha sido actualizado.', time: 'Hace 1 día', icon: Settings, read: true },
    { id: 3, title: 'Nuevos AT disponibles', description: 'Hay nuevos acompañantes disponibles en tu zona.', time: 'Hace 3 días', icon: Users, read: true },
    { id: 4, title: 'Recordatorio: caso activo', description: 'Tu caso sigue activo. Revisa las postulaciones recibidas.', time: 'Hace 5 días', icon: Bell, read: true },
  ],
};

const VerNotificaciones = () => {
  const { userRol } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState(roleNotifications[userRol] || roleNotifications.empleado);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = tabValue === 0 ? notifications : notifications.filter(n => tabValue === 1 ? !n.read : n.read);

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const roleLabel = {
    administrador: 'Administrador',
    reclutador: 'Reclutador',
    empleado: 'Acompañante AT',
    familiar: 'Familiar',
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(colors.primary, 0.08), color: colors.primary, display: 'flex' }}>
              <Bell size={20} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Notificaciones</Typography>
            <Chip
              label={`${unreadCount} sin leer`}
              size="small"
              sx={{
                height: 22, fontSize: '0.6875rem', fontWeight: 600,
                bgcolor: unreadCount > 0 ? alpha(colors.primary, 0.1) : alpha(colors.textMuted, 0.08),
                color: unreadCount > 0 ? colors.primary : colors.textMuted,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {roleLabel[userRol] || 'Usuario'} · {notifications.length} notificaciones
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<CheckCheck size={14} />} onClick={handleMarkAllRead}
              sx={{ borderRadius: '10px', fontWeight: 600, fontSize: '0.8125rem' }}>
              Marcar todas leídas
            </Button>
          )}
        </Box>
      </PageHeader>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}
        sx={{
          mb: 3, minHeight: 44,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 44, py: 1 },
        }}>
        <Tab label="Todas" />
        <Tab label={`No leídas (${unreadCount})`} />
        <Tab label="Leídas" />
      </Tabs>

      {filteredNotifs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: alpha(colors.primary, 0.06), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: colors.primary }}>
            <Bell size={24} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>No hay notificaciones</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {tabValue === 1 ? 'No tienes notificaciones sin leer' : 'No hay notificaciones para mostrar'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredNotifs.map((notif) => {
            const IconComp = notif.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <NotificationCard
                  unread={!notif.read}
                  elevation={0}
                  onClick={() => handleMarkRead(notif.id)}
                >
                  <Box sx={{ display: 'flex', gap: 2, p: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                      bgcolor: !notif.read ? alpha(colors.primary, 0.1) : alpha(colors.textMuted, 0.06),
                      color: !notif.read ? colors.primary : colors.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IconComp size={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: !notif.read ? 600 : 500, color: colors.textPrimary }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {notif.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.25, lineHeight: 1.5 }}>
                        {notif.description}
                      </Typography>
                    </Box>
                    {!notif.read && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors.primary, flexShrink: 0, mt: 0.5 }} />
                    )}
                    {notif.read && (
                      <Tooltip title="Leída">
                        <CheckCheck size={14} color={colors.textMuted} />
                      </Tooltip>
                    )}
                  </Box>
                </NotificationCard>
              </motion.div>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default VerNotificaciones;
