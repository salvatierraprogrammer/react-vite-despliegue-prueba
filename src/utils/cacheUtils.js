const DEFAULT_TTL = 5 * 60 * 1000;

const PREFIX = 'at_cache_';

export const CACHE_KEYS = {
  TODOS: 'at_registros_todos',
  POR_ID: (id) => `at_registro_${id}`,
};

export const getFromCache = (key) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > DEFAULT_TTL) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const setToCache = (key, data) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage lleno o deshabilitado
  }
};

export const removeFromCache = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
};

export const clearAllCache = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};
