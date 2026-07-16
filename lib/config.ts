// URLs centralizadas. Server: API_URL. Cliente: NEXT_PUBLIC_*.
// Backend NestJS en dev: puerto 3101 (backend/.env → PORT).
export const API_URL = process.env.API_URL ?? 'http://localhost:3101/api';
// URL de la API usable desde el navegador (componentes cliente: donar, consultar, reportar).
export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3101/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

// Secreto compartido con el backend para revalidar bajo demanda (POST /api/revalidate).
// Sin valor, ese endpoint responde 503 y las páginas se refrescan solo por ISR.
// Nunca lleva NEXT_PUBLIC_: es server-only, jamás debe llegar al navegador.
export const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? '';

// Enlaces de acción hacia el app PWA (acciones autenticadas).
export const appLink = (path = '') => `${APP_URL}${path}`;

// "Iniciar campaña": va directo a la config de campaña nueva. Si hay sesión
// (MANAGER/ADMIN) abre el formulario; si no, el app redirige a login/registro.
export const newCampaignLink = () => appLink('/organizador/nueva');
