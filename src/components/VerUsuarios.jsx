import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import { Button, Card, Alert } from 'react-bootstrap';
import CardReclutador from './CardReclutador';
import CardAcompaniante from './CardAcompaniante';
import Cargando from './Cargando';

const VerUsuarios = () => {
  const { id } = useParams(); // Obtener el ID del usuario desde la URL
  const [usuario, setUsuario] = useState(null);
  const [perfilLaboral, setPerfilLaboral] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const userDoc = doc(db, 'usuarios', id);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
          const usuarioData = docSnap.data();
          setUsuario(usuarioData);

          if (usuarioData.userRol === 'empleado') {
            const perfilLaboralDoc = doc(db, 'perfilLaboral', usuarioData.userId);
            const perfilLaboralSnap = await getDoc(perfilLaboralDoc);

            if (perfilLaboralSnap.exists()) {
              setPerfilLaboral(perfilLaboralSnap.data());
            }
          }
        } else {
          setError('El usuario no existe.');
        }
      } catch (error) {
        setError('Error al cargar los datos del usuario.');
        console.error('Error fetching user:', error);
      }
    };

    fetchUsuario();
  }, [id]);

  const handleBack = () => {
    navigate('/usuarios-nuevos'); // Redirigir a la página de usuarios
  };

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBack}>
          <i className="fas fa-arrow-left me-2"></i>
          Volver
        </Button>
      </div>
    );
  }

  if (!usuario) {
    return <Cargando />;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-white">Detalles del Usuario</h1>
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Body>
              <Card.Title className='text-white'>
                <i className="fas fa-user me-2"></i>
                {usuario.nombre} {usuario.apellido}
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted text-white">
                <i className="fas fa-id-card me-2"></i>
                DNI: {usuario.dni}
              </Card.Subtitle>
              <Card.Text>
                <i className="fas fa-envelope me-2"></i>
                <strong className='text-white'>Email:</strong> {usuario.email}<br />
                <i className="fas fa-clipboard-list me-2"></i>
                <strong className='text-white'>Estado:</strong> {usuario.estado}<br />
                <i className="fas fa-phone me-2"></i>
                <strong className='text-white'>Teléfono:</strong> {usuario.phoneNumber}<br />
                <i className="fas fa-user-tag me-2"></i>
                <strong className='text-white'>Rol:</strong> {usuario.userRol}<br />
                <i className="fas fa-key me-2"></i>
                <strong className='text-white'>UserID:</strong> {usuario.userId}
              </Card.Text>
              <Button variant="secondary" onClick={handleBack}>
                <i className="fas fa-arrow-left me-2"></i>
                Volver
              </Button>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6 mt-4 mt-md-0">
          {usuario.userRol === 'reclutador' && (
            <CardReclutador 
              nombre={usuario.nombre}
              apellido={usuario.apellido}
              email={usuario.email}
              emailLaboral={usuario.emailLaboral}
              nombreEntidad={usuario.nombreEntidad}
              phoneNumber={usuario.phoneNumber}
              photo={usuario.photo}
              userId={usuario.userId}
              whatsapp={usuario.whatsapp}
            />
          )}

          {usuario.userRol === 'empleado' && perfilLaboral && (
            <CardAcompaniante 
              nombreCompleto={perfilLaboral.nombreCompleto}
              email={perfilLaboral.email}
              experiencia={perfilLaboral.experiencia}
              formacion={perfilLaboral.formacion}
              images={perfilLaboral.images}
              localidad={perfilLaboral.localidad}
              preferenciaLaboral={perfilLaboral.preferenciaLaboral}
              sobreMi={perfilLaboral.sobreMi}
              telefono={perfilLaboral.telefono}
              titulo={perfilLaboral.titulo}
              userId={perfilLaboral.userId}
              zona={perfilLaboral.zona}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerUsuarios;