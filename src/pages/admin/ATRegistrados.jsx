import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Button,
  TextField,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Phone, RefreshCcw, Mail, CheckCircle, Clock, Search, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  escucharATTodosRealtime,
  obtenerATTodos,
} from '../../services/atExternoService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/theme';

const ATRegistrados = () => {
  const { userRol } = useAuth();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [preferenciaFiltro, setPreferenciaFiltro] = useState('');
  const [zonaFiltro, setZonaFiltro] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (userRol !== 'administrador') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Acceso restringido. Solo administradores pueden ver este contenido.</Alert>
      </Box>
    );
  }

  const refreshListado = async () => {
    setLoading(true);
    setError(null);

    try {
      const todos = await obtenerATTodos(true);
      setRegistros(todos);
      setPage(0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los AT.');
    } finally {
      setLoading(false);
    }
  };

  const generos = Array.from(
    new Set(registros.map((registro) => registro.genero?.trim()).filter(Boolean))
  ).sort();
  const preferenciasLaborales = Array.from(
    new Set(registros.map((registro) => registro.preferenciaLaboral?.trim()).filter(Boolean))
  ).sort();
  const zonasDisponibles = Array.from(
    new Set(registros.flatMap((registro) => registro.zonas || []).map((zona) => zona?.trim()).filter(Boolean))
  ).sort();

  const registrosFiltrados = registros.filter((registro) => {
    const term = filtro.trim().toLowerCase();
    const campoTexto = [
      registro.nombre,
      registro.especializaciones,
      registro.zonas?.join(' '),
      registro.email,
      registro.whatsapp,
      registro.genero,
      registro.preferenciaLaboral,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !term || campoTexto.includes(term);
    const matchesGenero =
      !generoFiltro || registro.genero?.toLowerCase() === generoFiltro.toLowerCase();
    const matchesPreferencia =
      !preferenciaFiltro ||
      registro.preferenciaLaboral?.toLowerCase() === preferenciaFiltro.toLowerCase();
    const matchesZona =
      !zonaFiltro ||
      registro.zonas?.some((zona) => zona?.toLowerCase() === zonaFiltro.toLowerCase());

    return matchesSearch && matchesGenero && matchesPreferencia && matchesZona;
  });

  const femeninoCount = registrosFiltrados.filter(
    (registro) => registro.genero?.toLowerCase() === 'femenino'
  ).length;
  const masculinoCount = registrosFiltrados.filter(
    (registro) => registro.genero?.toLowerCase() === 'masculino'
  ).length;
  const registrosPaginados = registrosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = escucharATTodosRealtime(
      (items) => {
        setRegistros(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Error al recibir actualizaciones en tiempo real.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, md: 2 }, pt: { xs: 0.5, md: 1.5 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={3} gap={2}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            AT Registrados
          </Typography>
          <Typography variant="body1" color={colors.textSecondary}>
            Lista profesional de <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, bgcolor: alpha(colors.primary, 0.06), px: 0.75, py: 0.25, borderRadius: 0.5 }}>at_registros</Box> desde Firebase externo
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} width={{ xs: '100%', sm: 'auto' }}>
          <TextField
            fullWidth
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar AT por nombre, zona, email o WhatsApp"
            size="small"
            sx={{
              minWidth: 280,
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.surfaceSecondary,
                borderRadius: '10px',
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.borderHover },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
            }}
            InputProps={{
              startAdornment: <Search size={16} style={{ marginRight: 8, color: colors.textMuted }} />,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshCcw size={16} />}
            onClick={refreshListado}
            disabled={loading}
            sx={{ whiteSpace: 'nowrap', height: 40 }}
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: '16px', border: `1px solid ${colors.border}`, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Género</InputLabel>
          <Select
            label="Género"
            value={generoFiltro}
            onChange={(e) => {
              setGeneroFiltro(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {generos.map((genero) => (
              <MenuItem key={genero} value={genero}>
                {genero}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 210 }}>
          <InputLabel>Preferencia laboral</InputLabel>
          <Select
            label="Preferencia laboral"
            value={preferenciaFiltro}
            onChange={(e) => {
              setPreferenciaFiltro(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            {preferenciasLaborales.map((pref) => (
              <MenuItem key={pref} value={pref}>
                {pref}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Zona</InputLabel>
          <Select
            label="Zona"
            value={zonaFiltro}
            onChange={(e) => {
              setZonaFiltro(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            {zonasDisponibles.map((zona) => (
              <MenuItem key={zona} value={zona}>
                {zona}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1, minWidth: 200, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Chip
            icon={<Users size={14} />}
            label={`${registrosFiltrados.length} de ${registros.length}`}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          />
          <Chip
            icon={<User size={14} />}
            label={`F: ${femeninoCount}`}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          />
          <Chip
            icon={<User size={14} />}
            label={`M: ${masculinoCount}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          />
        </Box>
      </Paper>

      {filtro && (
        <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 2 }}>
          Buscando por <Box component="span" sx={{ fontWeight: 600, color: colors.textPrimary }}>«{filtro}»</Box>
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={44} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {!loading && !error && registros.length === 0 && (
        <Paper elevation={0} sx={{ p: 6, borderRadius: '20px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: alpha(colors.primary, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, mx: 'auto' }}>
            <Users size={28} color={colors.primary} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>No se encontraron AT</Typography>
          <Typography variant="body2" color={colors.textSecondary}>No hay registros en la colección externa.</Typography>
        </Paper>
      )}

      {!loading && !error && registrosFiltrados.length === 0 && registros.length > 0 && (
        <Paper elevation={0} sx={{ p: 6, borderRadius: '20px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '16px', backgroundColor: alpha(colors.warning, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, mx: 'auto' }}>
            <Search size={28} color={colors.warning} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Sin resultados</Typography>
          <Typography variant="body2" color={colors.textSecondary}>No se encontró ningún AT para la búsqueda «{filtro}».</Typography>
        </Paper>
      )}

      {!loading && !error && registros.length > 0 && registrosFiltrados.length > 0 && (
        <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.surfaceSecondary }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, pl: 3, borderBottom: `2px solid ${colors.border}` }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, borderBottom: `2px solid ${colors.border}` }}>Especializaciones</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, borderBottom: `2px solid ${colors.border}` }}>Zona</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, borderBottom: `2px solid ${colors.border}` }}>Género</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, borderBottom: `2px solid ${colors.border}` }}>Contacto</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, borderBottom: `2px solid ${colors.border}` }}>Estado</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.textSecondary, py: 2.5, pr: 3, borderBottom: `2px solid ${colors.border}` }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrosPaginados.map((registro) => (
                  <TableRow
                    key={registro.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: alpha(colors.primary, 0.02) },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ minWidth: 220, py: 2.5, pl: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {registro.nombre || 'Sin nombre'}
                      </Typography>
                      <Typography variant="caption" color={colors.textSecondary}>
                        {registro.email || registro.whatsapp || 'Sin contacto'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <Typography variant="body2" color={colors.textSecondary}>
                        {registro.especializaciones || 'No especificado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {registro.zonas?.length ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {registro.zonas.map((z, i) => (
                            <Chip key={i} label={z} size="small" sx={{ borderRadius: '6px', fontSize: '0.6875rem', height: 22 }} />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color={colors.textSecondary}>No definido</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<PersonIcon sx={{ fontSize: 14 }} />}
                        label={registro.genero ? registro.genero : 'No definido'}
                        size="small"
                        color={registro.genero?.toLowerCase() === 'femenino' ? 'secondary' : 'primary'}
                        sx={{ textTransform: 'capitalize', borderRadius: '8px', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      {registro.whatsapp && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}>
                          <Phone size={13} color={colors.textMuted} /> {registro.whatsapp}
                        </Typography>
                      )}
                      {registro.email && (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, wordBreak: 'break-all' }}>
                          <Mail size={13} color={colors.textMuted} /> {registro.email}
                        </Typography>
                      )}
                      {!registro.whatsapp && !registro.email && (
                        <Typography variant="body2" color={colors.textSecondary}>
                          Sin contacto
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap">
                        <Chip
                          label={registro.estado ? registro.estado.toUpperCase() : 'SIN ESTADO'}
                          color={registro.estado === 'activo' ? 'success' : 'default'}
                          size="small"
                          sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.6875rem' }}
                        />
                        {registro.perfilPublicado !== undefined && (
                          <Chip
                            label={registro.perfilPublicado ? 'Publicado' : 'No publicado'}
                            size="small"
                            sx={{ borderRadius: '8px', fontSize: '0.6875rem' }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ width: 215, pr: 3 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ minWidth: 200 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          href={`https://wa.me/${(registro.whatsapp || '').replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          disabled={!registro.whatsapp}
                          sx={{ whiteSpace: 'nowrap', borderRadius: '8px', fontSize: '0.75rem', minWidth: 90 }}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                          onClick={() => navigate(`/at-registrados/${registro.id}`)}
                          sx={{ minWidth: 116, whiteSpace: 'nowrap', borderRadius: '8px', fontSize: '0.75rem' }}
                        >
                          Ver detalle
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10]}
            component="div"
            count={registrosFiltrados.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count} registros`
            }
            sx={{ borderTop: `1px solid ${colors.border}`, px: 2 }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ATRegistrados;
