import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { colors } from '../../theme/theme';
import { useBreadcrumb } from '../layout/DashboardLayout';

const ROUTE_CONFIG = {
  'dashboard': { label: 'Dashboard', parent: null },
  'notificaciones': { label: 'Notificaciones', parent: null },
  'buscar-trabajo': { label: 'Buscar Trabajo', parent: null },
  'buscar-acompanante': { label: 'Buscar Acompañantes', parent: null },
  'misPublicaciones': { label: 'Mis Publicaciones', parent: null },
  'nuevaPublicacion': { label: 'Nueva Publicación', parent: null },
  'cvEnvidos': { label: 'CVs Enviados', parent: null },
  'cv-recibido': { label: 'CVs Recibidos', parent: null },
  'miCuenta': { label: 'Mi Cuenta', parent: null },
  'perfilLaboralUpdate': { label: 'Mi Perfil Laboral', parent: null },
  'editarPerfilLaboral': { label: 'Editar Perfil', parent: null },
  'crear-perfil-laboral': { label: 'Crear Perfil Laboral', parent: null },
  'admin': { label: 'Administración', parent: null },
  'usuarios-nuevos': { label: 'Usuarios Nuevos', parent: null },
  'at-registrados': { label: 'AT Registrados', parent: null },
  'ver-caso': { label: 'Casos', parent: null, param: true },
  'editar-publicacion': { label: 'Publicaciones', parent: null, param: true },
  'ver-usuario': { label: 'Usuarios', parent: null, param: true },
  'showPerfil': { label: 'Perfiles', parent: null, param: true },
  'showPerfilReclutador': { label: 'Perfiles', parent: null, param: true },
  'perfil': { label: 'Profesionales', parent: null, param: true },
  'generarFlyer': { label: 'Generar Flyer', parent: null, param: true },
};

const DYNAMIC_LABELS = {
  'perfil': 'Perfil profesional',
  'ver-caso': 'Detalle del caso',
  'editar-publicacion': 'Editar publicación',
  'ver-usuario': 'Datos del usuario',
  'showPerfil': 'Perfil profesional',
  'showPerfilReclutador': 'Perfil de reclutador',
  'generarFlyer': 'Flyer',
  'editarPerfilLaboral': 'Editar perfil',
};

const getBreadcrumbsFor = (pathname, caseTitle) => {
  const paths = pathname.split('/').filter(Boolean);

  if (paths.length === 0) {
    return [{ label: 'Dashboard', path: '/dashboard', isLast: true }];
  }

  if (paths.length === 1) {
    const config = ROUTE_CONFIG[paths[0]];
    return [{ label: config?.label || 'Dashboard', path: `/${paths[0]}`, isLast: true }];
  }

  const crumbs = [];
  let resolvedTitle = null;
  const dynamicLabel = DYNAMIC_LABELS[paths[0]];

  if (caseTitle) {
    resolvedTitle = caseTitle;
  }

  const parentConfig = ROUTE_CONFIG[paths[0]];
  if (parentConfig) {
    crumbs.push({
      label: parentConfig.label,
      path: `/${paths[0]}`,
      isLast: false,
    });
  }

  if (paths.length > 1) {
    const isLoading = resolvedTitle === null || resolvedTitle === undefined;
    crumbs.push({
      label: isLoading ? null : resolvedTitle || dynamicLabel || 'Detalle',
      path: pathname,
      isLast: true,
      loading: isLoading,
    });
  }

  return crumbs;
};

const IntelligentBreadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caseTitle } = useBreadcrumb();

  const breadcrumbs = getBreadcrumbsFor(location.pathname, caseTitle);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumbs
      separator={
        <ChevronRight size={14} color={alpha(colors.textMuted, 0.6)} />
      }
      sx={{
        '& .MuiBreadcrumbs-ol': {
          flexWrap: 'nowrap',
        },
        '& .MuiBreadcrumbs-li': {
          whiteSpace: 'nowrap',
        },
      }}
    >
      {breadcrumbs.map((crumb, index) =>
        crumb.loading ? (
          <Box
            key={crumb.path}
            component={motion.span}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Skeleton
              variant="text"
              animation="wave"
              width={120}
              height={16}
              sx={{ display: 'inline-block', bgcolor: alpha(colors.primary, 0.04) }}
            />
          </Box>
        ) : crumb.isLast ? (
          <Typography
            key={crumb.path}
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {crumb.label}
          </Typography>
        ) : (
          <Link
            key={crumb.path}
            underline="hover"
            color="textSecondary"
            onClick={() => navigate(crumb.path)}
            sx={{
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 400,
              transition: 'color 0.15s ease',
              '&:hover': { color: colors.primary },
            }}
          >
            {crumb.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  );
};

export default React.memo(IntelligentBreadcrumb);
