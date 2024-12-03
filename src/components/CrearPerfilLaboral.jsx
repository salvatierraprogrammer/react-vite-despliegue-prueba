import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { useNavigate } from 'react-router-dom';

const CrearPerfilLaboral = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    email: '',
    experiencia: '',
    formacion: '',
    sobreMi: '',
    localidad: '',
    preferenciaLaboral: '',
    zona: '',
    images: '',
    estado: 'Disponible' // Valor predeterminado
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        // Include userId in the formData
        const updatedFormData = { ...formData, userId: user.uid };
        await setDoc(doc(db, 'perfilLaboral', user.uid), updatedFormData);
        alert('Perfil creado con éxito.');
        navigate('/perfilLaboralUpdate');
      } else {
        setError('Usuario no autenticado.');
      }
    } catch (err) {
      setError('Error al crear el perfil.');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 text-white">Crear Perfil Laboral</h1>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombreCompleto" className="form-label text-white">Nombre Completo</label>
                  <input
                    type="text"
                    id="nombreCompleto"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="telefono" className="form-label text-white">Teléfono</label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-white">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="experiencia" className="form-label text-white">Experiencia</label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="formacion" className="form-label text-white">Formación</label>
                  <input
                    type="text"
                    id="formacion"
                    name="formacion"
                    value={formData.formacion}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="sobreMi" className="form-label text-white">Sobre Mí</label>
                  <textarea
                    id="sobreMi"
                    name="sobreMi"
                    value={formData.sobreMi}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="localidad" className="form-label text-white">Localidad</label>
                  <input
                    type="text"
                    id="localidad"
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="preferenciaLaboral" className="form-label text-white">Preferencia Laboral</label>
                  <input
                    type="text"
                    id="preferenciaLaboral"
                    name="preferenciaLaboral"
                    value={formData.preferenciaLaboral}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="zona" className="form-label text-white">Zona</label>
                  <input
                    type="text"
                    id="zona"
                    name="zona"
                    value={formData.zona}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="images" className="form-label text-white">Imagen</label>
                  <input
                    type="url"
                    id="images"
                    name="images"
                    value={formData.images}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="estado" className="form-label text-white">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Consultar">Consultar</option>
                    <option value="No Disponible">No Disponible</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary text-white">Crear Perfil</button>
              </form>
              {error && <p className="text-danger mt-3">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearPerfilLaboral;