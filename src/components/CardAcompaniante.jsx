import React from 'react';
import { Card } from 'react-bootstrap';

const CardAcompaniante = ({
  nombreCompleto,
  email,
  experiencia,
  formacion,
  images,
  localidad,
  preferenciaLaboral,
  sobreMi,
  telefono,
  titulo,
  userId,
  zona
}) => {
  const defaultImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2WjS_hXJ9gKTPO0DP2wQa9ho1mxaq2aynxQ&s";

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="card-header">
          <Card.Img
            src={images || defaultImage}
            alt="Perfil"
            className="profile-img"
          />
          <Card.Title>{nombreCompleto}</Card.Title>
        </div>
        <Card.Text>
          <i className="fas fa-envelope me-2"></i>
          <strong>Email:</strong> {email}<br />
          <i className="fas fa-briefcase me-2"></i>
          <strong>Experiencia:</strong> {experiencia}<br />
          <i className="fas fa-graduation-cap me-2"></i>
          <strong>Formación:</strong> {formacion}<br />
          <i className="fas fa-map-marker-alt me-2"></i>
          <strong>Localidad:</strong> {localidad}<br />
          <i className="fas fa-briefcase me-2"></i>
          <strong>Preferencia Laboral:</strong> {preferenciaLaboral}<br />
          <i className="fas fa-user me-2"></i>
          <strong>Sobre Mí:</strong> {sobreMi}<br />
          <i className="fas fa-phone me-2"></i>
          <strong>Teléfono:</strong> {telefono}<br />
          <i className="fas fa-user-tie me-2"></i>
          <strong>Título:</strong> {titulo}<br />
          <i className="fas fa-key me-2"></i>
          <strong>UserID:</strong> {userId}<br />
          <i className="fas fa-map-marker-alt me-2"></i>
          <strong>Zona:</strong> {zona}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CardAcompaniante;