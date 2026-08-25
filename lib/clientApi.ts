'use client';

// Cliente de API para el navegador (acciones públicas: donar, consultar, reportar).
// No requiere sesión: todos estos endpoints del backend son @Public().
import { PUBLIC_API_URL } from './config';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      const m = body?.message;
      message = Array.isArray(m) ? m.join(', ') : m ?? message;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

// ───────── Donaciones ─────────

export type DonationType = 'MONEY' | 'GOODS' | 'TIME';
export type PaymentMethod = 'YAPE' | 'PLIN' | 'CARD' | 'CASH' | 'IN_KIND';

// Espejo del enum VolunteerSkill del backend.
export type VolunteerSkill =
  | 'MEDIC'
  | 'LOGISTICS'
  | 'DRIVER'
  | 'COOK'
  | 'PSYCHOLOGY'
  | 'CONSTRUCTION'
  | 'COMMS'
  | 'GENERAL';

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface CreateDonationBody {
  type: DonationType;
  amount?: number;
  quantity?: number;
  description?: string;
  emergencyId?: string;
  campaignId?: string;
  centerId?: string;
  paymentMethod?: PaymentMethod;
  anonymous?: boolean;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  // Cuenta/celular desde el que el donante dice haber transferido (MONEY).
  donorAccountNumber?: string;
  // Prueba del abono (MONEY): al menos uno de los dos es obligatorio.
  operationNumber?: string;
  receiptUrl?: string;
  // Voluntariado (type = TIME) a una campaña: inscriben al donante en sus
  // voluntarios, para que el organizador pueda contactarlo y organizarlo.
  volunteerSkills?: VolunteerSkill[];
  volunteerDays?: Weekday[];
  volunteerStartTime?: string; // "08:00"
  volunteerEndTime?: string; // "13:00"
}

export interface DonationResult {
  id: string;
  code: string;
  type: DonationType;
  status: string;
  amount?: number | null;
  currency: string;
}

export function createDonation(body: CreateDonationBody): Promise<DonationResult> {
  return request<DonationResult>('/donations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Sube la captura del comprobante de una transferencia.
 *
 * Va por un endpoint público: el donante de la web no tiene cuenta. Devuelve la
 * URL absoluta que después viaja en la donación como `receiptUrl`.
 */
export async function uploadReceipt(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${PUBLIC_API_URL}/uploads/receipt`, { method: 'POST', body: form });
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export interface TraceEvent {
  id: string;
  status: string;
  title: string;
  note?: string | null;
  createdAt: string;
}

export interface TrackedDonation {
  id: string;
  code: string;
  type: DonationType;
  status: string;
  amount?: number | null;
  currency: string;
  description?: string | null;
  quantity?: number | null;
  anonymous: boolean;
  createdAt: string;
  events: TraceEvent[];
  emergency?: { id: string; title: string } | null;
  campaign?: { id: string; title: string; slug?: string } | null;
}

export function trackDonation(code: string): Promise<TrackedDonation> {
  return request<TrackedDonation>(`/donations/track/${encodeURIComponent(code)}`);
}

export interface DonationSummary {
  id: string;
  code: string;
  type: DonationType;
  status: string;
  amount?: number | null;
  currency: string;
  description?: string | null;
  quantity?: number | null;
  anonymous: boolean;
  createdAt: string;
  emergency?: { id: string; title: string } | null;
  campaign?: { id: string; title: string; slug?: string } | null;
  paymentStatus?: string | null;
}

export function lookupDonations(params: { email?: string; phone?: string }): Promise<DonationSummary[]> {
  const q = params.email
    ? `email=${encodeURIComponent(params.email)}`
    : `phone=${encodeURIComponent(params.phone ?? '')}`;
  return request<DonationSummary[]>(`/donations/lookup?${q}`);
}

// ───────── Emergencias (reporte anónimo) ─────────

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateReportBody {
  title: string;
  description: string;
  severity?: Severity;
  lat?: number;
  lng?: number;
  address?: string;
  district?: string;
  photoUrl?: string;
  reporterName?: string;
  reporterPhone?: string;
  anonymous?: boolean;
}

export interface ReportResult {
  id: string;
  code: string;
  status: string;
  createdAt: string;
}

export function createEmergencyReport(body: CreateReportBody): Promise<ReportResult> {
  return request<ReportResult>('/emergencies/report', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export interface TrackedReport {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: Severity;
  status: string;
  district?: string | null;
  address?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  emergency?: { id: string; title: string; status: string } | null;
}

export function trackEmergencyReport(code: string): Promise<TrackedReport> {
  return request<TrackedReport>(`/emergencies/report/${encodeURIComponent(code)}`);
}

// Emergencias activas (para elegir destino al donar). Endpoint público GET.
export interface EmergencyLite {
  id: string;
  title: string;
  status: string;
}

export function getActiveEmergencies(): Promise<EmergencyLite[]> {
  return request<EmergencyLite[]>('/emergencies?status=ACTIVE');
}

// Centros de acopio (para elegir destino al donar). Endpoint público GET.
// El backend devuelve la fila completa; aquí se tipan los campos que el
// donante necesita para llegar: dirección, referencia, teléfono, mapa y foto.
export interface CenterLite {
  id: string;
  name: string;
  address?: string | null;
  reference?: string | null;
  openingHours?: string | null;
  contactPhone?: string | null;
  mapUrl?: string | null;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: 'OPEN' | 'NEAR_FULL' | 'FULL' | 'CLOSED';
}

export function getCenters(): Promise<CenterLite[]> {
  return request<CenterLite[]>('/centers');
}

// Centros de acopio de una campaña concreta (público, vía /operations).
export function getCampaignCenters(idOrSlug: string): Promise<CenterLite[]> {
  return request<{ centers?: CenterLite[] }>(
    `/campaigns/${encodeURIComponent(idOrSlug)}/operations`,
  ).then((r) => r.centers ?? []);
}

// Datos de pago de una campaña (Yape / cuenta) — backend real, público.
export interface CampaignPayInfo {
  id: string;
  title: string;
  yapeNumber?: string | null;
  yapePhone?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  cci?: string | null;
  accountHolder?: string | null;
  qrImageUrl?: string | null;
}

export function getCampaignPayInfo(idOrSlug: string): Promise<CampaignPayInfo> {
  return request<CampaignPayInfo>(`/campaigns/${encodeURIComponent(idOrSlug)}`);
}
