import Link from 'next/link';
import { appLink } from '@/lib/config';
import { Icon } from './Icon';

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <div className="container siteHeaderInner">
        <Link href="/" aria-label="NOSXOTROS inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nosxotros_logo_white.svg" alt="NOSXOTROS" className="siteLogo" />
        </Link>
        <nav className="headerNav" aria-label="Principal">
          <Link href="/campanas">Campañas</Link>
          <Link href="/donar">Donar</Link>
          <Link href="/consultar">Mi donación</Link>
          <Link href="/reportar">Reportar emergencia</Link>
          <a href={appLink('/registro?role=MANAGER')} className="btn btnGold">
            <Icon name="sparkles" size={16} /> Iniciar campaña
          </a>
        </nav>
      </div>
    </header>
  );
}
