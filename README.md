# NOSXOTROS — Sitio público (Next.js)

Sitio **público con SEO** (SSR/SSG) para las campañas de crecimiento. Renderiza en servidor el home, el listado y el detalle de cada campaña con metadata dinámica (title, description, Open Graph, Twitter Card, JSON-LD) + `sitemap.xml` y `robots.txt`.

El **app PWA** (autenticado: crear campaña, donar, paneles) sigue en `../frontend` (Vite). Este sitio enlaza a él para las acciones.

## Arquitectura

| Pieza | Stack | Rol |
|-------|-------|-----|
| `web/` (este) | Next.js 14 App Router | Páginas públicas indexables (SEO) |
| `../frontend` | React + Vite (PWA) | App autenticado / acciones |
| `../backend` | NestJS + Prisma | API REST |

## Páginas

- `/` — home (hero, guía paso a paso, galería de campañas, CTA)
- `/campanas` — listado de campañas
- `/campanas/[slug]` — detalle con `generateMetadata` (OG dinámico) + JSON-LD
- `/sitemap.xml`, `/robots.txt`

## Configuración

Copia `.env.example` → `.env.local`:

```
API_URL=http://localhost:3000/api          # backend NestJS (fetch server-side)
NEXT_PUBLIC_SITE_URL=http://localhost:3001  # URL pública de este sitio (canonical/OG/sitemap)
NEXT_PUBLIC_APP_URL=http://localhost:5173   # app PWA donde se realizan acciones
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3001
```

Requiere el backend corriendo en `:3000` para datos reales (si no, las páginas cargan vacías sin romper).

## Producción

```bash
npm run build && npm run start   # :3001
```

Las páginas usan ISR (`revalidate: 60`): se regeneran en segundo plano para mantener SEO + frescura.
