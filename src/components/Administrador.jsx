import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfg/firebase'; // Adjust the import based on your Firebase setup

const Administrador = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redirect to login page or wherever you prefer
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-white">Administrador</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <h2 className='text-white'>Clientes</h2>
          <ul className="list-group">
            <li className="list-group-item text-white">
              <Link to="/usuarios-nuevos" className="btn btn-primary text-left w-100 text-white">
                <i className="fas fa-user-plus mr-2 text-white"></i> Usuarios registrados
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-md-6 mb-4">
          <h2 className='text-white'>Publicación</h2>
          <ul className="list-group">
            <li className="list-group-item">
              <Link to="/nuevaPublicacion" className="btn btn-primary text-left w-100">
                <i className="fas fa-plus mr-2"></i> Nueva Publicación
              </Link>
            </li>
            <li className="list-group-item">
              <Link to="/misPublicaciones" className="btn btn-primary text-left w-100">
                <i className="fas fa-file-alt mr-2"></i> Mis Publicaciones
              </Link>
            </li>
            <li className="list-group-item"> <button
        className="btn btn-warning mt-4"
        onClick={() => setShowModal(true)}
      >
        <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
      </button></li>
          </ul>
        </div>
      </div>
     

      {/* Modal for logout confirmation */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Cierre de Sesión</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas cerrar sesión?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLogout}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrador;