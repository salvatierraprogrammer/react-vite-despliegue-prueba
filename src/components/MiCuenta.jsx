import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { Button, Modal, TextField, Typography, Grid, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MiPerfilReclutador from './MiPerfilReclutador';
import Cargando from './Cargando';

const MiCuenta = () => {
  const [userData, setUserData] = useState(null);
  const [userRol, setUserRol] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatedUserData, setUpdatedUserData] = useState({
    nombre: '',
    apellido: '',
    phoneNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserRol(data.userRol);
            setUpdatedUserData({
              nombre: data.nombre,
              apellido: data.apellido,
              phoneNumber: data.phoneNumber
            });
          } else {
            setError('No se encontraron datos del usuario.');
          }
        } else {
          setError('Usuario no autenticado.');
        }
      } catch (err) {
        setError('Error al cargar los datos del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.updatePassword(newPassword);
        alert('Contraseña cambiada exitosamente.');
        setShowChangePasswordModal(false);
        setNewPassword('');
      } catch (error) {
        alert('Error al cambiar la contraseña: ' + error.message);
      }
    }
  };

  const handleEditAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        await updateDoc(userRef, updatedUserData);
        alert('Datos de usuario actualizados exitosamente.');
        setUserData(updatedUserData);
        setShowEditAccountModal(false);
      } catch (error) {
        alert('Error al actualizar los datos: ' + error.message);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        await deleteDoc(userRef);
        await user.delete();
        alert('Cuenta eliminada exitosamente.');
        // Redirigir a la página de inicio o cerrar sesión
      } catch (error) {
        alert('Error al eliminar la cuenta: ' + error.message);
      }
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Va a la página anterior
  };

  if (loading) return <Cargando />;
  if (error) return <p>{error}</p>;

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', marginTop: 10 }}>
      <Typography variant="h3" align="center" color="#504683" gutterBottom>
        Mi Cuenta
      </Typography>
      <Button variant="outlined" onClick={handleGoBack} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 3, backgroundColor: '#fff' }}>
            <Typography variant="h5" color="#504683" gutterBottom>
              Datos de Usuario
            </Typography>
            {userData ? (
              <>
                <Typography variant="body1" color="textSecondary">
                  <strong styles={{color: "#504683"}}>Nombre:</strong> {userData.nombre} {userData.apellido}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>Teléfono:</strong> {userData.phoneNumber}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>Email:</strong> {userData.email}
                </Typography>
                <Grid container spacing={2} justifyContent="flex-start" sx={{ mt: 2 }}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setShowChangePasswordModal(true)}
                      startIcon={<i className="fa-solid fa-key"></i>}
                    >
                      Cambiar Contraseña
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => setShowEditAccountModal(true)}
                      startIcon={<i className="fa-solid fa-user-edit"></i>}
                    >
                      Editar Cuenta
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setShowDeleteAccountModal(true)}
                      startIcon={<i className="fa-solid fa-trash"></i>}
                    >
                      Eliminar Cuenta
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No se encontraron datos del usuario.
              </Typography>
            )}
          </Paper>

          {/* Mostrar MiPerfilReclutador solo si el rol es 'reclutador' */}
          {userRol === 'reclutador' && (
            <Paper sx={{ padding: 3, marginTop: 3 }}>
              <Typography variant="h5" color="textPrimary" gutterBottom>
                Mi Perfil Reclutador
              </Typography>
              <MiPerfilReclutador />
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Modal Cambiar Contraseña */}
      <Modal open={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)}>
        <Box sx={{ backgroundColor: 'white', padding: 3, borderRadius: 2, maxWidth: 400, margin: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Cambiar Contraseña
          </Typography>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item>
              <Button variant="outlined" onClick={() => setShowChangePasswordModal(false)}>
                Cancelar
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleChangePassword}>
                Cambiar Contraseña
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal Editar Cuenta */}
      <Modal open={showEditAccountModal} onClose={() => setShowEditAccountModal(false)}>
        <Box sx={{ backgroundColor: 'white', padding: 3, borderRadius: 2, maxWidth: 400, margin: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Editar Cuenta
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={updatedUserData.nombre}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, nombre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Apellido"
            variant="outlined"
            value={updatedUserData.apellido}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, apellido: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            variant="outlined"
            value={updatedUserData.phoneNumber}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item>
              <Button variant="outlined" onClick={() => setShowEditAccountModal(false)}>
                Cancelar
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleEditAccount}>
                Guardar Cambios
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal Eliminar Cuenta */}
      <Modal open={showDeleteAccountModal} onClose={() => setShowDeleteAccountModal(false)}>
        <Box sx={{ backgroundColor: 'white', padding: 3, borderRadius: 2, maxWidth: 400, margin: 'auto' }}>
          <Typography variant="h6" color="error" gutterBottom>
            ¿Estás seguro de que deseas eliminar tu cuenta?
          </Typography>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item>
              <Button variant="outlined" onClick={() => setShowDeleteAccountModal(false)}>
                Cancelar
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                Eliminar Cuenta
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default MiCuenta;