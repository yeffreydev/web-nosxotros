import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { formatSoles, CAMPAIGN_CATEGORY } from '@/lib/format';
import { assetUrl } from '@/lib/assets';
import { CampaignCard } from '@/components/CampaignCard';
import { HeroIllustration } from '@/components/HeroIllustration';
import { Icon } from '@/components/Icon';

const GUIDE = [
  { icon: 'userPlus', title: 'Regístrate como organizador', body: 'Crea tu cuenta gratis y activa tu perfil.' },
  { icon: 'target', title: 'Define tu meta', body: 'Título claro, categoría y cuánto necesitas recaudar.' },
  { icon: 'penLine', title: 'Cuenta tu historia', body: 'Explica a quién ayudas y agrega una portada.' },
  { icon: 'megaphone', title: 'Publica y comparte', body: 'Difunde el enlace por WhatsApp y redes.' },
  { icon: 'bell', title: 'Publica avances', body: 'Mantén informados a tus donantes.' },
  { icon: 'trophy', title: 'Alcanza tu meta', body: 'Sigue el progreso con trazabilidad total.' },
];

// Render en cada request: las campañas del home salen al recargar.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const campaigns = (await getCampaigns()) ?? [];
  const active = campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'FUNDED');
  // Galería de impacto = mosaico de imágenes de campañas (con portada primero, luego completadas).
  const gallery = [...campaigns]
    .sort((a, b) => {
      const cover = Number(!!b.coverPhoto) - Number(!!a.coverPhoto);
      if (cover) return cover;
      const done = Number(b.status === 'FUNDED') - Number(a.status === 'FUNDED');
      if (done) return done;
      return b.raisedAmount - a.raisedAmount;
    })
    .slice(0, 6);

  return (
    <>
      {/* HERO — ilustración + título + CTA (sin fondo) */}
      <section className="heroPlain heroSplit">
        <div className="heroArt">
          <HeroIllustration className="heroArtSvg" />
        </div>
        <div className="heroContent">
          <h1 className="heroTitle heroTitleDark">
            Convierte tu idea en una campaña que <span className="heroAccentBrand">crece</span>
          </h1>
          <div className="heroCtas">
            <a href={newCampaignLink()} className="btn btnGold btnLg">
              <Icon name="rocket" size={18} /> Iniciar campaña
            </a>
            <Link href="/donar" className="btn btnBrand btnLg">
              <Icon name="heart" size={18} /> Donar ahora
            </Link>
            <Link href="/reportar" className="btn btnGhost btnLg">
              <Icon name="megaphone" size={18} /> Reportar emergencia
            </Link>
          </div>
        </div>
      </section>

      {/* CAMPAÑAS ACTIVAS */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Apoya hoy</div>
            <h2 className="sectionTitle">Campañas activas</h2>
          </div>
          <Link href="/campanas" className="btn btnGhost">
            Ver todo <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {active.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            Aún no hay campañas activas.{' '}
            <a href={newCampaignLink()} style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
              Crea la primera.
            </a>
          </p>
        ) : (
          <div className="grid">
            {active.slice(0, 6).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* CÓMO CREAR (pasos, compacto) */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Paso a paso</div>
            <h2 className="sectionTitle">Cómo crear tu campaña</h2>
          </div>
        </div>
        <ol className="stepsRow">
          {GUIDE.map((step, i) => (
            <li key={i} className="stepCard">
              <span className="stepIcon">
                <Icon name={step.icon} size={22} />
                <span className="stepNum">{i + 1}</span>
              </span>
              <div className="stepTitle">{step.title}</div>
              <p className="stepBody">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* GALERÍA DE IMPACTO */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Resultados reales</div>
            <h2 className="sectionTitle">Galería de impacto</h2>
          </div>
        </div>
        {gallery.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Pronto verás aquí el impacto de las campañas.</p>
        ) : (
          <div className="galleryGrid">
            {gallery.map((c, i) => {
              const cat = CAMPAIGN_CATEGORY[c.category];
              const done = c.status === 'FUNDED' || c.progressPct >= 100;
              const cover = assetUrl(c.coverPhoto);
              return (
                <Link
                  key={c.id}
                  href={`/campanas/${c.slug}`}
                  className={`galleryTile ${i === 0 ? 'galleryTileWide' : ''}`}
                  style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                >
                  {!cover && (
                    <span className="galleryWatermark" aria-hidden="true">
                      <Icon name={cat.icon} size={64} strokeWidth={1.3} />
                    </span>
                  )}
                  <span className="galleryTileBadge">
                    {done ? (
                      <>
                        <Icon name="check" size={13} /> Meta alcanzada
                      </>
                    ) : (
                      <>
                        <Icon name={cat.icon} size={13} /> {cat.label}
                      </>
                    )}
                  </span>
                  <span className="galleryTileBody">
                    <strong>{c.title}</strong>
                    <span>{formatSoles(c.raisedAmount)} recaudados</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA FINAL */}
      <section className="ctaBand">
        <h2 className="ctaTitle">¿Tienes una idea que merece crecer?</h2>
        <p className="ctaSub">Crea tu campaña hoy. Es gratis y toma minutos.</p>
        <a href={newCampaignLink()} className="btn btnGold btnLg">
          <Icon name="rocket" size={18} /> Iniciar campaña
        </a>
      </section>
    </>
  );
}
