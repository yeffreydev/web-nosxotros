import type { CampaignCategory, CampaignStatus } from './types';

export function formatSoles(value?: number): string {
  if (value == null) return 'S/ 0';
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value?: number): string {
  if (value == null) return '0';
  return new Intl.NumberFormat('es-PE').format(value);
}

export function daysLeft(iso?: string): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

// icon = nombre del componente <Icon /> (SVG real, sin emojis)
export const CAMPAIGN_CATEGORY: Record<CampaignCategory, { label: string; icon: string }> = {
  HEALTH: { label: 'Salud', icon: 'activity' },
  EDUCATION: { label: 'Educación', icon: 'book' },
  ENVIRONMENT: { label: 'Medio ambiente', icon: 'leaf' },
  ENTREPRENEURSHIP: { label: 'Emprendimiento', icon: 'lightbulb' },
  COMMUNITY: { label: 'Comunidad', icon: 'users' },
  EMERGENCY: { label: 'Emergencia', icon: 'alertTriangle' },
  ANIMALS: { label: 'Animales', icon: 'paw' },
  CULTURE: { label: 'Cultura', icon: 'palette' },
  TECHNOLOGY: { label: 'Tecnología', icon: 'cpu' },
  SPORTS: { label: 'Deporte', icon: 'trophy' },
  OTHER: { label: 'Otro', icon: 'sparkles' },
};

export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; tone: string }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  ACTIVE: { label: 'Activa', tone: 'info' },
  PAUSED: { label: 'Pausada', tone: 'warn' },
  FUNDED: { label: 'Meta alcanzada', tone: 'success' },
  COMPLETED: { label: 'Completada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
};
