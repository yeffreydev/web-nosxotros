import type { Metadata } from 'next';
import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { CampaignCard } from '@/components/CampaignCard';
import { PHOTO } from '@/lib/covers';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Explorar campañas',
  description:
    'Descubre campañas de crecimiento en Arequipa: salud, educación, emprendimiento, comunidad y más. Apoya una causa hoy.',
  alternates: { canonical: '/campanas' },
};

// Render en cada request: la lista siempre trae lo que hay publicado ahora.
export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const campaigns = (await getCampaigns()) ?? [];

  return (
    <div>
      <section className="pageBanner">
        <span className="pageBannerImg" style={{ backgroundImage: `url(${PHOTO.entrega})` }} aria-hidden="true" />
        <div className="pageBannerBody">
          <div className="eyebrow eyebrowLight">Crecimiento</div>
          <h1 className="pageBannerTitle">Campañas que necesitan tu apoyo</h1>
          <p className="pageBannerText">
            Cada campaña muestra cuánto lleva recaudado, qué necesita todavía y quién la organiza.
            Aportas en dinero, en especie o con tu tiempo, y sigues a dónde fue tu ayuda.
          </p>
          <div className="pageBannerActions">
            <a href={newCampaignLink()} className="btn btnGold">
              <Icon name="sparkles" size={16} /> Crear campaña
            </a>
            <Link href="/reportar" className="btn btnGhostLight">
              Reportar una emergencia
            </Link>
          </div>
        </div>
      </section>

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
