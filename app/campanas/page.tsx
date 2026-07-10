import type { Metadata } from 'next';
import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { CampaignCard } from '@/components/CampaignCard';

export const metadata: Metadata = {
  title: 'Explorar campañas',
  description:
    'Descubre campañas de crecimiento en Arequipa: salud, educación, emprendimiento, comunidad y más. Apoya una causa hoy.',
  alternates: { canonical: '/campanas' },
};

export default async function CampaignsPage() {
  const campaigns = (await getCampaigns()) ?? [];

  return (
    <div style={{ paddingTop: 24 }}>
      <div className="sectionHead">
        <div>
          <div className="eyebrow">Crecimiento</div>
          <h1 className="sectionTitle">Campañas de crecimiento</h1>
        </div>
        <a href={newCampaignLink()} className="btn btnGold">
          Crear campaña
        </a>
      </div>

      {campaigns.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          Aún no hay campañas.{' '}
          <Link href="/" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
            Volver al inicio
          </Link>
        </p>
      ) : (
        <div className="grid">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
