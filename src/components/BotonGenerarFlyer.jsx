import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const BotonGenerarFlyer = ({pub}) => {
   const navigate = useNavigate();
    
      return (
        <Link className="btn btn-secondary text-white me-2" to={pub}>
          <i className="fab fa-whatsapp me-2"></i> GenerarFlyer
        </Link>
      );
    };
export default BotonGenerarFlyer