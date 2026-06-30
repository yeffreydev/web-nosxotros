import type { CSSProperties } from 'react';

// Iconos de línea (estilo Lucide, MIT). Heredan color con currentColor.
const PATHS: Record<string, string> = {
  sparkles: 'M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M18 6 6 18M6 6l12 12',
  heart:
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  trophy:
    'M6 9a6 6 0 0 0 12 0V4H6zM6 4H4a2 2 0 0 0 2 2M18 4h2a2 2 0 0 1-2 2M12 15v4M8 21h8M9.5 21a3 3 0 0 1 5 0',
  share2:
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  gift:
    'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  star: 'M12 2l3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.5 5.4 21l1.4-6.9L1.6 9.3l7-.8z',
  check: 'M20 6L9 17l-5-5',
  megaphone: 'M3 11l18-5v12L3 14zM3 11v3M11.6 16.8a3 3 0 1 1-5.6-1.8',
  userPlus:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6',
  penLine: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  image: 'M3 3h18v18H3zM21 15l-5-5L5 21M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  rocket:
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.9 12.9 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2zM15 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  trendingUp: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 22c1.5-5 5-9 9-11',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z',
  lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
  alertTriangle: 'M12 3 2 20h20zM12 9v4M12 17h.01',
  palette:
    'M12 22a10 10 0 1 1 10-10c0 2-2 3-4 3h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22zM8.5 9.5h.01M12 7h.01M15.5 9.5h.01',
  cpu: 'M6 6h12v12H6zM9 9h6v6H9zM9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  handshake: 'M11 17l2 2a1 1 0 0 0 3-3M14 14l2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-1.6 1.6a1 1 0 0 1-1.4 0l-1.9-1.9a1 1 0 0 0-1.4 0L3 13M16 16l-4.5-4.5',
  coins:
    'M9 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM18.1 10.4A6 6 0 1 1 10.3 18.2M7 4.5h1V9M16.7 12.4l.7.7-2.1 2.1',
  shieldCheck: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  paw: 'M12 13c2.5 0 4 1.9 4 3.6S14.5 21 12 21s-4-1.7-4-3.4S9.5 13 12 13zM6.5 11a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM17.5 11a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM9.5 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM14.5 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
};

export type IconName = keyof typeof PATHS | string;

export function Icon({
  name,
  size = 20,
  className,
  style,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const d = PATHS[name] ?? PATHS.sparkles;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={d} />
    </svg>
  );
}
