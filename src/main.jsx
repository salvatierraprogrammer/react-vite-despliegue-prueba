import React from 'react';
import ReactDOM from 'react-dom/client'; // Nota el cambio en la importación
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap

// Crea un root para React y lo vincula al elemento con id 'root' en el HTML
const root = ReactDOM.createRoot(document.getElementById('root')); // Usa createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);