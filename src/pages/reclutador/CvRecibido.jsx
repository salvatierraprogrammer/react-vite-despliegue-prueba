import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfg/firebase';
import {
  Box, Typography, Paper, Chip, IconButton, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../theme/theme';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Eye, Trash2, ArrowLeft, Building2,
  Clock, MessageSquare, Inbox
} from 'lucide-react';

const MySwal = withReactContent(Swal);

const StyledTable = styled(Table)({
  '& .MuiTableCell-head': {
    color: colors.textMuted,
    fontWeight: 600,
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: `1px solid ${colors.border}`,
    padding: '16px 20px',
    backgroundColor: alpha(colors.primary, 0.02),
  },
  '& .MuiTableCell-body': {
    color: colors.textPrimary,
    fontSize: '0.875rem',
    borderBottom: `1px solid ${colors.border}`,
    padding: '14px 20px',
  },
  '& .MuiTableRow-root:last-child .MuiTableCell-body': {
    borderBottom: 'none',
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.02),
    },
  },
});

const EmptyState = ({ icon: Icon, title, description }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', py: 10, px: 4, textAlign: 'center',
  }}>
    <Box sx={{
      width: 80, height: 80, borderRadius: '24px',
      backgroundColor: alpha(colors.primary, 0.06),
      display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
    }}>
      <Icon size={36} color={colors.primary} />
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: colors.textSecondary, maxWidth: 360 }}>
      {description}
    </Typography>
  </Box>
);

