import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { formatSoles, formatNumber, CAMPAIGN_CATEGORY } from '@/lib/format';
import { coverFor, PHOTO } from '@/lib/covers';
import { CampaignCard } from '@/components/CampaignCard';
import { HeroStartCampaignCard } from '@/components/HeroStartCampaignCard';
import { Icon } from '@/components/Icon';

const GUIDE = [
  { icon: 'userPlus', title: 'Regístrate como organizador', body: 'Crea tu cuenta gratis y activa tu perfil.' },
  { icon: 'target', title: 'Define tu meta', body: 'Título claro, categoría y cuánto necesitas recaudar.' },
  { icon: 'penLine', title: 'Cuenta tu historia', body: 'Explica a quién ayudas y agrega una portada.' },
  { icon: 'megaphone', title: 'Publica y comparte', body: 'Difunde el enlace por WhatsApp y redes.' },
  { icon: 'bell', title: 'Publica avances', body: 'Mantén informados a tus donantes.' },
  { icon: 'trophy', title: 'Alcanza tu meta', body: 'Sigue el progreso con trazabilidad total.' },
];

// Las tres formas de aportar, con la foto de lo que realmente pasa con cada una.
// El destino se arma con una campaña real: /donar sin campaña rebota al listado.
const WAYS = [
  {
    photo: PHOTO.entrega,
    icon: 'heart',
    type: 'MONEY',
    title: 'Dona dinero',
    body: 'Transfieres por Yape o banco y el organizador acredita tu aporte. Sigues cada sol con tu código.',
    cta: 'Donar dinero',
  },
  {
    photo: PHOTO.ollaComun,
    icon: 'gift',
    type: 'GOODS',
    title: 'Dona en especie',
    body: 'Agua, frazadas, alimentos. Eliges el centro de acopio y tu entrega entra al inventario.',
    cta: 'Donar especies',
  },
  {
    photo: PHOTO.limpieza,
    icon: 'users',
    type: 'TIME',
    title: 'Dona tu tiempo',
    body: 'Dejas tus días y horas disponibles. La campaña te suma a sus brigadas y turnos.',
    cta: 'Ser voluntario',
  },
];

