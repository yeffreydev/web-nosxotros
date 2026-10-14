import type { Metadata, Viewport } from 'next';
import './globals.css';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { I18nProvider } from '@/lib/i18n';
import { SITE_URL } from '@/lib/config';

const TITLE = 'NOSXOTROS — Gestión de iniciativas sociales y emergencias';
const DESC =
  'Coordina, gestiona y transparenta tu respuesta a emergencias e iniciativas sociales: brigadas de voluntariado, centros de acopio y donaciones con trazabilidad punta a punta.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · NOSXOTROS',
  },
  description: DESC,
  keywords: [
    'iniciativas sociales',
    'respuesta a emergencias',
    'centros de acopio',
    'voluntariado',
    'brigadas',
    'donaciones',
    'trazabilidad',
    'Perú',
    'NOSXOTROS',
  ],
  applicationName: 'NOSXOTROS',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'NOSXOTROS',
    url: SITE_URL,
    title: TITLE,
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
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
        <I18nProvider>
        <div className="topTagline">
          <div className="container">
            Plataforma de gestión integral, logística y transparencia para iniciativas sociales y emergencias
          </div>
        </div>
        <SiteHeader />
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container">
            <div className="footerBrand">
              NOS<span>X</span>OTROS
            </div>
            <p>Gestión integral, logística y transparencia para iniciativas sociales y emergencias · Perú</p>
            <p>
              <Link href="/campanas">Iniciativas</Link> · <Link href="/creditos">Créditos de fotos</Link> ·{' '}
              © 2026 NOSXOTROS
            </p>
          </div>
        </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
