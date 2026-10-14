import type { Metadata } from 'next';
import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { CampaignCard } from '@/components/CampaignCard';
import { PHOTO } from '@/lib/covers';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Iniciativas activas',
  description:
    'Respuestas a emergencias y proyectos de desarrollo social: apoya con fondos, insumos o voluntariado y sigue cada aporte con trazabilidad.',
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
          <div className="eyebrow eyebrowLight">Iniciativas activas</div>
          <h1 className="pageBannerTitle">Respuestas a emergencias y proyectos sociales</h1>
          <p className="pageBannerText">
            Cada iniciativa muestra su avance en fondos, insumos acopiados y voluntarios, qué
            necesita todavía y quién la organiza. Te sumas como donante o voluntario y sigues a
            dónde fue tu ayuda.
          </p>
          <div className="pageBannerActions">
            <a href={newCampaignLink()} className="btn btnGold">
              <Icon name="sparkles" size={16} /> Lanzar iniciativa
            </a>
            <Link href="/reportar" className="btn btnGhostLight">
              Reportar una emergencia
            </Link>
          </div>
        </div>
      </section>

      {campaigns.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>
          Aún no hay iniciativas.{' '}
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
