// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { getDocs, deleteDoc, collection, doc } from 'firebase/firestore';
// import { db } from '../firebaseConfg/firebase';
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';
// const MySwal = withReactContent(Swal);

// const Show = () => {
//     const [users, setUsers] = useState([]);

//     const usersCollection = collection(db, 'usuarios');

//     const getUsers = async () => {
//         const data = await getDocs(usersCollection);
//         setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
//     };

//     const deleteUser = async (id) => {
//         const userDoc = doc(db, 'usuarios', id);
//         await deleteDoc(userDoc);
//         getUsers();
//     };

//     const confirmDelete = (id) => {
//         Swal.fire({
//             title: "¿Eliminar el usuario?",
//             text: "¡No podrás revertir esto!",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Sí"
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 deleteUser(id);
//                 Swal.fire({
//                     title: "Eliminado!",
//                     text: "El usuario ha sido eliminado.",
//                     icon: "success"
//                 });
//             }
//         });
//     };

//     useEffect(() => {
//         getUsers();
//     }, []);

//     return (
//         <div className='container'>
//             <div className='row'>
//                 <div className='col'>
//                     <div className='d-grid gap-2'>
//                         <Link to='/create' className='btn btn-secondary mt-2 mb-2'>Crear</Link>
//                     </div>
//                     <div className='row'>
//                         {users.map((user) => (
//                             <div className='col-md-4' key={user.id}>
//                                 <div className='card mb-4'>
//                                     <img src={user.photoUrl} className='card-img-top' alt={`${user.nombre} ${user.apellido}`} />
//                                     <div className='card-body'>
//                                         <h5 className='card-title'>{user.nombre} {user.apellido}</h5>
//                                         <p className='card-text'>DNI: {user.dni}</p>
//                                         <p className='card-text'>Email: {user.email}</p>
//                                         <p className='card-text'>Teléfono: {user.phoneNumber}</p>
//                                         <p className='card-text'>Rol: {user.userRole}</p>
//                                         <Link to={`/edit/${user.id}`} className='btn btn-primary'>Editar</Link>
//                                         <button onClick={() => { confirmDelete(user.id) }} className='btn btn-danger ms-2'>Eliminar</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Show;



import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfg/firebase';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import Home from './Home';

const MySwal = withReactContent(Swal);

const Show = () => {
    const [products, setProducts] = useState([]);

    const productsCollection = collection(db, 'usuarios');

    const getProducts = async () =>  {
        const data = await getDocs(productsCollection);
        setProducts(
            data.docs.map((doc) => ({...doc.data(), id: doc.id}))
        );
        console.log(products);
    } 

    const deleteProduct = async (id) => {
        const productDoc = doc(db, 'usuarios', id);
        await deleteDoc(productDoc);
        getProducts();
    }

    const confirmDelete = (id) => {
        Swal.fire({
            title: "Eliminar el producto?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteProduct(id);
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
            }
        });
    }

    useEffect(() => {
        getProducts();
    }, [])

  return (
    <>
    <div sx={{backgroundColor: '#F3F3F3'}}>
    
    <Home/>
    </div>
        {/* <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='d-grid gap-2'>
                        <Link to='/create' className='btn btn-secondary mt-2 mb-2'>Create</Link>
                    </div>
                    <table className='table table-dark table-hover'>
                        <thead>
                            <tr>
                                <th>Descripcion</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.nombre}</td>
                                    <td>{product.apellido}</td>
                                    <td>
                                        <Link to={`/edit/${product.id}`} className='btn btn-light'>
                                            <i className="fa-regular fa-pen-to-square"></i>
                                        </Link>
                                        <button onClick={() => {confirmDelete(product.id)}} className='btn btn-danger'>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div> */}
    </>
  );
}

export default Show;