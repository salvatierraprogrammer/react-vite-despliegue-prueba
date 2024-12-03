import React from 'react';
import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="home-title">Bienvenido a Nuestra Plataforma de Acompañantes Terapéuticos</h1>
                <p className="home-subtitle">
                    La solución perfecta para quienes buscan apoyo terapéutico o profesionales en busca de nuevas oportunidades.
                </p>
            </header>
            <main className="home-content">
                <section className="home-section">
                    <h2>Busco Acompañante Terapéutico</h2>
                    <p>
                        Encuentra y conecta con acompañantes terapéuticos calificados. Explora perfiles, revisa 
                        calificaciones y selecciona al profesional que mejor se adapte a tus necesidades.
                    </p>
                    <Link className="btn text-white" to="/buscar-acompanante">Buscar Acompañante</Link>
                </section>
                <section className="home-section">
                    <h2>Busco Trabajo como Acompañante Terapéutico</h2>
                    <p>
                        Crea y actualiza tu perfil profesional, muestra tu experiencia y habilidades, y encuentra 
                        oportunidades laborales en el campo de la terapia.
                    </p>
                    <Link className="btn text-white" to="/buscar-trabajo">Buscar Trabajo</Link>
                </section>
            </main>
        </div>
    );
};

export default Home;