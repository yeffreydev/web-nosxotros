import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CAMPAIGNS_TAG, campaignTag } from '@/lib/api';
import { REVALIDATE_SECRET } from '@/lib/config';

// Revalidación bajo demanda: el backend llama aquí al crear/editar/publicar una
// campaña y la página pública se refresca al instante, sin esperar los 60 s de
// ISR. El ISR sigue como red de seguridad si esta llamada se pierde.
//
// POST /api/revalidate
//   header: x-revalidate-secret: <REVALIDATE_SECRET>
//   body:   { "slug": "mi-campana" }   // slug opcional
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Sin secreto configurado el endpoint queda cerrado: si estuviera abierto,
  // cualquiera podría forzar revalidaciones y tumbar la caché a pedido.
  if (!REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, error: 'Revalidación no configurada' }, { status: 503 });
  }
  if (request.headers.get('x-revalidate-secret') !== REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, error: 'Secreto inválido' }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = (await request.json()) as { slug?: unknown };
    if (typeof body?.slug === 'string' && body.slug.trim()) slug = body.slug.trim();
  } catch {
    // Sin cuerpo: se revalidan solo las listas.
  }

  // Primero los datos: revalidatePath solo re-renderiza, y sin tirar el fetch
  // cacheado la página se regeneraría con los mismos datos viejos.
  revalidateTag(CAMPAIGNS_TAG);
  if (slug) revalidateTag(campaignTag(slug));

  const paths = ['/', '/campanas', '/sitemap.xml'];
  if (slug) paths.push(`/campanas/${slug}`);
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, paths });
}
