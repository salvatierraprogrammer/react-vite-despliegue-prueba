import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import { Button, Form } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';  // Asegúrate de que Firebase Authentication esté configurado

const MiPerfilReclutador = () => {
  const [profileData, setProfileData] = useState({
    emailLaboral: '',
    nombreEntidad: '',
    photo: '',
    whatsapp: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    emailLaboral: '',
    nombreEntidad: '',
    photo: '',
    whatsapp: '',
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Obtener el usuario autenticado
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
      console.warn('Usuario no autenticado.');
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const profileRef = doc(db, 'usuarios', userId);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfileData({
            emailLaboral: data.emailLaboral || '',
            nombreEntidad: data.nombreEntidad || '',
            photo: data.photo || '',
            whatsapp: data.whatsapp || '',
          });
          setUpdatedData({
            emailLaboral: data.emailLaboral || '',
            nombreEntidad: data.nombreEntidad || '',
            photo: data.photo || '',
            whatsapp: data.whatsapp || '',
          });
        } else {
          const defaultData = {
            emailLaboral: '',
            nombreEntidad: '',
            photo: '',
            whatsapp: '',
          };
          await setDoc(profileRef, defaultData);
          setProfileData(defaultData);
          setUpdatedData(defaultData);
          console.warn('Profile created with default values for the given user ID.');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleUpdateProfile = async () => {
    try {
      if (!userId) return;

      const profileRef = doc(db, 'usuarios', userId);
      await updateDoc(profileRef, updatedData);
      alert('Perfil actualizado exitosamente.');
      setProfileData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    }
  };

  return (
    <div>
      {/* <h5 className='text-white'>Perfil del Reclutador</h5> */}
      <Form>
        <Form.Group controlId="formEmailLaboral">
          <Form.Label><p className='text-white'>Email Laboral</p></Form.Label>
          <Form.Control
            type="email"
            value={isEditing ? updatedData.emailLaboral : profileData.emailLaboral}
            onChange={(e) => setUpdatedData({ ...updatedData, emailLaboral: e.target.value })}
            readOnly={!isEditing}
          />
        </Form.Group>
        <Form.Group controlId="formNombreEntidad">
          <Form.Label><p className='text-white'>Nombre de la Entidad</p></Form.Label>
          <Form.Control
            type="text"
            value={isEditing ? updatedData.nombreEntidad : profileData.nombreEntidad}
            onChange={(e) => setUpdatedData({ ...updatedData, nombreEntidad: e.target.value })}
            readOnly={!isEditing}
          />
        </Form.Group>
        <Form.Group controlId="formPhoto">
          <Form.Label><p className='text-white'>Foto</p></Form.Label>
          <Form.Control
            type="text"
            value={isEditing ? updatedData.photo : profileData.photo}
            onChange={(e) => setUpdatedData({ ...updatedData, photo: e.target.value })}
            readOnly={!isEditing}
          />
        </Form.Group>
        <Form.Group controlId="formWhatsapp">
          <Form.Label><p className='text-white'>Whatsapp</p></Form.Label>
          <Form.Control
            type="text"
            value={isEditing ? updatedData.whatsapp : profileData.whatsapp}
            onChange={(e) => setUpdatedData({ ...updatedData, whatsapp: e.target.value })}
            readOnly={!isEditing}
          />
        </Form.Group>
        
        <div className="mt-3">
          {isEditing ? (
            <>
              <Button variant="primary" onClick={handleUpdateProfile}>Actualizar</Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)} className="ms-2">Cancelar</Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>Editar</Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default MiPerfilReclutador;