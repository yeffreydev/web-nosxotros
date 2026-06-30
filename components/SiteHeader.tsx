'use client';

import { useState } from 'react';
import Link from 'next/link';
import { appLink } from '@/lib/config';
import { Icon } from './Icon';

const LINKS = [
  { href: '/campanas', label: 'Campañas' },
  { href: '/donar', label: 'Donar' },
  { href: '/consultar', label: 'Mi donación' },
  { href: '/reportar', label: 'Reportar emergencia' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="siteHeader">
      <div className="container siteHeaderInner">
        <Link href="/" aria-label="NOSXOTROS inicio" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nosxotros_logo_white.svg" alt="NOSXOTROS" className="siteLogo" />
        </Link>

        {/* Navegación escritorio */}
        <nav className="headerNav headerNavDesktop" aria-label="Principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <a href={appLink('/registro?role=MANAGER')} className="btn btnGold">
            <Icon name="sparkles" size={16} /> Iniciar campaña
          </a>
        </nav>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          className="navToggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>
      </div>

      {/* Panel móvil */}
      {open && (
        <div className="mobileMenu" id="mobile-menu">
          <nav className="mobileMenuInner container" aria-label="Móvil">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="mobileMenuLink" onClick={() => setOpen(false)}>
                {l.label}
                <Icon name="arrowRight" size={18} />
              </Link>
            ))}
            <a
              href={appLink('/registro?role=MANAGER')}
              className="btn btnGold btnFull"
              style={{ marginTop: 8 }}
              onClick={() => setOpen(false)}
            >
              <Icon name="sparkles" size={16} /> Iniciar campaña
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
