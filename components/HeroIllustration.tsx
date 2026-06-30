// Ilustración propia (SVG) — crecimiento de una campaña: aporte → progreso → meta.
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 400"
      className={className}
      role="img"
      aria-label="Ilustración de una campaña creciendo: comunidad, aportes y meta alcanzada"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eafaea" />
          <stop offset="1" stopColor="#d6f3e2" />
        </linearGradient>
        <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2ea22c" />
          <stop offset="1" stopColor="#4fcb4b" />
        </linearGradient>
        <linearGradient id="barTall" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f7d20" />
          <stop offset="1" stopColor="#3cc139" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9cb2e" />
          <stop offset="1" stopColor="#f5b707" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f6fbf6" />
        </linearGradient>
      </defs>

      {/* Fondo */}
      <rect x="24" y="40" width="432" height="320" rx="40" fill="url(#bg)" />
      <circle cx="412" cy="92" r="46" fill="#ffffff" opacity="0.55" />
      <circle cx="70" cy="300" r="30" fill="#ffffff" opacity="0.5" />

      {/* Plataforma base */}
      <rect x="70" y="316" width="340" height="14" rx="7" fill="#bfe8c4" />

      {/* Barras crecientes */}
      <rect x="104" y="250" width="48" height="66" rx="10" fill="url(#bar)" />
      <rect x="170" y="208" width="48" height="108" rx="10" fill="url(#bar)" />
      <rect x="236" y="158" width="48" height="158" rx="10" fill="url(#barTall)" />

      {/* Flecha de crecimiento */}
      <path
        d="M118 244 L194 200 L260 150 L330 104"
        fill="none"
        stroke="#1f7d20"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path d="M306 100 L334 100 L334 128" fill="none" stroke="#1f7d20" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

      {/* Brote sobre la barra más alta */}
      <path d="M260 158 C260 138 260 126 260 118" stroke="#1f7d20" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M260 134 C246 130 236 118 238 104 C254 104 264 116 260 134 Z" fill="#4fcb4b" />
      <path d="M260 122 C274 118 286 106 284 92 C268 92 256 104 260 122 Z" fill="#3cc139" />

      {/* Tarjeta de campaña flotante */}
      <g transform="translate(300 188)">
        <rect x="0" y="0" width="150" height="92" rx="16" fill="url(#card)" stroke="#e4e8e3" />
        <rect x="16" y="16" width="64" height="10" rx="5" fill="#cdf2cd" />
        <rect x="16" y="34" width="100" height="8" rx="4" fill="#eef2ec" />
        {/* progreso */}
        <rect x="16" y="58" width="118" height="10" rx="5" fill="#eef2ec" />
        <rect x="16" y="58" width="86" height="10" rx="5" fill="url(#bar)" />
        <text x="16" y="84" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#1f7d20">
          73%
        </text>
      </g>

      {/* Monedas (aportes) */}
      <g transform="translate(96 150)">
        <ellipse cx="0" cy="44" rx="34" ry="11" fill="#d0b608" />
        <rect x="-34" y="30" width="68" height="14" fill="#d0b608" />
        <ellipse cx="0" cy="30" rx="34" ry="11" fill="url(#gold)" />
        <ellipse cx="0" cy="16" rx="34" ry="11" fill="#d0b608" />
        <rect x="-34" y="2" width="68" height="14" fill="#d0b608" />
        <ellipse cx="0" cy="2" rx="34" ry="11" fill="url(#gold)" />
        <text x="0" y="6" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="800" fill="#8a6a00">
          S/
        </text>
      </g>

      {/* Insignia de corazón (donantes) */}
      <g transform="translate(360 120)">
        <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#e4e8e3" />
        <path
          d="M0 12 C-9 4 -14 -2 -14 -8 A6 6 0 0 1 0 -10 A6 6 0 0 1 14 -8 C14 -2 9 4 0 12 Z"
          fill="#e23b3b"
        />
      </g>

      {/* Personas (comunidad) */}
      <g transform="translate(140 296)">
        <circle cx="0" cy="-2" r="11" fill="#1f7d20" />
        <path d="M-16 18 A16 16 0 0 1 16 18 Z" fill="#2ea22c" />
      </g>
      <g transform="translate(178 300)">
        <circle cx="0" cy="-2" r="9" fill="#f5b707" />
        <path d="M-13 16 A13 13 0 0 1 13 16 Z" fill="#f9cb2e" />
      </g>

      {/* Destellos */}
      <path d="M408 188 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill="url(#gold)" />
      <path d="M70 120 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z" fill="#f5b707" opacity="0.8" />
      <circle cx="430" cy="300" r="6" fill="#3cc139" opacity="0.6" />
      <circle cx="56" cy="200" r="5" fill="#f5b707" opacity="0.7" />
    </svg>
  );
}
