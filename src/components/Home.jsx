import React from 'react';
import { Box } from '@mui/material';
import { colors } from '../theme/theme';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import CTASection from './sections/CTASection';

const Home = () => {
  return (
    <Box sx={{ backgroundColor: colors.background, overflow: 'hidden' }}>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </Box>
  );
};

export default Home;
