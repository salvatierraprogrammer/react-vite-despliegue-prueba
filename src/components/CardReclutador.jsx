import React from 'react';
import { Card } from 'react-bootstrap';
import './css/CardReclutador.css'; // Asegúrate de que este archivo contiene los estilos necesarios

const CardReclutador = ({ nombreEntidad, emailLaboral, phoneNumber, photo, userId, whatsapp }) => {
  const defaultImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2WjS_hXJ9gKTPO0DP2wQa9ho1mxaq2aynxQ&s";

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="card-header">
          <Card.Img
            src={photo || defaultImage}
            alt="Perfil"
            className="profile-img"
          />
          {/* <Card.Title>{nombreEntidad}</Card.Title> */}
        </div>
        <Card.Text>
          <i className="fas fa-building me-2"></i>
          <strong>Nombre de Entidad:</strong> {nombreEntidad}<br />
          <i className="fas fa-envelope me-2"></i>
          <strong>Email Laboral:</strong> {emailLaboral}<br />
          <i className="fas fa-phone me-2"></i>
          <strong>Teléfono:</strong> {phoneNumber}<br />
          <i className="fa-brands fa-square-whatsapp me-2"></i>
          <strong>WhatsApp:</strong> {whatsapp}<br />
       
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CardReclutador;