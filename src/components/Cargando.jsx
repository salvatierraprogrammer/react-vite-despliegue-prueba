import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './css/Cargando.css';

const Cargando = ({ text = 'Cargando' }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="cargando-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="cargando-inner">
          <motion.div
            className="cargando-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
          >
            AT
          </motion.div>
          <div className="cargando-spinner" />
          <p className="cargando-text">
            {text}<span className="cargando-dots" />
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Cargando;
