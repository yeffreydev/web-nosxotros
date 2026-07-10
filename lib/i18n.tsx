'use client';

// i18n ligero para el sitio público Next (es, qu, en, ay).
// Provider + hook useT + selector. Las claves faltantes caen a español.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

export type Locale = 'es' | 'qu' | 'en' | 'ay';

export const LOCALES: { value: Locale; native: string }[] = [
  { value: 'es', native: 'Español' },
  { value: 'qu', native: 'Runa Simi' },
  { value: 'en', native: 'English' },
  { value: 'ay', native: 'Aymara' },
];

type Dict = Record<string, string>;

const es: Dict = {
  'nav.campaigns': 'Campañas',
  'nav.donate': 'Donar',
  'nav.myDonation': 'Mi donación',
  'nav.report': 'Reportar emergencia',
  'nav.startCampaign': 'Iniciar campaña',
  'nav.language': 'Idioma',

  'donate.titleCampaign': 'Apoyar esta campaña',
  'donate.titleGeneral': 'Hacer una donación',
  'donate.leadGeneral': 'Sin registrarte. Recibirás un código para seguir tu donación.',
  'donate.type': 'Tipo de donación',
  'donate.money': 'Dinero',
  'donate.goods': 'Especies',
  'donate.voluntariado': 'Voluntariado',
  'donate.amount': 'Monto',
  'donate.otherAmount': 'Otro monto (S/)',
  'donate.payMethod': 'Método de pago',
  'donate.quantity': 'Cantidad',
  'donate.whatDonate': '¿Qué donas?',
  'donate.hours': 'Horas de voluntariado',
  'donate.howHelp': '¿En qué puedes ayudar?',
  'donate.phoneRequired': 'Teléfono (obligatorio)',
  'donate.destEmergency': 'Destino (emergencia)',
  'donate.anyWhereNeeded': 'Donde más se necesite',
  'donate.centerOptional': 'Centro de acopio (opcional)',
  'donate.noPreference': 'Sin preferencia',
  'donate.payInfo': 'Datos de pago de la campaña',
  'donate.anonymous': 'Donar de forma anónima',
  'donate.nameOptional': 'Nombre (opcional)',
  'donate.emailOptional': 'Correo (opcional)',
  'donate.confirm': 'Confirmar donación',
  'donate.processing': 'Procesando…',
  'donate.back': 'Volver',
  'donate.thanks': '¡Gracias por tu aporte!',
  'donate.trackMine': 'Seguir mi donación',
  'donate.backHome': 'Volver al inicio',

  'consult.title': 'Consultar mi donación',
  'consult.lead': 'Sigue el recorrido de tu aporte con tu código, teléfono o correo.',
  'consult.byCode': 'Por código',
  'consult.byPhone': 'Por teléfono',
  'consult.byEmail': 'Por correo',
  'consult.code': 'Código de donación',
  'consult.phone': 'Teléfono con el que donaste',
  'consult.email': 'Correo con el que donaste',
  'consult.cta': 'Consultar',
  'consult.searching': 'Buscando…',
  'consult.destination': 'Destino',
  'consult.viewJourney': 'Ver recorrido',
};

const en: Dict = {
  'nav.campaigns': 'Campaigns',
  'nav.donate': 'Donate',
  'nav.myDonation': 'My donation',
  'nav.report': 'Report emergency',
  'nav.startCampaign': 'Start a campaign',
  'nav.language': 'Language',

  'donate.titleCampaign': 'Support this campaign',
  'donate.titleGeneral': 'Make a donation',
  'donate.leadGeneral': 'No sign-up. You will get a code to track your donation.',
  'donate.type': 'Donation type',
  'donate.money': 'Money',
  'donate.goods': 'Goods',
  'donate.voluntariado': 'Volunteering',
  'donate.amount': 'Amount',
  'donate.otherAmount': 'Other amount (S/)',
  'donate.payMethod': 'Payment method',
  'donate.quantity': 'Quantity',
  'donate.whatDonate': 'What are you donating?',
  'donate.hours': 'Volunteering hours',
  'donate.howHelp': 'How can you help?',
  'donate.phoneRequired': 'Phone (required)',
  'donate.destEmergency': 'Destination (emergency)',
  'donate.anyWhereNeeded': 'Where most needed',
  'donate.centerOptional': 'Collection center (optional)',
  'donate.noPreference': 'No preference',
  'donate.payInfo': "Campaign's payment details",
  'donate.anonymous': 'Donate anonymously',
  'donate.nameOptional': 'Name (optional)',
  'donate.emailOptional': 'Email (optional)',
  'donate.confirm': 'Confirm donation',
  'donate.processing': 'Processing…',
  'donate.back': 'Back',
  'donate.thanks': 'Thank you for your contribution!',
  'donate.trackMine': 'Track my donation',
  'donate.backHome': 'Back to home',

  'consult.title': 'Check my donation',
  'consult.lead': 'Follow your contribution with your code, phone or email.',
  'consult.byCode': 'By code',
  'consult.byPhone': 'By phone',
  'consult.byEmail': 'By email',
  'consult.code': 'Donation code',
  'consult.phone': 'Phone you donated with',
  'consult.email': 'Email you donated with',
  'consult.cta': 'Check',
  'consult.searching': 'Searching…',
  'consult.destination': 'Destination',
  'consult.viewJourney': 'View journey',
};

