import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import './css/VerCaso.css';
import Cargando from './Cargando';
import VerReclutadorEmail from './VerReclutadorEmail';

const VerCaso = () => {
  const { id } = useParams();
  const [publicacion, setPublicacion] = useState(null);
  const [mailEnviados, setMailEnviados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUserId(currentUser.uid);

          // Obtener el rol del usuario
          const userDocRef = doc(db, 'usuarios', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().userRol);
          } else {
            console.error("No se encontró el documento del usuario.");
            setUserRole(null);
          }

          const docRef = doc(db, 'publicaciones', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPublicacion(data);

            const mailQuery = query(
              collection(db, 'mailEnviadosPostulado'),
              where('userIdPublicacion', '==', id),
              where('userIdUsers', '==', currentUser.uid)
            );
            const mailQuerySnapshot = await getDocs(mailQuery);
            const mails = [];
            mailQuerySnapshot.forEach(doc => {
              mails.push({ id: doc.id, ...doc.data() });
            });
            setMailEnviados(mails);
          } else {
            setPublicacion(null);
          }
        } else {
          console.error("No se puede obtener el usuario autenticado.");
        }
      } catch (error) {
        console.error("Error al obtener la publicación:", error);
      }
      setLoading(false);
    };

    fetchPublicacion();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <Cargando />;
  }

  if (!publicacion) {
    return <div className="text-center">No se encontró la publicación.</div>;
  }

  return (
    <div className="container mt-6" style={{ backgroundColor: '#F3F3F3', marginTop: 100 }}>
      <h1 className="text-center mb-6" style={{ color: '#504683' }}>Detalles de la Publicación</h1>

      <div className="d-flex flex-column flex-md-row">
        <div className="card flex-fill mb-4 mb-md-0">
          <div className='card cardCAmbiarColor'>
            <div className="card-body">
              <div className="d-flex flex-column align-items-center text-center mb-3">
                <img
                  src={publicacion.photo}
                  className="rounded-circle patient-photo mb-3"
                  alt={`Foto de ${publicacion.cliente}`}
                  style={{ width: '150px', height: '150px' }}
                />
                <h5 className="card-title text-white">{publicacion.cliente}</h5>
              </div>
              <div className="text-start">
                <p className="card-text text-white"><i className="fas fa-birthday-cake me-2"></i><strong className='text-white'>Edad:</strong> {publicacion.edad}</p>
                <p className="card-text text-white"><i className="fas fa-venus-mars me-2"></i><strong className='text-white'>Sexo:</strong> {publicacion.sexo}</p>
                <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Localidad:</strong> {publicacion.localidad}</p>
                <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Zona:</strong> {publicacion.zona}</p>
                <p className="card-text text-white"><i className="fas fa-notes-medical me-2"></i><strong className='text-white'>Diagnóstico:</strong> {publicacion.diagnostico}</p>
                <p className="card-text text-white"><i className="fas fa-align-left me-2"></i><strong className='text-white'>Descripción:</strong> {publicacion.descripcion}</p>
                <p className="card-text text-white"><i className="fas fa-phone-alt me-2"></i><strong className='text-white'>Teléfono:</strong> {publicacion.telefono}</p>
                <p className="card-text text-white"><i className="fas fa-envelope me-2"></i><strong className='text-white'>Email:</strong> {publicacion.email}</p>
              </div>
            </div>
          </div>
        </div>

        {userRole === 'empleado' && (
          <div className="card ms-md-4 flex-fill">
            <div className="card-body">
              <h2 className="text-center mb-4 text-white">
                <div className="me-md-3">
                  <i className="fas fa-envelope fa-2x text-primary me-2 text-white"></i>
                </div>
                Correos Enviados
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
                    </li>
                  ))}
                  <div className="text-height">
                    <button className="btn btn-secondary" onClick={handleBack}>
                      Volver Atrás
                    </button>
                  </div>
                </ul>
              ) : (
                <div className="text-center mt-4">
                  <i className="fas fa-inbox fa-3x text-muted"></i>
                  <p className="alert alert-danger">No se encontraron correos enviados. O eliminaron la publicacion</p>
                </div>
              )}
            </div>
          </div>
        )}

        {userRole === 'reclutador' && (
          <VerReclutadorEmail />
        )}

      </div>
    </div>
  );
};

export default VerCaso;