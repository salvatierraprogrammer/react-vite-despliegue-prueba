import React from 'react'; 
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const Home = () => {
    return (
        <Container sx={{ padding: '3rem 1rem', marginTop: '90px', textAlign: 'center' }}>
            <Box
                sx={{
                    padding: '2rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '15px',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                    marginBottom: '3rem',
                    animation: 'fadeIn 1s ease-out',
                }}
            >
                <Typography variant="h3" sx={{ color: '#504683', fontWeight: 'bold' }}>
                    Bienvenido a Nuestra Plataforma de Acompañantes Terapéuticos
                </Typography>
                <Typography variant="h6" sx={{ marginTop: '1rem', color: '#504683', fontWeight: '300' }}>
                    La solución perfecta para quienes buscan apoyo terapéutico o profesionales en busca de nuevas oportunidades.
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', flexWrap: 'wrap', gap: '1.5rem' }}>
                <Box
                    sx={{
                        padding: '2rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '15px',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
                        flexBasis: '45%',
                        maxWidth: '45%',
                        animation: 'fadeInUp 1s ease-out',
                        '@media (max-width: 600px)': {
                            flexBasis: '100%',
                            maxWidth: '100%',
                        },
                    }}
                >
                    <Typography variant="h5" sx={{ color: '#504683', fontWeight: 'bold' }}>
                        Busco Acompañante Terapéutico
                    </Typography>
                    <Typography sx={{ color: '#504683', marginBottom: '1.5rem' }}>
                        Encuentra y conecta con acompañantes terapéuticos calificados. Explora perfiles, revisa calificaciones y selecciona al profesional que mejor se adapte a tus necesidades.
                    </Typography>
                    <Button
                        component={Link}
                        to="/buscar-acompanante"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(90deg, #117B67, #2ECCCA, #26B3DB)',
                            color: 'white',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#0D7059',
                                transform: 'scale(1.05)',
                            },
                            transition: 'transform 0.3s ease, background-color 0.3s ease',
                        }}
                    >
                        Buscar Acompañante
                    </Button>
                </Box>
                
                <Box
                    sx={{
                        padding: '2rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '15px',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
                        flexBasis: '45%',
                        maxWidth: '45%',
                        animation: 'fadeInUp 1s ease-out',
                        '@media (max-width: 600px)': {
                            flexBasis: '100%',
                            maxWidth: '100%',
                        },
                    }}
                >
                    <Typography variant="h5" sx={{ color: '#504683', fontWeight: 'bold' }}>
                        Busco Trabajo como Acompañante Terapéutico
                    </Typography>
                    <Typography sx={{ color: '#504683', marginBottom: '1.5rem' }}>
                        Crea y actualiza tu perfil profesional, muestra tu experiencia y habilidades, y encuentra oportunidades laborales en el campo de la terapia.
                    </Typography>
                    <Button
                        component={Link}
                        to="/buscar-trabajo"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(90deg, #117B67, #2ECCCA, #26B3DB)',
                            color: 'white',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#0D7059',
                                transform: 'scale(1.05)',
                            },
                            transition: 'transform 0.3s ease, background-color 0.3s ease',
                        }}
                    >
                        Buscar Trabajo
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Home;