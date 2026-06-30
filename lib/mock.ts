import type { Campaign } from './types';

// ─────────────────────────────────────────────────────────────
// DATA MOCK — el sitio público funciona como maqueta (sin backend).
// Todas las campañas, la galería y las cifras salen de aquí.
// ─────────────────────────────────────────────────────────────

function pct(raised: number, goal?: number | null): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

interface MockSeed {
  slug: string;
  title: string;
  summary: string;
  story: string;
  category: Campaign['category'];
  status: Campaign['status'];
  goalAmount?: number | null;
  raisedAmount: number;
  backersCount: number;
  district?: string;
  deadline?: string;
  featured?: boolean;
  organizer: string;
  volunteerSkills?: string[];
}

const SEED: MockSeed[] = [
  {
    slug: 'agua-para-alto-selva-alegre',
    title: 'Agua potable para Alto Selva Alegre',
    summary: 'Instalemos tanques y filtros para 120 familias sin acceso a agua segura.',
    story:
      'En el asentamiento de Alto Selva Alegre, 120 familias caminan más de una hora cada día para conseguir agua. Con esta campaña instalaremos 6 tanques comunitarios y filtros domésticos, además de capacitar a las familias en su mantenimiento. Cada aporte se traduce en agua limpia, salud y tiempo recuperado para estudiar y trabajar.',
    category: 'COMMUNITY',
    status: 'ACTIVE',
    goalAmount: 45000,
    raisedAmount: 31200,
    backersCount: 284,
    district: 'Alto Selva Alegre',
    deadline: '2026-09-15',
    featured: true,
    organizer: 'Asociación Manantial',
    volunteerSkills: ['LOGISTICS', 'CONSTRUCTION', 'GENERAL'],
  },
  {
    slug: 'becas-talento-cayma',
    title: 'Becas de talento para jóvenes de Cayma',
    summary: '20 becas completas de educación técnica para jóvenes con vocación y sin recursos.',
    story:
      'Identificamos a 20 jóvenes con enorme talento que tuvieron que dejar de estudiar por falta de recursos. Esta beca cubre matrícula, materiales y transporte por un año en carreras técnicas con alta empleabilidad. Acompañamos a cada becado con mentoría hasta su primer empleo.',
    category: 'EDUCATION',
    status: 'ACTIVE',
    goalAmount: 60000,
    raisedAmount: 41800,
    backersCount: 512,
    district: 'Cayma',
    deadline: '2026-10-01',
    featured: true,
    organizer: 'Fundación Crecer',
  },
  {
    slug: 'reforestemos-el-misti',
    title: 'Reforestemos las faldas del Misti',
    summary: 'Plantemos 10 000 árboles nativos para frenar la erosión y recuperar el verde.',
    story:
      'Las faldas del volcán Misti pierden cobertura vegetal cada año. Con voluntarios y comunidades vecinas plantaremos 10 000 árboles nativos (queñua y molle), construiremos zanjas de infiltración y daremos seguimiento por dos años para asegurar que prendan.',
    category: 'ENVIRONMENT',
    status: 'ACTIVE',
    goalAmount: 30000,
    raisedAmount: 12450,
    backersCount: 198,
    district: 'Miraflores',
    deadline: '2026-08-20',
    organizer: 'Colectivo Verde AQP',
    volunteerSkills: ['GENERAL', 'LOGISTICS'],
  },
  {
    slug: 'taller-de-costura-mujeres',
    title: 'Taller de costura para mujeres emprendedoras',
    summary: 'Equipamiento y capital semilla para un taller que dará trabajo a 15 madres.',
    story:
      'Un grupo de 15 madres de familia quiere formalizar su taller de confección. Necesitan máquinas industriales, insumos y capacitación en gestión. Esta campaña les da el empujón para pasar de la informalidad a un negocio que sostiene a sus hogares.',
    category: 'ENTREPRENEURSHIP',
    status: 'ACTIVE',
    goalAmount: 25000,
    raisedAmount: 9300,
    backersCount: 121,
    district: 'Paucarpata',
    deadline: '2026-09-30',
    organizer: 'Red de Mujeres Productivas',
  },
  {
    slug: 'campana-invierno-frazadas',
    title: 'Campaña de invierno: abrigo para las alturas',
    summary: 'Frazadas y kits de abrigo para familias en zonas altoandinas frente a las heladas.',
    story:
      'Las heladas golpean con fuerza a las comunidades de mayor altura. Reunimos frazadas térmicas, ropa de abrigo y kits para recién nacidos. Cada kit protege a una familia durante toda la temporada de friaje.',
    category: 'EMERGENCY',
    status: 'ACTIVE',
    goalAmount: 40000,
    raisedAmount: 27600,
    backersCount: 433,
    district: 'Yura',
    deadline: '2026-07-31',
    featured: true,
    organizer: 'Brigada Solidaria AQP',
    volunteerSkills: ['LOGISTICS', 'DRIVER', 'GENERAL'],
  },
  {
    slug: 'refugio-animal-patitas',
    title: 'Refugio Patitas: techo y comida para 80 rescatados',
    summary: 'Ampliemos el refugio y aseguremos alimento y atención veterinaria por 6 meses.',
    story:
      'El refugio Patitas acoge a 80 perros y gatos rescatados. Con esta campaña ampliaremos los espacios, compraremos alimento para seis meses y cubriremos esterilizaciones y vacunas. Ayúdanos a que cada rescatado encuentre un hogar.',
    category: 'ANIMALS',
    status: 'ACTIVE',
    goalAmount: 18000,
    raisedAmount: 15900,
    backersCount: 276,
    district: 'Sachaca',
    deadline: '2026-08-10',
    organizer: 'Refugio Patitas',
  },
  {
    slug: 'orquesta-juvenil-barrio',
    title: 'Una orquesta juvenil para el barrio',
    summary: 'Instrumentos y clases gratuitas de música para 40 niños y adolescentes.',
    story:
      'La música transforma vidas. Queremos formar una orquesta juvenil con 40 niños y adolescentes del barrio: compraremos instrumentos, pagaremos profesores y daremos clases gratuitas durante un año, cerrando con un gran concierto comunitario.',
    category: 'CULTURE',
    status: 'FUNDED',
    goalAmount: 35000,
    raisedAmount: 36400,
    backersCount: 601,
    district: 'Cercado',
    organizer: 'Casa Cultural Armonía',
  },
  {
    slug: 'laboratorio-tech-colegio',
    title: 'Laboratorio de tecnología para un colegio público',
    summary: 'Computadoras y robótica para que 300 estudiantes aprendan a programar.',
    story:
      'Un colegio público con muchas ganas y pocos recursos quiere abrir su primer laboratorio de tecnología. Con computadoras, kits de robótica e internet, 300 estudiantes podrán aprender programación y pensamiento computacional.',
    category: 'TECHNOLOGY',
    status: 'FUNDED',
    goalAmount: 50000,
    raisedAmount: 51200,
    backersCount: 744,
    district: 'José Luis Bustamante y Rivero',
    organizer: 'AMPA Innova',
  },
  {
    slug: 'cancha-deportiva-comunitaria',
    title: 'Cancha deportiva para la juventud',
    summary: 'Recuperemos un terreno baldío y hagamos una cancha multideporte segura.',
    story:
      'Un terreno baldío se ha vuelto foco de inseguridad. La comunidad quiere convertirlo en una cancha multideporte con iluminación, para que niños y jóvenes tengan un espacio sano donde jugar. ¡Súmate a recuperar el espacio público!',
    category: 'SPORTS',
    status: 'ACTIVE',
    goalAmount: 28000,
    raisedAmount: 6100,
    backersCount: 88,
    district: 'Mariano Melgar',
    deadline: '2026-11-15',
    organizer: 'Junta Vecinal Unidos',
    volunteerSkills: ['CONSTRUCTION', 'GENERAL'],
  },
  {
    slug: 'comedor-popular-san-martin',
    title: 'Comedor popular San Martín: 200 platos al día',
    summary: 'Aseguremos insumos y una cocina equipada para servir 200 almuerzos diarios.',
    story:
      'El comedor San Martín alimenta a 200 personas cada día, muchas de ellas adultos mayores. Necesitamos equipar la cocina y asegurar insumos por tres meses para no parar el servicio. Tu aporte es comida caliente en la mesa de quien más lo necesita.',
    category: 'HEALTH',
    status: 'ACTIVE',
    goalAmount: 22000,
    raisedAmount: 18750,
    backersCount: 329,
    district: 'Miraflores',
    deadline: '2026-08-05',
    organizer: 'Comedor San Martín',
  },
];

