import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaign, getCampaignGoals, getCampaignOperations } from '@/lib/api';
import { assetUrl } from '@/lib/assets';
import { coverFor } from '@/lib/covers';
import { SITE_URL } from '@/lib/config';
import {
  CAMPAIGN_CATEGORY,
  CAMPAIGN_STATUS,
  formatSoles,
  formatNumber,
  daysLeft,
} from '@/lib/format';
import { Progress } from '@/components/Progress';
import { Icon } from '@/components/Icon';

type Params = { params: { slug: string } };

// Render en cada request: una campaña publicada o editada sale al recargar.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCampaign(params.slug);
  if (!c) return { title: 'Campaña no encontrada' };
  const pct = c.progressPct;
  const desc =
    c.goalAmount != null
      ? `${c.summary} · ${formatSoles(c.raisedAmount)} recaudados (${pct}%) de ${formatSoles(c.goalAmount)}.`
      : `${c.summary} · ${formatSoles(c.raisedAmount)} recaudados.`;
  // La portada va absoluta y hacia la API real: WhatsApp y Google leen la imagen
  // desde fuera, y una URL a localhost no les sirve para nada.
  const cover = assetUrl(c.coverPhoto);
  return {
    title: c.title,
    description: desc,
    keywords: [c.title, CAMPAIGN_CATEGORY[c.category].label, 'donar', 'campaña', c.district ?? 'Arequipa'],
    alternates: { canonical: `/campanas/${c.slug}` },
    openGraph: {
      type: 'article',
      title: c.title,
      description: desc,
      url: `/campanas/${c.slug}`,
      images: cover ? [{ url: cover, alt: c.title }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: c.title,
      description: desc,
      images: cover ? [cover] : undefined,
    },
  };
}

const TONE_CLASS: Record<string, string> = { success: 'badgeSuccess', gold: 'badgeGold' };

const VOL_SKILL_LABEL: Record<string, string> = {
  MEDIC: 'Médicos',
  LOGISTICS: 'Logística',
  DRIVER: 'Conductores',
  COOK: 'Cocina',
  PSYCHOLOGY: 'Psicología',
  CONSTRUCTION: 'Construcción',
  COMMS: 'Comunicación',
  GENERAL: 'General',
};

