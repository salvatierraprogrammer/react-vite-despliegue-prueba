import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Cargando from './Cargando';
import './css/CvRecibidos.css';

const MySwal = withReactContent(Swal);

const CvRecibidos = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [viewedCvs, setViewedCvs] = useState(new Set()); // Track viewed CVs
  const navigate = useNavigate();
 
  const handleGoBack = () => {
    navigate(-1); // Va a la página anterior
  };
  useEffect(() => {
    const fetchCvs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const currentUserId = user.uid;
          setUserId(currentUserId);
          console.log('User ID:', currentUserId);

          // Fetch user role
          const userDocRef = doc(db, 'usuarios', currentUserId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();
          console.log('User Data:', userData);
          setUserRole(userData?.userRol || ''); // Assuming 'userRol' field exists

          // Only proceed if the user is a 'reclutador'
          if (userData?.userRol === 'reclutador') {
            // Fetch CVs received
            const cvRecibidosCollection = collection(db, 'mailEnviadosPostulado');
            const querySnapshot = await getDocs(cvRecibidosCollection);
            const cvsData = querySnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(cv => cv.userIdReclutador === currentUserId); // Compare userIdReclutador with currentUserId
            console.log('CVs data:', cvsData);

            // Fetch publicaciones
            const publicacionesCollection = collection(db, 'publicaciones');
            const publicacionesSnapshot = await getDocs(publicacionesCollection);
            const publicacionesData = publicacionesSnapshot.docs.reduce((acc, doc) => {
              acc[doc.id] = doc.data().photo;
              return acc;
            }, {});
            console.log('Publicaciones data:', publicacionesData);

            // Add image URLs to CVs data
            const cvsWithImages = cvsData.map(cv => ({
              ...cv,
              fotoUrl: publicacionesData[cv.userIdPublicacion] || '', // Default to empty string if no URL found
            }));

            // Group CVs by patient number and count the number of emails
            const groupedCvs = cvsWithImages.reduce((acc, cv) => {
              if (!acc[cv.numeroPaciente]) {
                acc[cv.numeroPaciente] = {
                  ...cv,
                  cantidadCorreos: 0,
                  fotoUrl: cv.fotoUrl
                };
              }
              acc[cv.numeroPaciente].cantidadCorreos += 1;
              return acc;
            }, {});

            setCvs(Object.values(groupedCvs));
          } else {
            console.log('User is not a reclutador.');
          }
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
      await deleteDoc(doc(db, 'mailEnviadosPostulado', id)); // Ensure correct collection name
      setCvs(cvs.filter(cv => cv.id !== id));
    } catch (error) {
      console.error("Error deleting CV: ", error);
    }
  };

  const handleVerClick = async (cv) => {
    if (!viewedCvs.has(cv.id)) {
      // Update CV status to 'Leído'
      const cvRef = doc(db, 'mailEnviadosPostulado', cv.id);
      await updateDoc(cvRef, { estado: 'Leído' });

      // Add CV ID to the set of viewed CVs
      setViewedCvs(new Set(viewedCvs.add(cv.id)));
    }
  };

  if (loading) {
    return <Cargando />;
  }

  return (
    <div className="container mt-4">
      <h1 className='text-white'>CV Recibidos</h1>
      <div className="row">
        <div className="col">
          <div className="footer-modal">
            <button onClick={handleGoBack} className="btn btn-secondary mt-2 mb-2">Inicio</button>
          </div>
          <table className="table table-custom table-hover">
            <thead className='theadAgregarColor'>
              <tr>
                <th>Foto</th>
                <th>Nº Paciente</th>
                <th>Entidad</th>
                <th>Estado</th>
                <th>Cantidad de Correos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cvs.length > 0 ? (
                cvs.map(cv => (
                  <tr key={cv.numeroPaciente}>
                    <td>
                      <img 
                        src={cv.fotoUrl} 
                        alt="Foto de publicación" 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover', 
                          borderRadius: '50%' 
                        }} 
                      />
                    </td>
                    <td className='text-white'>{cv.numeroPaciente}</td>
                    <td className='text-white'>{cv.NombreCliente}</td>
                    <td className='text-white'>{cv.estado}</td>
                    <td className='text-white'>{cv.cantidadCorreos}</td>
                    <td>
                      <Link 
                        to={`/verCaso/${cv.userIdPublicacion}`} 
                        className="btn btn-light me-2 mb-2"
                        onClick={() => handleVerClick(cv)} // Update status on click
                      >
                        <i className="fa-regular fa-eye"></i>
                      </Link>
                      <button 
                        className="btn btn-light me-2 mb-2"
                        onClick={() => handleEliminarConfirmation(cv.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="alert alert-secondary text-center">No hay CVs recibidos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CvRecibidos;