// Render en cada request: las campañas del home salen al recargar.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const campaigns = (await getCampaigns()) ?? [];
  const active = campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'FUNDED');
  // Cifras reales de lo que hay publicado: nada inventado en el hero.
  const totals = {
    campaigns: active.length,
    raised: campaigns.reduce((sum, c) => sum + (c.raisedAmount ?? 0), 0),
    backers: campaigns.reduce((sum, c) => sum + (c.backersCount ?? 0), 0),
    districts: new Set(campaigns.map((c) => c.district).filter(Boolean)).size,
  };
  // Aportar necesita una campaña destino; si no hay ninguna activa, al listado.
  const destino = active[0];
  const wayHref = (type: string) =>
    destino
      ? `/donar?campaignId=${destino.id}&campaign=${encodeURIComponent(destino.title)}&type=${type}`
      : '/campanas';

  // Galería de impacto = mosaico de imágenes de campañas (con portada primero, luego completadas).
  const gallery = [...campaigns]
    .sort((a, b) => {
      const cover = Number(!!b.coverPhoto) - Number(!!a.coverPhoto);
      if (cover) return cover;
      const done = Number(b.status === 'FUNDED') - Number(a.status === 'FUNDED');
      if (done) return done;
      return b.raisedAmount - a.raisedAmount;
    })
    .slice(0, 5);

  return (
    <>
      {/* HERO — foto real bajo la banda verde + tarjeta de inicio de campaña */}
      <section className="heroBand">
        <span
          className="heroBandPhoto"
          style={{ backgroundImage: `url(${PHOTO.huaico})` }}
          aria-hidden="true"
        />
        <div className="heroBandInner">
          <div className="heroCopy">
            <span className="heroKicker">
              Hagamos juntos
              <span className="heroSpark" aria-hidden="true">
                <Icon name="sparkles" size={30} strokeWidth={2.2} />
              </span>
            </span>
            <h1 className="heroHeadline">
              Un <span className="hlGold">Perú</span> que no deja a nadie <span className="hlGold">atrás</span>
            </h1>
            <p className="heroLead">
              Crea tu campaña, comparte tu causa y recibe aportes en dinero, especies o voluntariado.
              Cada aporte se sigue de principio a fin con trazabilidad total.
            </p>
            <div className="heroActions">
              <a href="#iniciar" className="btn btnOrange btnLg">
                Iniciar campaña
              </a>
              <Link href="/campanas" className="heroPlay">
                <span className="heroPlayIcon">
                  <Icon name="play" size={18} />
                </span>
                Ver campañas
              </Link>
            </div>
          </div>

          <HeroStartCampaignCard />
        </div>
      </section>

      {/* CIFRAS REALES */}
      <section className="trustStrip" aria-label="Resumen de la plataforma">
        <div className="trustItem">
          <strong>{formatNumber(totals.campaigns)}</strong>
          <span>campañas activas</span>
        </div>
        <div className="trustItem">
          <strong>{formatSoles(totals.raised)}</strong>
          <span>recaudados y acreditados</span>
        </div>
        <div className="trustItem">
          <strong>{formatNumber(totals.backers)}</strong>
          <span>aportes de donantes</span>
        </div>
        <div className="trustItem">
          <strong>{formatNumber(totals.districts || 1)}</strong>
          <span>distritos atendidos</span>
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

      {/* TRES FORMAS DE AYUDAR */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Puedes ayudar hoy</div>
            <h2 className="sectionTitle">Tres formas de aportar</h2>
          </div>
        </div>
        <div className="waysGrid">
          {WAYS.map((w) => (
            <Link key={w.title} href={wayHref(w.type)} className="wayCard">
              <span className="wayCardImg" style={{ backgroundImage: `url(${w.photo})` }} aria-hidden="true" />
              <span className="wayCardIcon">
                <Icon name={w.icon} size={20} />
              </span>
              <span className="wayCardBody">
                <strong>{w.title}</strong>
                <span className="wayCardText">{w.body}</span>
                <span className="wayCardCta">
                  {w.cta} <Icon name="arrowRight" size={15} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* REPORTAR EMERGENCIA */}
      <section className="photoBand">
        <span
          className="photoBandImg"
          style={{ backgroundImage: `url(${PHOTO.inundacion})` }}
          aria-hidden="true"
        />
        <div className="photoBandBody">
          <div className="eyebrow eyebrowLight">¿Estás viendo una emergencia?</div>
          <h2 className="photoBandTitle">Repórtala en un minuto, sin crear cuenta</h2>
          <p className="photoBandText">
            Cuéntanos qué pasó y dónde. El reporte llega a las organizaciones que responden en tu
            zona y recibes un código para seguir qué se hizo con él.
          </p>
          <div className="photoBandActions">
            <Link href="/reportar" className="btn btnGold btnLg">
              <Icon name="alertTriangle" size={18} /> Reportar emergencia
            </Link>
            <Link href="/reportar/seguimiento" className="btn btnGhostLight">
              Ya tengo un código
            </Link>
          </div>
        </div>
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
          <Link href="/campanas" className="btn btnGhost">
            Ver todas <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {gallery.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Pronto verás aquí el impacto de las campañas.</p>
        ) : (
          <div className="galleryGrid">
            {gallery.map((c, i) => {
              const cat = CAMPAIGN_CATEGORY[c.category];
              const done = c.status === 'FUNDED' || c.progressPct >= 100;
              const cover = coverFor(c);
              return (
                <Link
                  key={c.id}
                  href={`/campanas/${c.slug}`}
                  /* El mosaico solo tiene sentido con 5 fotos: con menos, la
                     tarjeta grande deja un hueco. */
                  className={`galleryTile ${i === 0 && gallery.length >= 5 ? 'galleryTileWide' : ''}`}
                  style={{ backgroundImage: `url(${cover.url})` }}
                >
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
        <span
          className="ctaBandImg"
          style={{ backgroundImage: `url(${PHOTO.arequipa})` }}
          aria-hidden="true"
        />
        <div className="ctaBandBody">
          <h2 className="ctaTitle">¿Tienes una idea que merece crecer?</h2>
          <p className="ctaSub">Crea tu campaña hoy. Es gratis y toma minutos.</p>
          <a href={newCampaignLink()} className="btn btnGold btnLg">
            <Icon name="rocket" size={18} /> Iniciar campaña
          </a>
        </div>
      </section>
    </>
  );
}
