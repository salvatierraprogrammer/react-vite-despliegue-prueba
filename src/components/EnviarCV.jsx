import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db, auth, store } from '../firebaseConfg/firebase'; // Asegúrate de importar el storage

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Importar funciones necesarias para Storage

const EnviarCV = ({ show, handleClose, publicacionId, onSuccess }) => {
  console.log("Publicacion", publicacionId)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cv, setCv] = useState(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [numeroPaciente, setNumeroPaciente] = useState('');
  const [userIdReclutador, setUserIdReclutador] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicacionData = async () => {
      try {
        const publicacionDoc = await getDoc(doc(db, 'publicaciones', publicacionId));
        if (publicacionDoc.exists()) {
          const publicacionData = publicacionDoc.data();
          setNombreCliente(publicacionData.cliente || 'Sin cliente');
          setNumeroPaciente(publicacionData.paciente || 'Sin paciente');
          setUserIdReclutador(publicacionData.userId || 'Sin reclutador');
        } else {
          setError('Publicación no encontrada.');
        }
      } catch (error) {
        setError('Error al obtener los datos de la publicación.');
        console.error("Error fetching publicacion data: ", error);
      }
    };

    if (publicacionId) {
      fetchPublicacionData();
    }
  }, [publicacionId]);

  const handleChange = (e) => {
    if (e.target.name === 'cv') {
      setCv(e.target.files[0]);
    } else {
      const { name, value } = e.target;
      switch (name) {
        case 'nombre':
          setNombre(value);
          break;
        case 'apellido':
          setApellido(value);
          break;
        case 'email':
          setEmail(value);
          break;
        case 'descripcion':
          setDescripcion(value);
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado.');
  
      if (!nombreCliente) throw new Error('El nombre del cliente es obligatorio.');
      if (!nombre || !apellido || !email || !descripcion || !cv) {
        throw new Error('Todos los campos son obligatorios.');
      }
  
      const userId = user.uid;
      const mailEnviadosCollection = collection(db, 'mailEnviadosPostulado');
  
      let cvUrl = null;
      if (cv) {
        const storageRef = ref(store, `cvs/${Date.now()}_${cv.name}`);
        const uploadTask = uploadBytesResumable(storageRef, cv);
  
        cvUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error('Error al subir el archivo:', error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }
  
      const mailData = {
        userIdUsers: userId,
        userIdPublicacion: publicacionId,
        userIdReclutador: userIdReclutador || 'Desconocido',
        NombreCliente: nombreCliente || 'Sin cliente',
        numeroPaciente: numeroPaciente || 'Sin paciente',
        nombre,
        apellido,
        email,
        descripcion,
        cvUrl,
        estado: 'Enviado',
        fechaEnvio: new Date(),
      };
  
      await addDoc(mailEnviadosCollection, mailData);
  
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error general:', err.message || err);
      setError('Error al enviar el CV: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal show={show} onHide={handleClose} style={{ marginTop: 100 }}>
      <Modal.Header closeButton>
        <Modal.Title>Enviar CV</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={apellido}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={descripcion}
              onChange={handleChange}
              rows={3}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Adjuntar CV (PDF/Word)</Form.Label>
            <Form.Control
              type="file"
              name="cv"
              onChange={handleChange}
              accept=".pdf,.docx"
              required
            />
          </Form.Group>
          {error && <p className="text-danger">{error}</p>}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar CV'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EnviarCV;