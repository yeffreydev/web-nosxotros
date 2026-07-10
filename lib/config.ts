// URLs centralizadas. Server: API_URL. Cliente: NEXT_PUBLIC_*.
export const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';
// URL de la API usable desde el navegador (componentes cliente: donar, consultar, reportar).
export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

// Enlaces de acción hacia el app PWA (acciones autenticadas).
export const appLink = (path = '') => `${APP_URL}${path}`;

// "Iniciar campaña": va directo a la config de campaña nueva. Si hay sesión
// (MANAGER/ADMIN) abre el formulario; si no, el app redirige a login/registro.
export const newCampaignLink = () => appLink('/organizador/nueva');
