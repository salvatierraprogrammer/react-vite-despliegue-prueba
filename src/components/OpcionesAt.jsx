import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfg/firebase';

const MySwal = withReactContent(Swal);

const OpcionesAt = () => {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const fetchProfileImage = async () => {
            const userId = auth.currentUser.uid; // Obtén el UID del usuario actual
            const docRef = doc(db, 'perfilLaboral', userId); // Usa 'db' en lugar de 'firestore'
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profileData = docSnap.data();
                setProfileImage(profileData.images);
            }
        };

        fetchProfileImage();
    }, []);

    const handleSignOutConfirmation = () => {
        MySwal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas cerrar sesión?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                handleSignOut();
            }
        });
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row row-cols-2 row-cols-md-4 justify-content-center">
            <div className="col d-flex flex-column align-items-center mb-3">
                    <Link to={'/miCuenta'} className="btn-opciones btn-circle">
                        <i className="fa-solid fa-user-cog"></i>
                    </Link>
                    <span className="btn-text text-white">Mi Cuenta</span>
                </div>
                <div className="col d-flex flex-column align-items-center mb-3">
                    <Link to={'/cvEnvidos'} className="btn-opciones btn-circle">
                        <i className="fa-solid fa-file-alt"></i>
                    </Link>
                    <span className="btn-text text-white">CV Enviados</span>
                </div>
                <div className="col d-flex flex-column align-items-center mb-3">
                    <Link to={'/perfilLaboralUpdate'} className="btn-opciones btn-circle">
                        {profileImage ? (
                            <img src={profileImage} alt="Perfil" className="profile-image" />
                        ) : (
                            <i className="fa-solid fa-user"></i>
                        )}
                    </Link>
                    <span className="btn-text text-white">Mi Perfil Laboral</span>
                </div>
                <div className="col d-flex flex-column align-items-center mb-3">
                    <button className="btn-circle btn-danger" onClick={handleSignOutConfirmation}>
                        <i className="fa-solid fa-sign-out-alt"></i>
                    </button>
                    <span className="btn-text text-white">Cerrar Sesión</span>
                </div>
            </div>
        </div>
    );
};

export default OpcionesAt;