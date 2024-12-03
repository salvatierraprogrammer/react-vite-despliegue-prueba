import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Cargando from './Cargando';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';

const MySwal = withReactContent(Swal);

const CvEnviados = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          console.log('User ID:', userId); // Mensaje de depuración
          
          // Fetch CVs
          const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');
          const querySnapshot = await getDocs(mailEnviadosCollection);
          const cvsData = querySnapshot.docs
            .filter((doc) => doc.data().userIdUsers === userId)
            .map((doc) => ({ id: doc.id, ...doc.data() }));
          console.log('CVs data:', cvsData);

          // Fetch publicaciones
          const publicacionesCollection = collection(db, 'publicaciones');
          const publicacionesSnapshot = await getDocs(publicacionesCollection);
          const publicacionesData = publicacionesSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data().photo; // Assumes 'photo' is the field name for image URL
            return acc;
          }, {});

          // Add image URLs to CVs data
          const cvsWithImages = cvsData.map(cv => ({
            ...cv,
            fotoUrl: publicacionesData[cv.userIdPublicacion] || '', // Use an empty string if no URL found
          }));

          setCvs(cvsWithImages);
        } else {
          console.log('No user is currently signed in.');
        }
      } catch (error) {
        console.error("Error fetching CVs: ", error);
      }
      setLoading(false);
    };

    fetchCvs();
  }, []);

  const handleEliminarConfirmation = (id) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleEliminar(id);
      }
    });
  };

  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'mailEnviadosPostulado', id));
      setCvs(cvs.filter(cv => cv.id !== id));
    } catch (error) {
      console.error("Error deleting CV: ", error);
    }
  };

  if (loading) {
    return <Cargando />;
  }

  return (
    <div className="container mt-5">
      <h1 className='text-white'>CV Enviados</h1>
      <div className="row">
        <div className="col">
          <div className="footer-modal">
            <Link to={'/buscar-trabajo'} className="btn btn-secondary mt-2 mb-2">Volver al inicio</Link>
          </div>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#504683' }}>Foto</TableCell>
                  <TableCell sx={{ color: '#504683' }}>Nº Paciente</TableCell>
                  <TableCell sx={{ color: '#504683' }}>Entidad</TableCell>
                  <TableCell sx={{ color: '#504683' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#504683' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cvs.length > 0 ? (
                  cvs.map(cv => (
                    <TableRow key={cv.id}>
                      <TableCell>
                        <img 
                          src={cv.fotoUrl} 
                          alt="Foto de publicación" 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover', 
                            borderRadius: '50%' // Makes the image circular
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#504683' }}>{cv.numeroPaciente}</TableCell>
                      <TableCell sx={{ color: '#504683' }}>{cv.NombreCliente}</TableCell>
                      <TableCell sx={{ color: '#504683' }}>{cv.estado}</TableCell>
                      <TableCell>
                        <IconButton color="primary" component={Link} to={`/verCaso/${cv.userIdPublicacion}`} className="me-2">
                          <Visibility />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleEliminarConfirmation(cv.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="alert alert-secondary text-center">No hay CVs enviados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default CvEnviados;