const CvRecibidos = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const currentUserId = user.uid;

          const userDocRef = doc(db, 'usuarios', currentUserId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          if (userData?.userRol === 'reclutador') {
            const cvRecibidosCollection = collection(db, 'mailEnviadosPostulado');
            const querySnapshot = await getDocs(cvRecibidosCollection);
            const cvsData = querySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(cv => cv.userIdReclutador === currentUserId);

            const publicacionesCollection = collection(db, 'publicaciones');
            const publicacionesSnapshot = await getDocs(publicacionesCollection);
            const publicacionesData = publicacionesSnapshot.docs.reduce((acc, doc) => {
              acc[doc.id] = doc.data().photo;
              return acc;
            }, {});

            const cvsWithImages = cvsData.map(cv => ({
              ...cv,
              fotoUrl: publicacionesData[cv.userIdPublicacion] || '',
            }));

            const groupedCvs = cvsWithImages.reduce((acc, cv) => {
              if (!acc[cv.numeroPaciente]) {
                acc[cv.numeroPaciente] = {
                  ...cv,
                  cantidadCorreos: 0,
                  fotoUrl: cv.fotoUrl,
                  mails: [],
                };
              }
              acc[cv.numeroPaciente].cantidadCorreos += 1;
              acc[cv.numeroPaciente].mails.push(cv);
              return acc;
            }, {});

            setCvs(Object.values(groupedCvs));
          }
        }
      } catch (error) {
        console.error("Error fetching CVs: ", error);
      }
      setLoading(false);
    };
    fetchCvs();
  }, []);

  const handleEliminarConfirmation = (cv) => {
    MySwal.fire({
      title: '¿Eliminar postulación?',
      text: `Se eliminarán todos los correos del paciente ${cv.numeroPaciente}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: colors.danger,
      cancelButtonColor: colors.textMuted,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) handleEliminar(cv);
    });
  };

  const handleEliminar = async (cv) => {
    try {
      const deletePromises = cv.mails.map(mail =>
        deleteDoc(doc(db, 'mailEnviadosPostulado', mail.id))
      );
      await Promise.all(deletePromises);
      setCvs(cvs.filter(c => c.id !== cv.id));
      MySwal.fire({ title: 'Eliminado', text: 'Las postulaciones fueron eliminadas', icon: 'success' });
    } catch (error) {
      console.error("Error deleting CVs: ", error);
    }
  };

  const handleVerClick = async (cv) => {
    try {
      const updatePromises = cv.mails.map(mail =>
        updateDoc(doc(db, 'mailEnviadosPostulado', mail.id), { estado: 'Leído' })
      );
      await Promise.all(updatePromises);
      setCvs(prev => prev.map(c => {
        if (c.id === cv.id) {
          return { ...c, estado: 'Leído', mails: c.mails.map(m => ({ ...m, estado: 'Leído' })) };
        }
        return c;
      }));
    } catch (error) {
      console.error("Error updating CV status: ", error);
    }
  };

  if (loading) return <LoadingPage />;

  const totalCorreos = cvs.reduce((acc, cv) => acc + cv.cantidadCorreos, 0);

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.02em' }}>
              CVs Recibidos
            </Typography>
            <Chip
              label={`${cvs.length} pacientes`}
              size="small"
              sx={{ height: 24, fontSize: '0.6875rem', fontWeight: 600, bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {totalCorreos > 0 ? `${totalCorreos} postulaciones recibidas` : 'Postulaciones recibidas para tus publicaciones'}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>

      {cvs.length > 0 ? (
        <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Paciente</TableCell>
                    <TableCell>Entidad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Correos</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cvs.map((cv, index) => (
                    <TableRow
                      key={cv.numeroPaciente}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(colors.primary, 0.02) } }}
                      onClick={() => handleVerClick(cv)}
                    >
                      <TableCell sx={{ pl: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={cv.fotoUrl}
                            sx={{
                              width: 40, height: 40, borderRadius: '12px',
                              bgcolor: alpha(colors.primary, 0.08), color: colors.primary,
                            }}
                          >
                            <Building2 size={18} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }}>
                              {cv.numeroPaciente}
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
                              ID: {cv.numeroPaciente}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: colors.textPrimary, fontWeight: 500 }}>
                          {cv.NombreCliente || 'Sin entidad'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cv.estado === 'Leído' ? 'Leído' : 'Nuevo'}
                          size="small"
                          icon={cv.estado === 'Leído' ? <MessageSquare size={12} /> : <Clock size={12} />}
                          sx={{
                            height: 26, fontSize: '0.6875rem', fontWeight: 600,
                            bgcolor: cv.estado === 'Leído' ? alpha(colors.success, 0.1) : alpha(colors.warning, 0.1),
                            color: cv.estado === 'Leído' ? colors.success : colors.warning,
                            '& .MuiChip-icon': { fontSize: 12 },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{
                          width: 28, height: 28, borderRadius: '8px',
                          backgroundColor: alpha(colors.primary, 0.06),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: colors.primary, fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          {cv.cantidadCorreos}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); navigate(`/verCaso/${cv.userIdPublicacion}`); }}
                            sx={{ width: 34, height: 34, bgcolor: alpha(colors.primary, 0.08), color: colors.primary, borderRadius: '10px', '&:hover': { bgcolor: alpha(colors.primary, 0.15) } }}
                          >
                            <Eye size={15} />
                          </IconButton>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleEliminarConfirmation(cv); }}
                            sx={{ width: 34, height: 34, bgcolor: alpha(colors.danger, 0.08), color: colors.danger, borderRadius: '10px', '&:hover': { bgcolor: alpha(colors.danger, 0.15) } }}
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </StyledTable>
            </TableContainer>
          </Paper>
        </Box>
      ) : (
        <Box component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}` }}>
            <EmptyState icon={Inbox} title="No hay CVs recibidos" description="Aún no has recibido postulaciones para tus publicaciones. Las solicitudes de los acompañantes aparecerán aquí." />
          </Paper>
        </Box>
      )}

      {cvs.length > 0 && (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: colors.textMuted, fontSize: '0.6875rem' }}>
            {totalCorreos} correo{totalCorreos !== 1 ? 's' : ''} en {cvs.length} paciente{cvs.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CvRecibidos;
