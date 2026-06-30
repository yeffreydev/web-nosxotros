'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import {
  trackDonation,
  lookupDonations,
  type TrackedDonation,
  type DonationSummary,
} from '@/lib/clientApi';
import { formatSoles } from '@/lib/format';

const DONATION_STATUS: Record<string, string> = {
  PROMISED: 'Prometida',
  RECEIVED: 'Recibida en acopio',
  IN_TRANSIT: 'En camino',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

const TYPE_LABEL: Record<string, string> = {
  MONEY: 'Dinero',
  GOODS: 'Especies',
  TIME: 'Tiempo',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function amountOf(d: { type: string; amount?: number | null; quantity?: number | null; description?: string | null }) {
  if (d.type === 'MONEY') return formatSoles(d.amount ?? 0);
  if (d.type === 'GOODS') return `${d.quantity ?? 0} ${d.description ?? 'unidades'}`;
  return `${d.quantity ?? 0} horas`;
}

export function ConsultPanel({ initialCode }: { initialCode?: string }) {
  const [mode, setMode] = useState<'code' | 'email'>(initialCode ? 'code' : 'code');
  const [code, setCode] = useState(initialCode ?? '');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState<TrackedDonation | null>(null);
  const [list, setList] = useState<DonationSummary[] | null>(null);

  async function byCode(c: string) {
    setError('');
    setList(null);
    setLoading(true);
    try {
      setTracked(await trackDonation(c.trim()));
    } catch (e) {
      setTracked(null);
      setError(e instanceof Error ? e.message : 'No se encontró el código.');
    } finally {
      setLoading(false);
    }
  }

  async function byEmail() {
    setError('');
    setTracked(null);
    setLoading(true);
    try {
      const res = await lookupDonations(email.trim());
      setList(res);
      if (res.length === 0) setError('No se encontraron donaciones con ese correo.');
    } catch (e) {
      setList(null);
      setError(e instanceof Error ? e.message : 'No se pudo consultar.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) byCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div className="formWrap">
      <Link href="/" className="backLink">
        <Icon name="arrowRight" size={16} style={{ transform: 'rotate(180deg)' }} /> Volver
      </Link>

      <div className="formCard">
        <h1 className="formTitle">Consultar mi donación</h1>
        <p className="formLead">Sigue el recorrido de tu aporte con tu código o tu correo.</p>

        <div className="segmented" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <button
            type="button"
            className={`segItem ${mode === 'code' ? 'segItemActive' : ''}`}
            onClick={() => setMode('code')}
          >
            <Icon name="target" size={20} /> Por código
          </button>
          <button
            type="button"
            className={`segItem ${mode === 'email' ? 'segItemActive' : ''}`}
            onClick={() => setMode('email')}
          >
            <Icon name="heart" size={20} /> Por correo
          </button>
        </div>

        {mode === 'code' ? (
          <div className="field">
            <label className="label">Código de donación</label>
            <input
              className="control"
              placeholder="Ej. clx123abc…"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && code.trim() && byCode(code)}
            />
          </div>
        ) : (
          <div className="field">
            <label className="label">Correo con el que donaste</label>
            <input
              className="control"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && email.trim() && byEmail()}
            />
          </div>
        )}

        <button
          type="button"
          className={`btn btnBrand btnFull ${loading || (mode === 'code' ? !code.trim() : !email.trim()) ? 'btnDisabled' : ''}`}
          onClick={() => (mode === 'code' ? byCode(code) : byEmail())}
        >
          <Icon name="target" size={18} /> {loading ? 'Buscando…' : 'Consultar'}
        </button>

        {error && (
          <div className="formError" style={{ marginTop: 16, marginBottom: 0 }}>
            <Icon name="alertTriangle" size={18} /> <span>{error}</span>
          </div>
        )}
      </div>

      {/* Resultado por código: timeline */}
      {tracked && (
        <div className="formCard" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div>
              <div className="formTitle" style={{ fontSize: '1.2rem' }}>{amountOf(tracked)}</div>
              <p className="timelineMeta" style={{ margin: 0 }}>
                {TYPE_LABEL[tracked.type]} · {fmtDate(tracked.createdAt)}
              </p>
            </div>
            <span className="statusPill">{DONATION_STATUS[tracked.status] ?? tracked.status}</span>
          </div>
          {(tracked.emergency || tracked.campaign) && (
            <p className="timelineMeta" style={{ marginTop: 8 }}>
              Destino: <strong>{tracked.emergency?.title ?? tracked.campaign?.title}</strong>
            </p>
          )}
          <ul className="timeline">
            {tracked.events.map((ev) => (
              <li key={ev.id} className="timelineItem">
                <span className="timelineDot timelineDotDone" />
                <div className="timelineTitle">{ev.title}</div>
                {ev.note && <div className="timelineMeta">{ev.note}</div>}
                <div className="timelineMeta">{fmtDate(ev.createdAt)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resultado por correo: lista */}
      {list && list.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <ul className="summaryList">
            {list.map((d) => (
              <li key={d.id} className="summaryItem">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <strong>{amountOf(d)}</strong>
                  <span className="statusPill">{DONATION_STATUS[d.status] ?? d.status}</span>
                </div>
                <div className="timelineMeta">
                  {TYPE_LABEL[d.type]} · {fmtDate(d.createdAt)}
                  {(d.emergency || d.campaign) && <> · {d.emergency?.title ?? d.campaign?.title}</>}
                </div>
                <Link href={`/consultar?code=${encodeURIComponent(d.code)}`} className="metaInline" style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
                  Ver recorrido <Icon name="arrowRight" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
