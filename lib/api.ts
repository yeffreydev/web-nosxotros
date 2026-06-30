import { API_URL } from './config';
import type { Campaign } from './types';

// Fetch server-side con revalidación ISR (SEO + frescura).
async function apiGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getCampaigns(params?: { category?: string }): Promise<Campaign[] | null> {
  const qs = params?.category ? `?category=${encodeURIComponent(params.category)}` : '';
  return apiGet<Campaign[]>(`/campaigns${qs}`);
}

export function getCampaign(slug: string): Promise<Campaign | null> {
  return apiGet<Campaign>(`/campaigns/${encodeURIComponent(slug)}`);
}
