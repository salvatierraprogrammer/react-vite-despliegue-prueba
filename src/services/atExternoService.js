import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { dbExterno } from '../firebase/firebaseExterno';
import { CACHE_KEYS, getFromCache, setToCache, removeFromCache } from '../utils/cacheUtils';

const logFirestoreIndexHint = (error) => {
  if (typeof error.message === 'string' && error.message.includes('requires an index')) {
    console.error(
      'Firestore index required: crea el índice compuesto para estado==activo, perfilPublicado==true, nombre asc en Firebase Console.'
    );
  }
};

const atRegistrosCollection = () => collection(dbExterno, 'at_registros');

// Firestore requiere un índice cuando se combinan múltiples filtros y orderBy en diferentes campos.
// Para listar AT activos sin depender de `perfilPublicado`, usamos solo el filtro por estado.
const buildATQuery = (...filters) =>
  query(atRegistrosCollection(), ...filters, orderBy('nombre', 'asc'));

export const obtenerATRegistrados = async () => {
  try {
    const consulta = buildATQuery();
    const snapshot = await getDocs(consulta);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('obtenerATRegistrados error:', error);
    logFirestoreIndexHint(error);
    return [];
  }
};

export const obtenerATPorId = async (id) => {
  const cached = getFromCache(CACHE_KEYS.POR_ID(id));
  if (cached) return cached;

  try {
    const registroRef = doc(dbExterno, 'at_registros', id);
    const registroSnap = await getDoc(registroRef);
    const data = registroSnap.exists() ? { id: registroSnap.id, ...registroSnap.data() } : null;
    if (data) setToCache(CACHE_KEYS.POR_ID(id), data);
    return data;
  } catch (error) {
    console.error('obtenerATPorId error:', error);
    return null;
  }
};

export const activarAT = async (id) => {
  try {
    const registroRef = doc(dbExterno, 'at_registros', id);
    await updateDoc(registroRef, { estado: 'activo' });
    removeFromCache(CACHE_KEYS.POR_ID(id));
    removeFromCache(CACHE_KEYS.TODOS);
    return true;
  } catch (error) {
    console.error('activarAT error:', error);
    return false;
  }
};

export const actualizarAT = async (id, cambios) => {
  try {
    const registroRef = doc(dbExterno, 'at_registros', id);
    await updateDoc(registroRef, cambios);
    removeFromCache(CACHE_KEYS.POR_ID(id));
    removeFromCache(CACHE_KEYS.TODOS);
    return true;
  } catch (error) {
    console.error('actualizarAT error:', error);
    return false;
  }
};

export const escucharATRealtime = (onUpdate, onError) => {
  try {
    const consulta = buildATQuery(
      where('estado', '==', 'activo')
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        const registros = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        onUpdate(registros);
      },
      (error) => {
        console.error('escucharATRealtime error:', error);
        logFirestoreIndexHint(error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('escucharATRealtime error:', error);
    logFirestoreIndexHint(error);
    if (onError) onError(error);
    return () => {};
  }
};

export const buscarATPorZona = async (zona) => {
  try {
    const consulta = buildATQuery(
      where('zonas', 'array-contains', zona)
    );
    const snapshot = await getDocs(consulta);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('buscarATPorZona error:', error);
    logFirestoreIndexHint(error);
    return [];
  }
};

export const obtenerATTodos = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getFromCache(CACHE_KEYS.TODOS);
    if (cached) return cached;
  }

  try {
    const consulta = buildATQuery();
    const snapshot = await getDocs(consulta);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setToCache(CACHE_KEYS.TODOS, data);
    return data;
  } catch (error) {
    console.error('obtenerATTodos error:', error);
    logFirestoreIndexHint(error);
    return [];
  }
};

export const escucharATTodosRealtime = (onUpdate, onError) => {
  const cached = getFromCache(CACHE_KEYS.TODOS);
  if (cached) onUpdate(cached);

  try {
    const consulta = buildATQuery();

    return onSnapshot(
      consulta,
      (snapshot) => {
        const registros = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setToCache(CACHE_KEYS.TODOS, registros);
        onUpdate(registros);
      },
      (error) => {
        console.error('escucharATTodosRealtime error:', error);
        logFirestoreIndexHint(error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('escucharATTodosRealtime error:', error);
    logFirestoreIndexHint(error);
    if (onError) onError(error);
    return () => {};
  }
};

export const buscarATActivos = obtenerATTodos;
