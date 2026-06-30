'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { trackEmergencyReport, type TrackedReport } from '@/lib/clientApi';

const REPORT_STATUS: Record<string, { label: string }> = {
  PENDING: { label: 'En revisión' },
  REVIEWED: { label: 'Revisado' },
  CONVERTED: { label: 'Emergencia activada' },
  REJECTED: { label: 'Descartado' },
};

const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
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

export function ReportTrack({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<TrackedReport | null>(null);

  async function lookup(c: string) {
    setError('');
    setLoading(true);
    try {
      setReport(await trackEmergencyReport(c.trim()));
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : 'No se encontró el reporte.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialCode) lookup(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div className="formWrap">
      <Link href="/reportar" className="backLink">
        <Icon name="arrowRight" size={16} style={{ transform: 'rotate(180deg)' }} /> Reportar otra emergencia
      </Link>

      <div className="formCard">
        <h1 className="formTitle">Seguir mi reporte</h1>
        <p className="formLead">Ingresa el código que recibiste al enviar tu reporte.</p>
        <div className="field">
          <input
            className="control"
            placeholder="Código del reporte"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && code.trim() && lookup(code)}
          />
        </div>
        <button
          type="button"
          className={`btn btnBrand btnFull ${loading || !code.trim() ? 'btnDisabled' : ''}`}
          onClick={() => lookup(code)}
        >
          <Icon name="target" size={18} /> {loading ? 'Buscando…' : 'Consultar'}
        </button>
        {error && (
          <div className="formError" style={{ marginTop: 16, marginBottom: 0 }}>
            <Icon name="alertTriangle" size={18} /> <span>{error}</span>
          </div>
        )}
      </div>

      {report && (
        <div className="formCard" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div className="formTitle" style={{ fontSize: '1.2rem' }}>{report.title}</div>
            <span className="statusPill">{REPORT_STATUS[report.status]?.label ?? report.status}</span>
          </div>
          <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}>{report.description}</p>
          <p className="timelineMeta">
            Gravedad: {SEVERITY_LABEL[report.severity] ?? report.severity}
            {report.district && <> · {report.district}</>} · Enviado {fmtDate(report.createdAt)}
          </p>
          {report.reviewNote && (
            <div className="formNote" style={{ marginTop: 12, marginBottom: 0 }}>
              <Icon name="megaphone" size={18} />
              <span>{report.reviewNote}</span>
            </div>
          )}
          {report.emergency && (
            <div className="formNote" style={{ marginTop: 12, marginBottom: 0 }}>
              <Icon name="alertTriangle" size={18} />
              <span>
                Se activó la emergencia <strong>{report.emergency.title}</strong>. ¡Gracias por reportar!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
