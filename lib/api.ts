import type { Campaign } from './types';
import { MOCK_CAMPAIGNS } from './mock';

// MODO MAQUETA: el sitio público sirve data mock (sin backend).
// Se mantienen las firmas async para no tocar las páginas.

export function getCampaigns(params?: { category?: string }): Promise<Campaign[] | null> {
  const list = params?.category
    ? MOCK_CAMPAIGNS.filter((c) => c.category === params.category)
    : MOCK_CAMPAIGNS;
  return Promise.resolve(list);
}

export function getCampaign(slug: string): Promise<Campaign | null> {
  return Promise.resolve(MOCK_CAMPAIGNS.find((c) => c.slug === slug) ?? null);
}
