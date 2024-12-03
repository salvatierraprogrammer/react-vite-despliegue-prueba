import React from 'react';
import './css/OpcionesReclutador.css'; // Import custom CSS for styling
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfg/firebase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const OpcionesReclutador = () => {
  const navigate = useNavigate();

  const handleSignOutConfirmation = () => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        handleSignOut();
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="container mt-1">
      <div className="d-flex justify-content-around">
        <div className="d-flex flex-column align-items-center mb-3">
          <Link to={'/miCuenta'} className="btn-opciones btn-circle">
            <i className="fa-solid fa-user-cog"></i>
          </Link>
          <span className="btn-text text-white">Mi Cuenta</span>
        </div>
        <div className="d-flex flex-column align-items-center mb-3">
          <Link to={'/cv-recibido'} className="btn-opciones btn-circle">
            <i className="fa-solid fa-file-alt"></i>
          </Link>
          <span className="btn-text text-white">CV Recibidos</span>
        </div>
        <div className="d-flex flex-column align-items-center mb-3">
          <Link to={'/misPublicaciones'} className="btn-opciones btn-circle">
            <i className="fa-solid fa-bullhorn"></i>
          </Link>
          <span className="btn-text text-white">Mis Publicaciones</span>
        </div>
        <div className="d-flex flex-column align-items-center mb-3">
          <button className="btn-circle btn-danger" onClick={handleSignOutConfirmation}>
            <i className="fa-solid fa-sign-out-alt"></i>
          </button>
          <span className="btn-text text-white">Cerrar Sesión</span>
        </div>
      </div>
    </div>
  );
};

export default OpcionesReclutador;