const qu: Dict = {
  'nav.campaigns': 'Campañakuna',
  'nav.donate': 'Quy',
  'nav.myDonation': 'Quyniy',
  'nav.report': 'Ñak’ariy willay',
  'nav.startCampaign': 'Campaña qallariy',
  'nav.language': 'Rimay',
  'donate.titleGeneral': 'Quyta ruray',
  'donate.money': 'Qullqi',
  'donate.goods': 'Imaymana',
  'donate.voluntariado': 'Yanapakuy',
  'donate.phoneRequired': 'Telefono (kananpuni)',
  'donate.confirm': 'Quyta arí niy',
  'donate.back': 'Kutiy',
  'consult.title': 'Quyniyta maskay',
  'consult.byCode': 'Codigowan',
  'consult.byPhone': 'Telefonowan',
  'consult.byEmail': 'Correowan',
  'consult.cta': 'Maskay',
};

const ay: Dict = {
  'nav.campaigns': 'Campañanaka',
  'nav.donate': 'Churaña',
  'nav.myDonation': 'Churäwija',
  'nav.report': 'Jankaki yatiyaña',
  'nav.startCampaign': 'Campaña qalltaña',
  'nav.language': 'Aru',
  'donate.titleGeneral': 'Mä churäwi luraña',
  'donate.money': 'Qullqi',
  'donate.goods': 'Yänaka',
  'donate.voluntariado': 'Yanapt’awi',
  'donate.phoneRequired': 'Telefono (wakisiwa)',
  'donate.confirm': 'Churäwi iyawsaña',
  'donate.back': 'Kutiña',
  'consult.title': 'Churäwija thaqhaña',
  'consult.byCode': 'Codigompi',
  'consult.byPhone': 'Telefonompi',
  'consult.byEmail': 'Correompi',
  'consult.cta': 'Thaqhaña',
};

const dicts: Record<Locale, Dict> = { es, qu, en, ay };
const LOCALE_KEY = 'nx_web_locale';

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    try {
      const v = localStorage.getItem(LOCALE_KEY) as Locale | null;
      if (v && dicts[v]) setLocaleState(v);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string) => dicts[locale][key] ?? es[key] ?? key,
    [locale],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback seguro si se usa fuera del provider: español.
    return { locale: 'es', setLocale: () => {}, t: (k) => es[k] ?? k };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

// Combobox de idioma propio (no <select> nativo). Diseño acorde al header.
export function LanguageSwitcher({ className, block }: { className?: string; block?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`langCombo ${block ? 'langComboBlock' : ''} ${className ?? ''}`}
    >
      <button
        type="button"
        className="langComboBtn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="globe" size={16} />
        <span className="langComboLabel">{current.native}</span>
        <Icon name="chevronDown" size={16} className={`langComboCaret ${open ? 'langComboCaretOpen' : ''}`} />
      </button>

      {open && (
        <ul className="langComboMenu" role="listbox" aria-label={t('nav.language')}>
          {LOCALES.map((l) => {
            const active = l.value === locale;
            return (
              <li key={l.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`langComboItem ${active ? 'langComboItemActive' : ''}`}
                  onClick={() => {
                    setLocale(l.value);
                    setOpen(false);
                  }}
                >
                  <span>{l.native}</span>
                  {active && <Icon name="check" size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
