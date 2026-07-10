'use client';

import { useState } from 'react';
import Link from 'next/link';
import { newCampaignLink } from '@/lib/config';
import { Icon } from './Icon';
import { useT, LanguageSwitcher } from '@/lib/i18n';

const LINKS = [
  { href: '/campanas', key: 'nav.campaigns' },
  { href: '/consultar', key: 'nav.myDonation' },
  { href: '/reportar', key: 'nav.report' },
];

export function SiteHeader() {
  const t = useT();
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
              {t(l.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <a href={newCampaignLink()} className="btn btnGold">
            <Icon name="sparkles" size={16} /> {t('nav.startCampaign')}
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
                {t(l.key)}
                <Icon name="arrowRight" size={18} />
              </Link>
            ))}
            <div style={{ marginTop: 8 }}>
              <LanguageSwitcher block />
            </div>
            <a
              href={newCampaignLink()}
              className="btn btnGold btnFull"
              style={{ marginTop: 8 }}
              onClick={() => setOpen(false)}
            >
              <Icon name="sparkles" size={16} /> {t('nav.startCampaign')}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
