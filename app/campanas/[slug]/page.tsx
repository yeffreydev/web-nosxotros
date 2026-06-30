import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaign } from '@/lib/api';
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

export const revalidate = 60;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCampaign(params.slug);
  if (!c) return { title: 'Campaña no encontrada' };
  const pct = c.progressPct;
  const desc =
    c.goalAmount != null
      ? `${c.summary} · ${formatSoles(c.raisedAmount)} recaudados (${pct}%) de ${formatSoles(c.goalAmount)}.`
      : `${c.summary} · ${formatSoles(c.raisedAmount)} recaudados.`;
  return {
    title: c.title,
    description: desc,
    alternates: { canonical: `/campanas/${c.slug}` },
    openGraph: {
      type: 'article',
      title: c.title,
      description: desc,
      url: `/campanas/${c.slug}`,
      images: c.coverPhoto ? [{ url: c.coverPhoto }] : undefined,
    },
    twitter: {
      card: c.coverPhoto ? 'summary_large_image' : 'summary',
      title: c.title,
      description: desc,
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

  const cat = CAMPAIGN_CATEGORY[c.category];
  const st = CAMPAIGN_STATUS[c.status];
  const funded = c.progressPct >= 100 || c.status === 'FUNDED';
  const dleft = daysLeft(c.deadline);
  const closed = ['COMPLETED', 'CANCELLED', 'PAUSED'].includes(c.status);

  // JSON-LD para resultados enriquecidos (SEO).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DonateAction',
    name: c.title,
    description: c.summary,
    ...(c.organizer ? { agent: { '@type': 'Person', name: c.organizer.fullName } } : {}),
  };

  return (
    <div className="detailWrap" style={{ paddingTop: 8 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p style={{ margin: '12px 0' }}>
        <a href="/campanas" style={{ color: 'var(--text-muted)' }}>
          ← Explorar campañas
        </a>
      </p>

      <div
        className="detailHero"
        style={c.coverPhoto ? { backgroundImage: `url(${c.coverPhoto})` } : undefined}
      >
        {!c.coverPhoto && <Icon name={cat.icon} size={72} strokeWidth={1.4} />}
      </div>

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

      {c.volunteerSkills && c.volunteerSkills.length > 0 && (
        <div className="block">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, fontWeight: 700 }}>
            <Icon name="users" size={18} /> Voluntarios que busca
          </div>
          <div className="badges">
            {c.volunteerSkills.map((sk) => (
              <span key={sk} className="badge">{VOL_SKILL_LABEL[sk] ?? sk}</span>
            ))}
          </div>
        </div>
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
