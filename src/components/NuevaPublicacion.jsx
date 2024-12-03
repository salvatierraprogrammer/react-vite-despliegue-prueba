import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import Cargando from './Cargando';
import GoBack from './GoBack';

const NuevaPublicacion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    paciente: '',
    edad: '',
    sexo: '',
    localidad: '',
    zona: '',
    diagnostico: '',
    generoAt: '',
    descripcion: '',
    telefono: '',
    email: '',
    fechaCreacion: new Date()
  });
  const [userData, setUserData] = useState({
    photo: '',
    nombreEntidad: '',
    emailLaboral: '',
    whatsapp: '',
  });
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);

  const nuevaPublicacionCollection = collection(db, "publicaciones");

  useEffect(() => {
    const fetchUserRoleAndData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRol(userData.userRol);
          setUserData({
            photo: userData.photo || 'https://revistapublicando.org/revista/public/site/images/jaroch/20943528.jpg',
            nombreEntidad: userData.nombreEntidad || 'Nombre de la Entidad',
            emailLaboral: userData.emailLaboral || '',
            whatsapp: userData.whatsapp || '',
          });

          setFormData((prevData) => ({
            ...prevData,
            telefono: userData.whatsapp || '',
            email: userData.emailLaboral || '',
          }));

          if (
            userData.userRol === 'reclutador' && 
            (!userData.nombreEntidad || !userData.emailLaboral || !userData.whatsapp)
          ) {
            navigate('/miCuenta');
          }
        }
      }
      setLoading(false);
    };

    fetchUserRoleAndData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && userRol === 'reclutador') {
      const newPublication = {
        ...formData,
        userId: user.uid,
        cliente: userData.nombreEntidad,
        photo: userData.photo,
        estado: 'Disponible',
      };
      await addDoc(nuevaPublicacionCollection, newPublication);
      navigate('/misPublicaciones');
    } else {
      alert('No tienes permiso para publicar.');
      navigate('/');
    }
  };

  const isFormValid = () => {
    // Verifica que todos los campos requeridos estén completos
    return Object.values(formData).every(value => value !== '') &&
           userRol === 'reclutador';
  };

  if (loading) {
    return <Cargando />;
  }

  return (
    <div className="container">
      <h1 className="mt-1 text-center mb-3 text-white">
        <i className="fas fa-upload me-2"></i> Nueva publicación
      </h1>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4 d-flex justify-content-center align-items-center">
                  <img
                    src={userData.photo}
                    alt="Foto del usuario"
                    className="img-fluid rounded-circle"
                    style={{ maxWidth: '150px' }}
                  />
                </div>
                <div className="col-md-8">
                  <h5 className='text-white'>{userData.nombreEntidad}</h5>
                  {userRol === 'administrador' && (
                    <div className="mb-3">
                      <label htmlFor="photo" className="form-label text-white">URL de la Imagen</label>
                      <input
                        type="text"
                        id="photo"
                        name="photo"
                        value={userData.photo}
                        onChange={handleUserDataChange}
                        className="form-control"
                      />
                      <label htmlFor="nombreEntidad" className="form-label text-white">Nombre de la Entidad</label>
                      <input
                        type="text"
                        id="nombreEntidad"
                        name="nombreEntidad"
                        value={userData.nombreEntidad}
                        onChange={handleUserDataChange}
                        className="form-control"
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-12">
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    {/* Campos del formulario */}
                    <div className="mb-3">
                      <label htmlFor="paciente" className="form-label text-white">Nº</label>
                      <input
                        type="text"
                        id="paciente"
                        name="paciente"
                        value={formData.paciente}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edad" className="form-label text-white">Edad</label>
                      <input
                        type="text"
                        id="edad"
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="sexo" className="form-label text-white">Género</label>
                      <select
                        id="sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        className="form-control"
                        required
                      >
                        <option value="">Seleccionar Género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="No binario">No binario</option>
                        <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                      </select>
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
                      <label htmlFor="zona" className="form-label text-white">Zona</label>
                      <select
                        id="zona"
                        name="zona"
                        value={formData.zona}
                        onChange={handleChange}
                        className="form-control"
                        required
                      >
                        <option value="">Seleccionar Zona</option>
                        <option value="CABA">CABA</option>
                        <option value="Zona Sur">Zona Sur</option>
                        <option value="Zona Norte">Zona Norte</option>
                        <option value="Zona Oeste">Zona Oeste</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="diagnostico" className="form-label text-white">Diagnóstico</label>
                      <input
                        type="text"
                        id="diagnostico"
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="generoAt" className="form-label text-white">Acompañante Terapéutico Preferentemente</label>
                      <select
                        id="generoAt"
                        name="generoAt"
                        value={formData.generoAt}
                        onChange={handleChange}
                        className="form-control"
                        required
                      >
                        <option value="">Seleccionar Género</option>
                        <option value="Indistinto">Indistinto</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="descripcion" className="form-label text-white">Descripción</label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
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
                    <div className="button-group">
                      <GoBack />
                      <button 
                        type="submit" 
                        className="btn mt-2 mb-2" 
                        disabled={!isFormValid()} // Deshabilita el botón si el formulario no es válido
                      >
                        <i className="fas fa-upload me-2"></i> Publicar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaPublicacion;