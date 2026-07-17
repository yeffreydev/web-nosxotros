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
