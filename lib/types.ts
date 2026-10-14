export type CampaignStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FUNDED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CampaignCategory =
  | 'HEALTH'
  | 'EDUCATION'
  | 'ENVIRONMENT'
  | 'ENTREPRENEURSHIP'
  | 'COMMUNITY'
  | 'EMERGENCY'
  | 'ANIMALS'
  | 'CULTURE'
  | 'TECHNOLOGY'
  | 'SPORTS'
  | 'OTHER';

export interface CampaignOrganizer {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  body: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CampaignRecentDonor {
  id: string;
  name: string;
  amount?: number;
  createdAt: string;
}

export interface CampaignImpact {
  /** Suma de metas en especie (unidades) y lo ya acopiado contra ellas. */
  goodsTarget: number;
  goodsCollected: number;
  volunteers: number;
  volunteerGoal?: number | null;
  familiesServed: number;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  category: CampaignCategory;
  status: CampaignStatus;
  coverPhoto?: string;
  /** Galería de portada (1 a 5). La primera = coverPhoto. */
  photos?: string[];
  goalAmount?: number | null;
  raisedAmount: number;
  volunteerSkills?: string[];
  /** Meta de voluntarios: cuántas personas necesita la campaña. */
  volunteerGoal?: number | null;
  currency: string;
  backersCount: number;
  progressPct: number;
  deadline?: string;
  district?: string;
  address?: string;
  mapUrl?: string;
  featured: boolean;
  /** Emergencia de origen: la iniciativa es una respuesta a emergencia. */
  emergencyId?: string | null;
  /** Avance operativo (no monetario): insumos, voluntarios, familias. */
  impact?: CampaignImpact;
  organizerId: string;
  organizer?: CampaignOrganizer;
  updates?: CampaignUpdate[];
  recentDonors?: CampaignRecentDonor[];
  createdAt: string;
}

/**
 * Metas de una campaña ya calculadas contra el almacén.
 *
 * Es lo que necesita el donante para decidir: "faltan 150 frazadas" dice mucho
 * más que un porcentaje de dinero. El progreso lo lleva el backend a partir de
 * lo que entra a los centros de acopio.
 */
export interface CampaignItemGoal {
  id: string;
  title: string;
  unit: string;
  targetQty: number;
  collectedQty: number;
  deliveredQty: number;
  remaining: number;
  pct: number;
  isBlocked: boolean;
  category?: { id: string; name: string; icon?: string | null } | null;
}

export interface CampaignGoals {
  money: { goal?: number | null; raised: number; currency: string; backers: number; pct: number };
  volunteers: { goal?: number | null; enrolled: number; availableToday: number; pct: number };
  items: CampaignItemGoal[];
  byCategory: {
    id: string | null;
    name: string;
    icon?: string | null;
    targetQty: number;
    collectedQty: number;
    pct: number;
  }[];
}

/** Centro de acopio: a dónde lleva el donante lo que da en especie. */
export interface Center {
  id: string;
  name: string;
  address?: string;
  reference?: string;
  openingHours?: string;
  contactPhone?: string;
  /** Enlace externo del mapa: el donante abre la ruta desde aquí. */
  mapUrl?: string;
  /** Foto del local: sirve para reconocerlo al llegar. */
  photoUrl?: string;
  /** Galería del local (1 a 5). La primera = photoUrl. */
  photos?: string[];
  status: 'OPEN' | 'NEAR_FULL' | 'FULL' | 'CLOSED';
  /** Almacén central que además acopia (el interno no llega al público). */
  isCentral?: boolean;
}

/** Zonas y centros de una campaña (lectura pública). */
export interface CampaignOperations {
  campaign: { id: string; slug: string; title: string };
  zones: { id: string; name: string; isPrimary?: boolean }[];
  centers: Center[];
}
