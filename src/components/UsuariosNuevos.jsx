import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Cargando from './Cargando';
import './css/UsuariosNuevos.css';

const MySwal = withReactContent(Swal);

const UsuariosNuevos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [userRol, setUserRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('todos');
  const navigate = useNavigate();

  const usuariosCollection = collection(db, 'usuarios');

  const getUsuarios = async () => {
    const data = await getDocs(usuariosCollection);
    setUsuarios(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const getUserRole = async (userId) => {
    const userDoc = await getDoc(doc(usuariosCollection, userId));
    if (userDoc.exists()) {
      setUserRol(userDoc.data().userRol);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        await getUserRole(userId);
        await getUsuarios();
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleShowRoleModal = (usuario) => {
    setSelectedUser(usuario);
    setNewRole(usuario.userRol);
    setShowRoleModal(true);
  };

  const handleShowStatusModal = (usuario) => {
    setSelectedUser(usuario);
    setNewStatus(usuario.estado);
    setShowStatusModal(true);
  };

  const handleChangeRole = async () => {
    if (selectedUser) {
      const userDoc = doc(db, 'usuarios', selectedUser.id);
      await updateDoc(userDoc, { userRol: newRole });
      setShowRoleModal(false);
      getUsuarios();
    }
  };

  const handleChangeStatus = async () => {
    if (selectedUser) {
      const userDoc = doc(db, 'usuarios', selectedUser.id);
      await updateDoc(userDoc, { estado: newStatus });
      setShowStatusModal(false);
      getUsuarios();
    }
  };

  const handleSignOutConfirmation = (id) => {
    MySwal.fire({
      title: '¿Estás seguro de eliminar?',
      text: '¿Deseas eliminar el usuario permanentemente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id);
      }
    });
  };

  const handleDelete = async (id) => {
    const userDoc = doc(db, 'usuarios', id);
    await deleteDoc(userDoc);
    getUsuarios();
  };

  const handleView = (id) => {
    navigate(`/ver-usuario/${id}`);
  };

  const handleInicio = () => {
    navigate('/admin');
  };

  if (loading) {
    return <Cargando/>;
  }

  if (userRol !== 'administrador') {
    return <div>No tienes permiso para acceder a esta página.</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-white">Usuarios registrados</h1>
      <Link to="/admin" className="btn">
                <i className="fas fa-user-plus mr-2 text-white"></i> Inicio
       </Link>
    
      <Form.Group className="mb-1 text-white">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
     
        <Form.Label>Filtrar por Rol:
        <Form.Select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="empleado">Empleado</option>
          <option value="reclutador">Reclutador</option>
          <option value="administrador">Administrador</option>
        </Form.Select>
        </Form.Label>
   
        <Form.Label>Filtrar por Estado:
        <Form.Select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="premium">Premium</option>
        </Form.Select>
        </Form.Label>
      </Form.Group>
      <Table className='table-custom' striped bordered hover>
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios
            .filter((usuario) =>
              selectedRoleFilter === 'todos' || usuario.userRol === selectedRoleFilter
            )
            .filter((usuario) =>
              selectedStatusFilter === 'todos' || usuario.estado === selectedStatusFilter
            )
            .filter((usuario) =>
              `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nombre} {usuario.apellido}</td>
                <td>{usuario.email}</td>
                <td>
                  <Button variant="warning" className="me-2" onClick={() => handleShowRoleModal(usuario)}>
                    {usuario.userRol}
                  </Button>
                </td>
                <td>
                  <Button variant="info" className="me-2" onClick={() => handleShowStatusModal(usuario)}>
                    {usuario.estado}
                  </Button>
                </td>
                <td>
                  <Button variant="info" className="me-2" onClick={() => handleView(usuario.id)}>
                    <i className="fas fa-eye"></i> Ver
                  </Button>
                  <Button variant="warning" onClick={() => handleSignOutConfirmation(usuario.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Rol del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="empleado">Empleado</option>
            <option value="reclutador">Reclutador</option>
            <option value="administrador">Administrador</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangeRole}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="premium">Premium</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleChangeStatus}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsuariosNuevos;