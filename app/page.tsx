import Link from 'next/link';
import { getCampaigns } from '@/lib/api';
import { newCampaignLink } from '@/lib/config';
import { formatSoles, formatNumber, CAMPAIGN_CATEGORY } from '@/lib/format';
import { coverFor, PHOTO } from '@/lib/covers';
import { CampaignCard } from '@/components/CampaignCard';
import { HeroStartCampaignCard } from '@/components/HeroStartCampaignCard';
import { Icon } from '@/components/Icon';
import { TraceSeal } from '@/components/ImpactMeters';
import type { Campaign } from '@/lib/types';

// Lo que muestra cada foto de la galería: el impacto más concreto que haya.
function galleryImpact(c: Campaign): string {
  const im = c.impact;
  if (im?.familiesServed) return `${formatNumber(im.familiesServed)} familias atendidas`;
  if (im?.goodsCollected) return `${formatNumber(im.goodsCollected)} insumos acopiados`;
  if (im?.volunteers) return `${formatNumber(im.volunteers)} voluntarios inscritos`;
  return `${formatSoles(c.raisedAmount)} recaudados`;
}

// Ciclo operativo de una iniciativa: la colecta es solo una parte.
const GUIDE = [
  { icon: 'rocket', title: 'Activa tu iniciativa o respuesta', body: 'Configura la causa social o emergencia en minutos.' },
  { icon: 'target', title: 'Define tus necesidades operativas', body: 'Especifica requerimientos monetarios, insumos/especies para almacén y perfiles de voluntariado necesarios.' },
  { icon: 'gift', title: 'Habilita centros de acopio y brigadas', body: 'Administra el inventario de bienes recibidos y asigna turnos de voluntariado en campo.' },
  { icon: 'megaphone', title: 'Moviliza a la comunidad', body: 'Comparte tu enlace oficial para transparencia e inscripción directa de apoyo.' },
  { icon: 'trendingUp', title: 'Mide la entrega y el despliegue', body: 'Registra la distribución de insumos y el impacto real en las comunidades.' },
  { icon: 'shieldCheck', title: 'Rinde cuentas de principio a fin', body: 'Genera reportes automáticos de trazabilidad para donantes y aliados.' },
];

// Modos de participación, con la foto de lo que realmente pasa con cada uno.
// El destino se arma con una iniciativa real: /donar sin destino rebota al listado.
const WAYS = [
  {
    photo: PHOTO.entrega,
    icon: 'coins',
    type: 'MONEY',
    title: 'Ayuda económica con rendición de cuentas',
    body: 'Transfiere directamente y sigue el destino exacto de cada sol registrado en la operación.',
    cta: 'Aportar fondos',
  },
  {
    photo: PHOTO.ollaComun,
    icon: 'gift',
    type: 'GOODS',
    title: 'Puntos de acopio e inventarios',
    body: 'Consulta la lista de insumos prioritarios (agua, alimentos, abrigo), elige un centro de acopio y sigue el ingreso de tu donación al inventario.',
    cta: 'Donar insumos',
  },
  {
    photo: PHOTO.limpieza,
    icon: 'users',
    type: 'TIME',
    title: 'Voluntariado y brigadas de campo',
    body: 'Únete a los turnos y brigadas activas según tu disponibilidad horaria.',
    cta: 'Sumarme como voluntario',
  },
];

