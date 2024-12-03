import React, { useEffect, useState, useMemo } from 'react';
import './css/BuscarTrabajo.css';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EnviarCV from './EnviarCV';
import { Button, Form } from 'react-bootstrap';
import Cargando from './Cargando';


const BuscarTrabajo = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPublicacion, setSelectedPublicacion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cvEnviado, setCvEnviado] = useState({});
  const [selectedZone, setSelectedZone] = useState('Todos');
  const [hasPerfilLaboral, setHasPerfilLaboral] = useState(true);
  const [error, setError] = useState(null); // Nuevo estado para manejo de errores
  
  const publicacionesCollection = collection(db, 'publicaciones');
  const usersCollection = collection(db, 'usuarios');
  const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');
  const perfilLaboralCollection = collection(db, 'perfilLaboral');

  const getPublicaciones = async () => {
    try {
      const data = await getDocs(publicacionesCollection);
      setPublicaciones(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      setError('Error al cargar las publicaciones');
    }
  };

  const getUsers = async () => {
    try {
      const data = await getDocs(usersCollection);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      setError('Error al cargar los usuarios');
    }
  };

  const fetchUserRol = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        setUserRol(userDoc.data().userRol);
      } else {
        setUserRol(null);
      }
    } catch (error) {
      setError('Error al cargar el rol del usuario');
    }
  };

  const checkPerfilLaboral = async (userId) => {
    try {
      const perfilDoc = await getDoc(doc(db, 'perfilLaboral', userId));
      setHasPerfilLaboral(perfilDoc.exists());
    } catch (error) {
      setError('Error al verificar el perfil laboral');
    }
  };

  useEffect(() => {
    const checkCvEnviado = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userId = user.uid;
          const querySnapshot = await getDocs(mailEnviadosCollection);
          const enviado = {};
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userIdUsers === userId) {
              enviado[data.userIdPublicacion] = true;
            }
          });
          setCvEnviado(enviado);
        } catch (error) {
          setError('Error al verificar los CV enviados');
        }
      }
    };

    checkCvEnviado();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userId = user.uid;
          await fetchUserRol(userId);
          await getPublicaciones();
          await getUsers();
          await checkPerfilLaboral(userId);
        } catch (error) {
          setError('Error al cargar los datos');
        } finally {
          setLoading(false);
        }
      } else {
        try {
          setUserRol(null);
          await getPublicaciones();  // Fetch publicaciones even if user is not logged in
        } catch (error) {
          setError('Error al cargar las publicaciones');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleShowModal = (publicacionId) => {
    if (userRol === 'empleado' && hasPerfilLaboral) {
      setSelectedPublicacion(publicacionId);
      setShowModal(true);
    } else if (userRol === 'empleado' && !hasPerfilLaboral) {
      // Redirigir al usuario a la página de creación de perfil laboral
      window.location.href = 'https://salvatierraprogrammer.github.io/acompaniante-terapeutico/crear-perfil-laboral';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPublicacion(null);
  };

  const handleCvEnviado = (publicacionId) => {
    setCvEnviado((prev) => ({ ...prev, [publicacionId]: true }));
  };

  const publicacionesDisponibles = useMemo(() => {
    return publicaciones.filter(pub => 
      (selectedZone === 'Todos' || pub.zona === selectedZone) &&
      pub.estado === 'Disponible'
    );
  }, [publicaciones, selectedZone]);

  if (loading) {
    return <Cargando/>;
  }

  if (error) {
    return <p className="alert alert-danger text-center">{error}</p>;
  }

  return (
    <div className="container" style={{ marginTop: '120px', backgroundColor: '#F3F3F3',  color: '#504683' }}>
      {userRol === 'empleado' && (
        <>
          <h1 className="mt-4 text-center" sx={{color: '#504683'}}>
            <i className="fa-solid fa-search"></i> Buscar Trabajo
          </h1>
          <div className="row mb-4">
            <div className="col-md-4 offset-md-4">
              <Form.Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                aria-label="Seleccionar zona"
              >
                <option value="Todos">Todos</option>
                <option value="Zona Sur">Zona Sur</option>
                <option value="CABA">CABA</option>
                <option value="Zona Norte">Zona Norte</option>
                <option value="Zona Oeste">Zona Oeste</option>
              </Form.Select>
            </div>
          </div>
          <div className="text-center mb-4">
            {selectedPublicacion && (
              <EnviarCV
                show={showModal}
                handleClose={handleCloseModal}
                publicacionId={selectedPublicacion}
                correoPublicacion={publicaciones.find(pub => pub.id === selectedPublicacion)?.email}
                onSuccess={() => {
                  handleCvEnviado(selectedPublicacion);
                }}
              />
            )}
          </div>
        </>
      )}
      <br />
      <div className="row justify-content-center">
        {publicacionesDisponibles.length > 0 ? (
          publicacionesDisponibles.map(p => (
            <div className="col-md-6 col-lg-4" key={p.id}>
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-column align-items-center text-center mb-3">
                    <img
                      src={p.photo}
                      className="rounded-circle patient-photo mb-3"
                      alt={`Foto de ${p.cliente}`}
                      aria-label={`Foto de ${p.cliente}`}
                    />
                    <h5 className="card-title text-white">{p.cliente}</h5>
                  </div>
                  <div className="text-start">
                    <p className="card-text text-white"><i className="fas fa-birthday-cake me-2"></i><strong className='text-white'>Edad:</strong> {p.edad}</p>
                    <p className="card-text text-white"><i className="fas fa-venus-mars me-2"></i><strong className='text-white'>Sexo:</strong> {p.sexo}</p>
                    <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Localidad:</strong> {p.localidad}</p>
                    <p className="card-text text-white"><i className="fas fa-map-marker-alt me-2"></i><strong className='text-white'>Zona:</strong> {p.zona}</p>
                    <p className="card-text text-white"><i className="fas fa-notes-medical me-2"></i><strong className='text-white'>Diagnóstico:</strong> {p.diagnostico}</p>
                    <p className="card-text text-white"><i className="fas fa-align-left me-2"></i><strong className='text-white'>Descripción:</strong> {p.descripcion}</p>
                    <p className="card-text text-white"><i className="fas fa-phone-alt me-2"></i><strong className='text-white'>Teléfono:</strong> {p.telefono}</p>
                    <p className="card-text text-white"><i className="fas fa-envelope me-2"></i><strong className='text-white'>Email:</strong> {p.email}</p>
                    <Button
                      variant="success"
                      className="mt-3"
                      onClick={() => handleShowModal(p.id)}
                      disabled={cvEnviado[p.id]}
                    >
                      {cvEnviado[p.id] ? 'CV enviado' : 'Enviar CV'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p className="text-white">No hay publicaciones disponibles en la zona seleccionada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuscarTrabajo;