import React from 'react';
import './css/Cargando.css'; // Importa el archivo CSS

const Cargando = () => {
  return (
    <div className="cargando-container">
      <div className="spinner"></div>
      <p className="cargando-text text-white">Cargando...</p>
    </div>
  );
};

export default Cargando;