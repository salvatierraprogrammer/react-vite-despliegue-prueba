import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Verifica la ruta y existencia de App.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Asegúrate de que Bootstrap esté instalado

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);