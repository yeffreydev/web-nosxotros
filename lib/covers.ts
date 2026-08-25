import type { Campaign, CampaignCategory } from './types';
import { assetUrl } from './assets';

// Fotos propias del sitio (web/public/img). Son reales, con licencia libre; su
// procedencia está en web/public/img/CREDITOS.json.
export const PHOTO = {
  huaico: '/img/emergencia-huaico.jpg',
  inundacion: '/img/emergencia-inundacion.jpg',
  ollaComun: '/img/comunidad-olla.jpg',
  entrega: '/img/entrega-familias.jpg',
  escuela: '/img/educacion-ninos.jpg',
  reforestacion: '/img/medioambiente.jpg',
  limpieza: '/img/voluntarios-limpieza.jpg',
  animales: '/img/animales-rescate.jpg',
  arequipa: '/img/andes-peru.jpg',
  manos: '/hero-campana.jpg',
} as const;

// Foto que representa a cada categoría cuando la campaña no subió portada.
const BY_CATEGORY: Record<CampaignCategory, string> = {
  EMERGENCY: PHOTO.huaico,
  COMMUNITY: PHOTO.ollaComun,
  HEALTH: PHOTO.entrega,
  EDUCATION: PHOTO.escuela,
  ENVIRONMENT: PHOTO.reforestacion,
  ANIMALS: PHOTO.animales,
  CULTURE: PHOTO.arequipa,
  ENTREPRENEURSHIP: PHOTO.arequipa,
  TECHNOLOGY: PHOTO.limpieza,
  SPORTS: PHOTO.limpieza,
  OTHER: PHOTO.manos,
};

export type Cover = {
  /** URL lista para usar como background-image o src. */
  url: string;
  /** true si la portada la subió el organizador (no es una foto del sitio). */
  own: boolean;
};

/**
 * Portada de una campaña.
 *
 * Prioriza la foto que subió el organizador; si no hay, usa la foto de la
 * categoría. Nunca devuelve vacío: una tarjeta sin imagen se ve rota y hace que
 * toda la grilla parezca a medio hacer.
 */
export function coverFor(c: Pick<Campaign, 'coverPhoto' | 'category'>): Cover {
  const own = assetUrl(c.coverPhoto);
  if (own) return { url: own, own: true };
  return { url: BY_CATEGORY[c.category] ?? PHOTO.manos, own: false };
}
