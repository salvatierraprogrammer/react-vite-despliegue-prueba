import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfg/firebase';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Home from '../../components/Home';
import { LoadingPage } from '../../components/feedback/LoadingSpinner';
import { colors } from '../../theme/theme';

const Show = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (checking) return <LoadingPage />;

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <Home />
    </Box>
  );
};

export default Show;
