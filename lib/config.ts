// URLs centralizadas. Server: API_URL. Cliente: NEXT_PUBLIC_*.
// Backend NestJS en dev: puerto 3101 (backend/.env → PORT).
const LOCAL_API = 'http://localhost:3101/api';

// URL de la API usable desde el navegador (componentes cliente: donar, consultar, reportar).
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API;

// Fetch server-side (campañas, sitemap). API_URL permite apuntar a una red
// interna; si no está, se usa la misma API que el navegador. Sin ese fallback,
// en producción el servidor pegaba a localhost y la lista salía vacía.
export const API_URL = process.env.API_URL ?? PUBLIC_API_URL;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

// Enlaces de acción hacia el app PWA (acciones autenticadas).
export const appLink = (path = '') => `${APP_URL}${path}`;

// "Iniciar campaña": va directo a la config de campaña nueva. Si hay sesión
// (MANAGER/ADMIN) abre el formulario; si no, el app redirige a login/registro.
export const newCampaignLink = () => appLink('/organizador/nueva');

// Prellenado del hero: los datos del organizador y el borrador de la campaña
// viajan al registro del app; al terminar cae en /organizador/nueva con el
// título, la categoría y la meta ya cargados (o directo si ya hay sesión).
export type CampaignPrefill = {
  name?: string;
  email?: string;
  phone?: string;
  org?: string;
  ruc?: string;
  title?: string;
  category?: string;
  goal?: number;
};

export function startCampaignLink(prefill: CampaignPrefill = {}): string {
  const draft = new URLSearchParams();
  if (prefill.title) draft.set('title', prefill.title);
  if (prefill.category) draft.set('category', prefill.category);
  if (prefill.goal && prefill.goal > 0) draft.set('goal', String(prefill.goal));

  const next = draft.toString() ? `/organizador/nueva?${draft}` : '/organizador/nueva';

  const q = new URLSearchParams({ role: 'MANAGER', next });
  if (prefill.name) q.set('name', prefill.name);
  if (prefill.email) q.set('email', prefill.email);
  if (prefill.phone) q.set('phone', prefill.phone);
  if (prefill.org) q.set('org', prefill.org);
  if (prefill.ruc) q.set('ruc', prefill.ruc);

  return appLink(`/registro?${q.toString()}`);
}
