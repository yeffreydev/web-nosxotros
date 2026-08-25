import type { Metadata } from 'next';
import Link from 'next/link';
import creditos from '@/public/img/CREDITOS.json';

export const metadata: Metadata = {
  title: 'Créditos de las fotografías',
  description:
    'Autoría y licencia de cada fotografía usada en NOSXOTROS. Todas son de uso libre y se acreditan aquí.',
  alternates: { canonical: '/creditos' },
};

type Credito = {
  title: string;
  author?: string;
  license: string;
  source: string;
  query?: string;
};

// Las fotos con licencia CC BY obligan a nombrar autor y licencia; esta página
// es esa atribución, enlazada desde el pie de todas las páginas.
export default function CreditosPage() {
  const items = Object.entries(creditos as Record<string, Credito>).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="detailWrap" style={{ paddingTop: 24 }}>
      <Link href="/" className="backLink">
        ← Volver al inicio
      </Link>
      <h1 style={{ fontSize: '2rem', margin: '12px 0 8px' }}>Créditos de las fotografías</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
        Las imágenes de este sitio son fotografías reales de uso libre (dominio público, CC0 o
        Creative Commons con atribución). Aquí está la autoría y la licencia de cada una.
      </p>

      <div className="creditGrid">
        {items.map(([slug, c]) => (
          <article key={slug} className="creditCard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/img/${slug}.jpg`} alt={c.title} className="creditThumb" />
            <div className="creditBody">
              <strong>{c.title}</strong>
              {c.author && <span>{c.author}</span>}
              <span className="creditLicense">{c.license}</span>
              <a href={c.source} target="_blank" rel="noreferrer noopener" className="creditLink">
                Ver original
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
