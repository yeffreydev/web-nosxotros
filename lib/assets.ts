import { PUBLIC_API_URL } from './config';

// Resuelve la URL de una imagen subida al backend.
//
// El backend guarda URLs absolutas hechas con PUBLIC_BASE_URL. Si esa variable
// no estaba definida al subir, la URL queda clavada a localhost: la imagen no
// carga para nadie más y, peor aún, WhatsApp y Google tampoco pueden leer la
// portada al compartir la campaña. La ruta /uploads/<archivo> sí es estable, así
// que se vuelve a basar contra la API configurada.

const UPLOAD_PREFIX = '/uploads/';

const API_ORIGIN = (() => {
  try {
    return new URL(PUBLIC_API_URL).origin;
  } catch {
    return '';
  }
})();

function isLocalHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

export function assetUrl(url?: string | null): string {
  if (!url) return '';

  // Ruta relativa del backend → prefijar con el origen de la API.
  if (url.startsWith(UPLOAD_PREFIX)) return `${API_ORIGIN}${url}`;

  if (!/^https?:\/\//i.test(url)) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  // Absoluta a localhost y con nuestra ruta de subidas: se guardó con la base
  // equivocada. Se rebasa contra la API real.
  if (parsed.pathname.startsWith(UPLOAD_PREFIX) && isLocalHost(parsed.hostname)) {
    return `${API_ORIGIN}${parsed.pathname}`;
  }

  return url;
}
