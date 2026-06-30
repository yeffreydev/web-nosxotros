import type { MetadataRoute } from 'next';
import { getCampaigns } from '@/lib/api';
import { SITE_URL } from '@/lib/config';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const campaigns = (await getCampaigns()) ?? [];
  const campaignUrls: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${SITE_URL}/campanas/${c.slug}`,
    lastModified: c.createdAt ? new Date(c.createdAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/campanas`, changeFrequency: 'daily', priority: 0.9 },
    ...campaignUrls,
  ];
}
