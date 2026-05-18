import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, Skeleton, alpha } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfg/firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

const publicPaths = ['/buscar-acompanante', '/perfil/', '/showPerfil/', '/showPerfilReclutador/', '/ver-caso/'];

function AuthSkeleton() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.background,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Skeleton variant="rounded" width={36} height={36} animation="wave" sx={{ borderRadius: '10px' }} />
          <Skeleton variant="text" animation="wave" width={160} height={20} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 4, px: 1 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              animation="wave"
              width={100}
              height={34}
              sx={{ borderRadius: '8px' }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                animation="wave"
                width={40}
                height={40}
                sx={{ borderRadius: '10px', flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" animation="wave" width="40%" height={14} />
                <Skeleton variant="text" animation="wave" width="75%" height={14} sx={{ mt: 0.5 }} />
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 260,
            height: '100vh',
            borderRight: `1px solid ${alpha(colors.border, 0.6)}`,
            p: 2,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          <Skeleton variant="rounded" animation="wave" width="100%" height={44} sx={{ borderRadius: '10px', mb: 2 }} />
          <Skeleton variant="rounded" animation="wave" width="100%" height={200} sx={{ borderRadius: '14px', mb: 2 }} />
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 1 }}>
              <Skeleton variant="rounded" animation="wave" width={32} height={32} sx={{ borderRadius: '8px' }} />
              <Skeleton variant="text" animation="wave" width="65%" height={16} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export const ProtectedRoute = () => {
  const { user, userRol, loading } = useAuth();
  const location = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (userRol === 'empleado') {
        const checkEmpleado = async () => {
          try {
            const perfilDoc = await getDoc(doc(db, 'perfilLaboral', user.uid));
            const exists = perfilDoc.exists();
            const data = perfilDoc.data();
            if (!exists || !data?.nombreCompleto) {
              setNeedsOnboarding(true);
            }
          } catch {
            setNeedsOnboarding(true);
          }
          setOnboardingChecked(true);
        };
        checkEmpleado();
      } else if (userRol === 'familiar') {
        const checkFamiliar = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            const data = userDoc.data();
            if (!data?.nombreEntidad || !data?.phoneNumber) {
              setNeedsOnboarding(true);
            }
          } catch {
            setNeedsOnboarding(true);
          }
          setOnboardingChecked(true);
        };
        checkFamiliar();
      } else {
        setOnboardingChecked(true);
      }
    } else if (!loading) {
      setOnboardingChecked(true);
    }
  }, [loading, user, userRol, user?.uid, location.pathname]);

  if (loading) {
    return <AuthSkeleton />;
  }

  if (!user) {
    const isPublicPath = publicPaths.some(p => 
      p.endsWith('/') ? location.pathname.startsWith(p) : location.pathname === p
    );
    if (isPublicPath) return <Outlet />;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!onboardingChecked) {
    return <AuthSkeleton />;
  }

  if (needsOnboarding) {
    if (userRol === 'familiar' && !location.pathname.startsWith('/miCuenta')) {
      return <Navigate to="/miCuenta" replace />;
    }
    if (userRol === 'empleado' && !location.pathname.startsWith('/editarPerfilLaboral')) {
      return <Navigate to={`/editarPerfilLaboral/${user.uid}`} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;