// Fotos reales por tema (loremflickr sirve imágenes reales de Flickr).
// lock = imagen estable por campaña (no cambia entre recargas).
const IMG_KEYWORDS = [
  'water,community',
  'students,classroom',
  'forest,reforestation',
  'sewing,workshop',
  'winter,blanket',
  'dog,shelter',
  'orchestra,children',
  'computer,classroom',
  'football,court',
  'soup,kitchen',
];

const coverFor = (i: number) =>
  `https://loremflickr.com/800/600/${IMG_KEYWORDS[i] ?? 'community'}?lock=${i + 1}`;

const MOCK_UPDATES = [
  {
    id: 'u1',
    title: '¡Llegamos al 50% de la meta!',
    body: 'Gracias a 200 donantes alcanzamos la mitad del objetivo. Ya iniciamos las primeras compras.',
    createdAt: '2026-06-10T12:00:00.000Z',
  },
  {
    id: 'u2',
    title: 'Primeras entregas en marcha',
    body: 'Esta semana coordinamos con la comunidad la logística de la primera entrega. Pronto compartiremos fotos.',
    createdAt: '2026-06-20T12:00:00.000Z',
  },
];

const MOCK_DONORS = [
  { id: 'd1', name: 'María Q.', amount: 200, createdAt: '2026-06-25T10:00:00.000Z' },
  { id: 'd2', name: 'Anónimo', amount: 50, createdAt: '2026-06-24T18:30:00.000Z' },
  { id: 'd3', name: 'José L.', amount: 100, createdAt: '2026-06-23T09:15:00.000Z' },
  { id: 'd4', name: 'Carla P.', amount: 500, createdAt: '2026-06-22T20:45:00.000Z' },
];

export const MOCK_CAMPAIGNS: Campaign[] = SEED.map((c, i) => ({
  id: `mock-${i + 1}`,
  slug: c.slug,
  title: c.title,
  summary: c.summary,
  story: c.story,
  category: c.category,
  status: c.status,
  coverPhoto: coverFor(i),
  goalAmount: c.goalAmount,
  raisedAmount: c.raisedAmount,
  volunteerSkills: c.volunteerSkills ?? [],
  currency: 'PEN',
  backersCount: c.backersCount,
  progressPct: pct(c.raisedAmount, c.goalAmount),
  deadline: c.deadline,
  district: c.district,
  featured: c.featured ?? false,
  organizerId: `org-${i + 1}`,
  organizer: { id: `org-${i + 1}`, fullName: c.organizer },
  updates: MOCK_UPDATES,
  recentDonors: MOCK_DONORS,
  createdAt: '2026-05-01T12:00:00.000Z',
}));

// Cifras de impacto mock para la home.
export const MOCK_STATS = {
  totalRaised: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.raisedAmount, 0),
  donationsCount: MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.backersCount, 0),
  campaignsCount: MOCK_CAMPAIGNS.length,
  volunteersCount: 1240,
};
