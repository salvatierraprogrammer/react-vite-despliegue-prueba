import React from 'react';
import { motion } from 'framer-motion';

const staggerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const childVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const DashboardTransition = ({ children, className, style }) => (
  <motion.div
    variants={staggerVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
    style={{ ...style, width: '100%' }}
  >
    <motion.div variants={childVariants} style={{ width: '100%' }}>
      {children}
    </motion.div>
  </motion.div>
);

export { staggerVariants, childVariants };
export default React.memo(DashboardTransition);
