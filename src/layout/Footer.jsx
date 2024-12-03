import React from 'react';
import '../components/css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Contacto</h5>
            <p>Email: elcanaldeat@gmail.com</p>
            <p>Tel: +11 3275 2125</p>
          </div>
          <div className="col-md-4 text-center">
            <h5>Redes sociales</h5>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
          <div className="col-md-4 text-end">
            <h5>Servicio Completo</h5>
            <p>Explora nuestros servicios y descubre cómo podemos ayudarte.</p>
          </div>
        </div>
        <div className="text-center mt-3">
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;