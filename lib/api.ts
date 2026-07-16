import type { Campaign } from './types';
import { API_URL } from './config';

// Datos reales del backend NestJS (endpoints públicos de /campaigns).
// Se revalidan cada 60 s: las páginas son estáticas pero las campañas se refrescan.
const REVALIDATE_SECONDS = 60;

// Etiquetas de caché. Sin ellas, revalidatePath() re-renderiza la página pero el
// fetch de abajo devuelve su copia cacheada hasta que vencen los 60 s, así que
// una campaña recién publicada no aparecía en la lista. revalidateTag() sí tira
// el dato. La lista y el detalle se etiquetan por separado para no invalidar de
// más al editar una sola campaña.
export const CAMPAIGNS_TAG = 'campaigns';
export const campaignTag = (slug: string) => `campaign:${slug}`;

async function apiGet<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags },
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
  return apiGet<Campaign[]>(`/campaigns?${qs.toString()}`, [CAMPAIGNS_TAG]);
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  return apiGet<Campaign>(`/campaigns/${encodeURIComponent(slug)}`, [
    CAMPAIGNS_TAG,
    campaignTag(slug),
  ]);
}