// Render en cada request: las campañas del home salen al recargar.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const campaigns = (await getCampaigns()) ?? [];
  const active = campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'FUNDED');
  // Cifras reales de lo que hay publicado: nada inventado. El dinero es solo
  // una de las dimensiones; también se cuentan insumos, voluntarios y familias.
  const sum = (f: (c: (typeof campaigns)[number]) => number) => campaigns.reduce((t, c) => t + (f(c) || 0), 0);
  const totals = {
    campaigns: active.length,
    raised: sum((c) => c.raisedAmount),
    goods: sum((c) => c.impact?.goodsCollected ?? 0),
    volunteers: sum((c) => c.impact?.volunteers ?? 0),
    families: sum((c) => c.impact?.familiesServed ?? 0),
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
      {/* HERO — propuesta de valor: gestión integral, no solo colecta */}
      <section className="heroBand">
        <span
          className="heroBandPhoto"
          style={{ backgroundImage: `url(${PHOTO.huaico})` }}
          aria-hidden="true"
        />
        <div className="heroBandInner">
          <div className="heroCopy">
            <span className="heroEyebrow">
              <Icon name="sparkles" size={15} /> Gestión social y respuesta a emergencias
            </span>
            <h1 className="heroHeadline heroHeadlineLong">
              Coordina, gestiona y transparenta tu respuesta a <span className="hlGold">emergencias</span> e{' '}
              <span className="hlGold">iniciativas sociales</span>
            </h1>
            <p className="heroLead">
              Organiza brigadas de voluntariado, administra centros de acopio/almacenes y moviliza
              donaciones monetarias y en especie con trazabilidad punta a punta, sin necesidad de
              conocimientos técnicos.
            </p>
            <div className="heroActions">
              <a href="#iniciar" className="btn btnOrange btnLg">
                Lanzar iniciativa
              </a>
              <Link href="/campanas" className="heroPlay">
                <span className="heroPlayIcon">
                  <Icon name="play" size={18} />
                </span>
                Ver iniciativas activas
              </Link>
            </div>
            <div className="heroSecondary">
              <a href="#participar" className="heroJoin">
                <Icon name="handshake" size={16} /> Sumarme como voluntario o donante
              </a>
              <TraceSeal onDark />
            </div>
          </div>

          <HeroStartCampaignCard />
        </div>
      </section>

      {/* REPORTAR EMERGENCIA — acción inmediata, justo debajo del hero */}
      <section className="alertBanner" aria-labelledby="alertBannerTitle">
        <span className="alertBannerIcon" aria-hidden="true">
          <Icon name="alertTriangle" size={26} />
        </span>
        <div className="alertBannerBody">
          <h2 id="alertBannerTitle" className="alertBannerTitle">
            ¿Detectas una emergencia o necesidad comunitaria?
          </h2>
          <p className="alertBannerText">
            Reporta la situación en 1 minuto sin necesidad de crear cuenta. Conectamos tu alerta con
            las organizaciones y brigadas locales para canalizar inventario y auxilio inmediato.
          </p>
        </div>
        <div className="alertBannerActions">
          <Link href="/reportar" className="btn btnGold btnLg">
            <Icon name="alertTriangle" size={18} /> Reportar emergencia
          </Link>
          <Link href="/reportar/seguimiento" className="alertBannerLink">
            Ya tengo un código
          </Link>
        </div>
      </section>

      {/* CIFRAS REALES — en todas las dimensiones, no solo soles */}
      <section className="trustStrip trustStrip5" aria-label="Resumen de la plataforma">
        <div className="trustItem">
          <strong>{formatNumber(totals.campaigns)}</strong>
          <span>iniciativas activas</span>
        </div>
        <div className="trustItem">
          <strong>{formatNumber(totals.goods)}</strong>
          <span>insumos acopiados</span>
        </div>
        <div className="trustItem">
          <strong>{formatNumber(totals.volunteers)}</strong>
          <span>voluntarios inscritos</span>
        </div>
        <div className="trustItem">
          <strong>{formatNumber(totals.families)}</strong>
          <span>familias atendidas</span>
        </div>
        <div className="trustItem">
          <strong>{formatSoles(totals.raised)}</strong>
          <span>fondos con rendición de cuentas</span>
        </div>
      </section>

      {/* CAMPAÑAS ACTIVAS */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Apoya hoy</div>
            <h2 className="sectionTitle">Iniciativas activas</h2>
          </div>
          <Link href="/campanas" className="btn btnGhost">
            Ver todo <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {active.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            Aún no hay iniciativas activas.{' '}
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

      {/* MODOS DE PARTICIPACIÓN */}
      <section className="section" id="participar">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Modos de participación</div>
            <h2 className="sectionTitle">Tres formas de sumarte</h2>
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

      {/* CÓMO FUNCIONA (ciclo operativo para organizadores) */}
      <section className="section">
        <div className="sectionHead">
          <div>
            <div className="eyebrow">Para organizadores</div>
            <h2 className="sectionTitle">Cómo funciona: el ciclo operativo</h2>
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
          <p style={{ color: 'var(--text-muted)' }}>Pronto verás aquí el impacto de las iniciativas.</p>
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
                    <span>{galleryImpact(c)}</span>
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
          <h2 className="ctaTitle">¿Lideras una respuesta o iniciativa social?</h2>
          <p className="ctaSub">
            Lánzala hoy: fondos, acopio, voluntariado y rendición de cuentas en un solo lugar. Es
            gratis y toma minutos.
          </p>
          <a href={newCampaignLink()} className="btn btnGold btnLg">
            <Icon name="rocket" size={18} /> Lanzar iniciativa
          </a>
        </div>
      </section>
    </>
  );
}
