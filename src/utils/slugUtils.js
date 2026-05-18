const NEUTRAL_TITLES = [
  { keywords: ['escolar', 'colegio', 'escuela', 'aula', 'clase', 'integraci'], slug: 'integracion-escolar' },
  { keywords: ['domicilio', 'domiciliario', 'casa', 'hogar'], slug: 'acompanamiento-domiciliario' },
  { keywords: ['autismo', 'tea', 'espectro', 'autista'], slug: 'acompanamiento-terapeutico' },
  { keywords: ['tdah', 'hiperactividad', 'atencion'], slug: 'acompanamiento-terapeutico' },
  { keywords: ['adulto', 'mayor', 'tercera', 'anciano'], slug: 'acompanamiento-adulto-mayor' },
  { keywords: ['discapacidad', 'capacidades diferentes'], slug: 'acompanamiento-terapeutico' },
  { keywords: ['rehabilitacion', 'terapia', 'kinesiologia'], slug: 'acompanamiento-terapeutico' },
  { keywords: ['salud mental', 'psiquiatrico', 'psicologia', 'psicosocial'], slug: 'acompanamiento-psicosocial' },
  { keywords: ['nino', 'niño', 'infantil', 'pediatrico'], slug: 'acompanamiento-infantil' },
  { keywords: ['joven', 'juvenil', 'adolescente'], slug: 'acompanamiento-juvenil' },
];

export function generarSlug(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function encontrarNeutralTitle(diagnostico) {
  if (!diagnostico) return null;
  const lower = diagnostico.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const entry of NEUTRAL_TITLES) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry.slug;
    }
  }
  return null;
}

export function toNeutralSlugTitle(diagnostico) {
  return encontrarNeutralTitle(diagnostico) || 'acompanamiento-terapeutico';
}

export function generarShortId(docId, length = 5) {
  if (!docId) return '';
  return docId.slice(-length);
}

export function generarSlugCompleto(cliente, localidad, docId, diagnostico) {
  const neutral = toNeutralSlugTitle(diagnostico || cliente);
  const locSlug = generarSlug(localidad || '');
  const base = locSlug ? `${neutral}-${locSlug}` : neutral;
  const shortId = generarShortId(docId);
  return `${base}-${shortId}`;
}

export function getShortIdFromSlug(slug) {
  if (!slug || slug.includes('/')) return null;
  const parts = slug.split('-');
  const candidate = parts[parts.length - 1];
  if (candidate && candidate.length === 5 && /^[a-zA-Z0-9]+$/.test(candidate)) {
    return candidate;
  }
  return null;
}

export function generarPerfilSlug(nombreCompleto) {
  if (!nombreCompleto) return '';
  const base = generarSlug(nombreCompleto);
  const random = Math.random().toString(36).substring(2, 6);
  return `${base}-${random}`;
}
