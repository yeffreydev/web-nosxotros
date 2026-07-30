import type { Campaign, CampaignGoals, CampaignOperations } from './types';
import { API_URL } from './config';

// Datos reales del backend NestJS (endpoints públicos de /campaigns).
// Sin caché: cada request al backend en cada visita. Las campañas se publican y
// editan desde el app, y con ISR una campaña recién publicada tardaba en salir.
// Recargar la página siempre muestra el estado actual.
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend caído o inalcanzable: la página muestra su estado vacío.
    return null;
  }
}

export async function getCampaigns(params?: {
  category?: string;
  featured?: boolean;
  q?: string;
}): Promise<Campaign[] | null> {
  const qs = new URLSearchParams({ status: 'ACTIVE' });
  if (params?.category) qs.set('category', params.category);
  if (params?.featured) qs.set('featured', 'true');
  if (params?.q) qs.set('q', params.q);
  return apiGet<Campaign[]>(`/campaigns?${qs.toString()}`);
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  return apiGet<Campaign>(`/campaigns/${encodeURIComponent(slug)}`);
}

/**
 * Metas de la campaña: dinero, voluntarios y especies ("faltan 150 frazadas").
 * El progreso en especie lo calcula el backend contra el almacén de los centros.
 */
export async function getCampaignGoals(slug: string): Promise<CampaignGoals | null> {
  return apiGet<CampaignGoals>(`/campaigns/${encodeURIComponent(slug)}/goals`);
}

/** Zonas y centros de acopio de la campaña: a dónde llevar lo que se dona. */
export async function getCampaignOperations(slug: string): Promise<CampaignOperations | null> {
  return apiGet<CampaignOperations>(`/campaigns/${encodeURIComponent(slug)}/operations`);
}
