import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import './css/VerCaso.css';
import Cargando from './Cargando';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const VerReclutadorEmail = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [mailEnviados, setMailEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'usuarios', currentUser.uid);
        await getDoc(userDocRef); // It's unclear why you're fetching the user document here; you may remove it if unnecessary.

        const docRef = doc(db, 'publicaciones', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPublicacion(data);

          const mailQuery = query(
            collection(db, 'mailEnviadosPostulado'),
            where('userIdPublicacion', '==', id)
          );
          const mailQuerySnapshot = await getDocs(mailQuery);
          const mails = mailQuerySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setMailEnviados(mails);

          if (mails.length > 0) {
            const lastMail = mails[mails.length - 1];
            const mailDocRef = doc(db, 'mailEnviadosPostulado', lastMail.id);
            await updateDoc(mailDocRef, { estado: 'Leído' });
          }
        } else {
          setPublicacion(null);
        }
      } catch (error) {
        console.error('Error al obtener la publicación:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      // Any cleanup logic can go here
    };
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleContactClick = (acompananteId) => {
    const user = auth.currentUser;
    if (!user) {
      MySwal.fire({
        title: 'Debes iniciar sesión',
        text: 'Por favor, inicia sesión para poder contactar con el acompañante.',
        icon: 'warning',
        showCloseButton: true,
        confirmButtonText: 'Iniciar sesión',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    } else {
      const userRole = user?.role || 'guest'; // Ensure the user role is available
      if (userRole !== 'reclutador') {
        navigate(`/showPerfil/${acompananteId}`);
      } else {
        
        MySwal.fire({
          title: 'Acceso denegado',
          text: 'Solo los reclutadores pueden contactar con los acompañantes.',
          icon: 'error',
          showCloseButton: true,
          confirmButtonText: 'Aceptar',
        });
      }
    }
  };

  if (loading) {
    return <Cargando />;
  }

  if (!publicacion) {
    return <div className="text-center">No se encontró la publicación.</div>;
  }

  return (
    <div className="card ver-reclutador-email-container" sx={{backgroundColor: '#F3F3F3'}}>
      <h2 className="text-center mb-4 text-white">
        <div className="me-md-3">
          <i className="fas fa-envelope fa-2x text-white me-2"></i>
        </div>
        Correos recibidos
      </h2>
      
      {mailEnviados.length > 0 ? (
        <ul className="list-group text-start">
          {mailEnviados.map((mail) => (
            <li key={mail.id} className="list-group-item d-flex flex-column flex-md-row align-items-start mb-3 shadow-sm p-3">
              <div className="flex-grow-1">
                <h5 className="mb-1 text-white"><strong>{mail.nombre} {mail.apellido}</strong></h5>
                <p className="mb-1 text-white"><i className="fas fa-envelope me-2"></i><strong>Email:</strong> {mail.email}</p>
                <p className="mb-1 text-white"><i className="fas fa-file-alt me-2"></i><strong>Descripción:</strong> {mail.descripcion}</p>
                <p className="mb-1 text-white"><i className="fas fa-calendar-day me-2"></i><strong>Fecha de Envío:</strong> {new Date(mail.fechaEnvio.seconds * 1000).toLocaleDateString()} {new Date(mail.fechaEnvio.seconds * 1000).toLocaleTimeString()}</p>
                <p className="mb-1 text-white"><i className="fas fa-file-alt me-2"></i><strong>Estado:</strong> {mail.estado}</p>
              </div>
              <button className="btn btn-warning text-white" onClick={() => handleContactClick(mail.userIdUsers)}>
                <i className="fa-solid fa-eye"></i>
              </button>
            </li>
          ))}
          <div className="text-height">
            <button className="btn btn-secondary text-white" onClick={handleBack}>
              Volver Atrás
            </button>
          </div>
        </ul>
      ) : (
        <div className="text-center mt-4">
          <i className="fas fa-inbox fa-3x text-muted"></i>
          <p className="alert alert-danger">No se encontraron correos enviados. O eliminaron la publicación.</p>
        </div>
      )}
    </div>
  );
};

export default VerReclutadorEmail;