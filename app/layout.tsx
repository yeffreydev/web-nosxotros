import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NOSXOTROS — Crea tu campaña y hazla crecer',
    template: '%s · NOSXOTROS',
  },
  description:
    'Crea tu campaña, comparte tu causa y recibe aportes con trazabilidad total. Convierte tu idea en una campaña que crece.',
  keywords: [
    'campañas',
    'crowdfunding',
    'donaciones',
    'Arequipa',
    'recaudar fondos',
    'organizador de campañas',
    'NOSXOTROS',
  ],
  applicationName: 'NOSXOTROS',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'NOSXOTROS',
    url: SITE_URL,
    title: 'NOSXOTROS — Crea tu campaña y hazla crecer',
    description:
      'Lanza tu campaña, comparte tu causa y recibe aportes con trazabilidad total.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOSXOTROS — Crea tu campaña y hazla crecer',
    description: 'Convierte tu idea en una campaña que crece.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a2f1a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container">
            <div className="footerBrand">
              NOS<span>X</span>OTROS
            </div>
            <p>Respuesta social en tiempo real · Arequipa, Perú</p>
            <p>
              <Link href="/campanas">Campañas</Link> · © 2026 NOSXOTROS
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