export default async function CampaignDetailPage({ params }: Params) {
  const c = await getCampaign(params.slug);
  if (!c) notFound();

  // Metas y centros son extra: si el backend no los da, la página sigue igual.
  const [goals, ops] = await Promise.all([
    getCampaignGoals(params.slug),
    getCampaignOperations(params.slug),
  ]);
  // Lo que todavía falta, primero. Lo bloqueado ("no traer más") se muestra aparte.
  const needs = (goals?.items ?? []).filter((n) => n.targetQty > 0);
  const pending = needs.filter((n) => !n.isBlocked && n.remaining > 0);
  const covered = needs.filter((n) => !n.isBlocked && n.remaining === 0);
  const blocked = needs.filter((n) => n.isBlocked);
  const centers = (ops?.centers ?? []).filter((ctr) => ctr.status !== 'CLOSED');

  const cat = CAMPAIGN_CATEGORY[c.category];
  const st = CAMPAIGN_STATUS[c.status];
  const funded = c.progressPct >= 100 || c.status === 'FUNDED';
  const dleft = daysLeft(c.deadline);
  const closed = ['COMPLETED', 'CANCELLED', 'PAUSED'].includes(c.status);
  const cover = assetUrl(c.coverPhoto);
  const url = `${SITE_URL}/campanas/${c.slug}`;

  // JSON-LD para resultados enriquecidos (SEO).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name: c.title,
    description: c.summary,
    url,
    ...(cover ? { image: cover } : {}),
    ...(c.organizer ? { agent: { '@type': 'Person', name: c.organizer.fullName } } : {}),
    ...(c.deadline ? { endTime: c.deadline } : {}),
    recipient: {
      '@type': 'Organization',
      name: 'NOSXOTROS',
      url: SITE_URL,
    },
    ...(c.goalAmount != null
      ? {
          // El progreso declarado ayuda a que el resultado muestre el estado real.
          purpose: c.summary,
          price: c.raisedAmount,
          priceCurrency: c.currency || 'PEN',
        }
      : {}),
  };

  return (
    <div className="detailWrap" style={{ paddingTop: 8 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p style={{ margin: '12px 0' }}>
        <a href="/campanas" style={{ color: 'var(--text-muted)' }}>
          ← Explorar campañas
        </a>
      </p>

      <div className="detailHero" style={{ backgroundImage: `url(${coverFor(c).url})` }} />

      <div className="badges">
        <span className="badge"><Icon name={cat.icon} size={13} /> {cat.label}</span>
        <span className={`badge ${TONE_CLASS[st.tone] ?? ''}`}>{st.label}</span>
        {c.featured && <span className="badge badgeGold"><Icon name="star" size={13} /> Destacada</span>}
        {c.district && <span className="badge"><Icon name="mapPin" size={13} /> {c.district}</span>}
      </div>

      <h1 style={{ fontSize: '2rem', margin: '0 0 8px' }}>{c.title}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>{c.summary}</p>

      {/* Progreso + CTA */}
      <div className="detailStatCard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <span className="raised">{formatSoles(c.raisedAmount)}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {c.goalAmount != null ? `de ${formatSoles(c.goalAmount)}` : 'recaudado · sin meta fija'}
          </span>
        </div>
        {c.goalAmount != null && (
          <div style={{ margin: '12px 0' }}>
            <Progress pct={c.progressPct} gold={funded} />
          </div>
        )}
        <div className="statline">
          <span>
            <strong style={{ color: 'var(--text)' }}>{formatNumber(c.backersCount)}</strong> donantes
          </span>
          {dleft != null && c.status === 'ACTIVE' && (
            <span>
              <strong style={{ color: 'var(--text)' }}>{dleft}</strong> días restantes
            </span>
          )}
          {c.goalAmount != null && (
            <span>
              <strong style={{ color: 'var(--text)' }}>{c.progressPct}%</strong> de la meta
            </span>
          )}
        </div>
        <Link
          href={`/donar?campaignId=${c.id}&campaign=${encodeURIComponent(c.title)}`}
          className="btn btnGold btnLg"
          style={{ marginTop: 16, width: '100%', justifyContent: 'center', pointerEvents: closed ? 'none' : undefined, opacity: closed ? 0.6 : 1 }}
        >
          {closed ? st.label : 'Apoyar esta campaña'}
        </Link>
      </div>

      {c.organizer && (
        <p style={{ color: 'var(--text-muted)' }}>
          Organizada por <strong style={{ color: 'var(--text)' }}>{c.organizer.fullName}</strong>
        </p>
      )}

      {(c.volunteerSkills?.length || goals?.volunteers.goal) && (
        <div className="block">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, fontWeight: 700 }}>
            <Icon name="users" size={18} /> Voluntarios que busca
          </div>
          {goals?.volunteers.goal ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9375rem', marginBottom: 4 }}>
                <span>{goals.volunteers.enrolled} de {goals.volunteers.goal} personas</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  faltan {Math.max(0, goals.volunteers.goal - goals.volunteers.enrolled)}
                </span>
              </div>
              <Progress pct={goals.volunteers.pct} />
            </div>
          ) : null}
          {c.volunteerSkills && c.volunteerSkills.length > 0 && (
            <div className="badges">
              {c.volunteerSkills.map((sk) => (
                <span key={sk} className="badge">{VOL_SKILL_LABEL[sk] ?? sk}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Qué se necesita en especie: lo concreto que puede traer el donante. */}
      {needs.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.375rem', marginTop: 32 }}>Qué se necesita</h2>
          <div className="block">
            {[...pending, ...covered].map((n) => (
              <div key={n.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: '.9375rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>
                    {n.category?.icon ? `${n.category.icon} ` : ''}{n.title}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {n.remaining > 0
                      ? `faltan ${formatNumber(n.remaining)} ${n.unit}`
                      : `completo · ${formatNumber(n.targetQty)} ${n.unit}`}
                  </span>
                </div>
                <Progress pct={n.pct} gold={n.remaining === 0} />
              </div>
            ))}
            {blocked.length > 0 && (
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '.875rem' }}>
                Por ahora no hace falta traer: {blocked.map((n) => n.title).join(', ')}.
              </p>
            )}
          </div>
        </>
      )}

      {/* Centros de acopio: foto para reconocer el local y enlace para la ruta. */}
      {centers.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.375rem', marginTop: 32 }}>Dónde llevar tu donación</h2>
          <div className="block">
            {centers.map((ctr) => {
              const photo = assetUrl(ctr.photoUrl);
              return (
                <div key={ctr.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  {photo && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo}
                      alt={`Centro de acopio ${ctr.name}`}
                      width={96}
                      height={96}
                      style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                    />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <strong>{ctr.name}</strong>
                    {ctr.isCentral && <span className="badge badgeGold" style={{ marginLeft: 6 }}>Almacén central</span>}
                    {ctr.status === 'NEAR_FULL' && <span className="badge badgeGold" style={{ marginLeft: 6 }}>Casi lleno</span>}
                    {ctr.status === 'FULL' && <span className="badge" style={{ marginLeft: 6 }}>Lleno</span>}
                    {ctr.address && <div style={{ color: 'var(--text-muted)' }}>{ctr.address}</div>}
                    {ctr.reference && <div style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>{ctr.reference}</div>}
                    {ctr.openingHours && (
                      <div style={{ fontSize: '.875rem' }}>
                        <Icon name="clock" size={13} /> {ctr.openingHours}
                      </div>
                    )}
                    {ctr.contactPhone && (
                      <div style={{ fontSize: '.875rem' }}>
                        <a href={`tel:${ctr.contactPhone}`}>{ctr.contactPhone}</a>
                      </div>
                    )}
                    {ctr.mapUrl && (
                      <a
                        href={ctr.mapUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginTop: 4, fontWeight: 700 }}
                      >
                        <Icon name="mapPin" size={14} /> Cómo llegar
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 style={{ fontSize: '1.375rem', marginTop: 32 }}>La historia</h2>
      <div className="block">
        <p className="story" style={{ margin: 0 }}>{c.story}</p>
      </div>

      {c.updates && c.updates.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.375rem', marginTop: 32 }}>Avances ({c.updates.length})</h2>
          <div className="block">
            {c.updates.map((u) => (
              <div key={u.id} className="updateItem">
                <strong>{u.title}</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{u.body}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="ctaBand" style={{ marginTop: 40 }}>
        <h2 className="ctaTitle">Suma tu aporte</h2>
        <p className="ctaSub">Cada sol acerca esta campaña a su meta. Es rápido y trazable.</p>
        <Link href={`/donar?campaignId=${c.id}&campaign=${encodeURIComponent(c.title)}`} className="btn btnGold btnLg">
          Apoyar esta campaña
        </Link>
      </div>
    </div>
  );
}
