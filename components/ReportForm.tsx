'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import {
  createEmergencyReport,
  type CreateReportBody,
  type Severity,
} from '@/lib/clientApi';

const SEVERITY: { value: Severity; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

export function ReportForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  const valid = title.trim().length > 2 && description.trim().length > 4;

  function getLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      const body: CreateReportBody = {
        title: title.trim(),
        description: description.trim(),
        severity,
        district: district || undefined,
        address: address || undefined,
        anonymous,
        reporterName: !anonymous ? reporterName || undefined : undefined,
        reporterPhone: !anonymous ? reporterPhone || undefined : undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      };
      const res = await createEmergencyReport(body);
      setCode(res.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar el reporte.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(code).catch(() => undefined);
  }

  if (code) {
    return (
      <div className="formWrap">
        <div className="resultCard">
          <span className="resultIcon">
            <Icon name="check" size={32} />
          </span>
          <h1 className="formTitle">Reporte enviado</h1>
          <p className="formLead">
            Gracias por avisar. Un gestor revisará tu reporte. Guarda el código para seguir su estado.
          </p>
          <div className="codeChip">
            {code}
            <button type="button" className="copyBtn" onClick={copyCode} aria-label="Copiar código">
              <Icon name="check" size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            <Link href={`/reportar/seguimiento?code=${encodeURIComponent(code)}`} className="btn btnBrand btnFull">
              <Icon name="target" size={18} /> Seguir mi reporte
            </Link>
            <Link href="/" className="btn btnGhost btnFull">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="formWrap">
      <Link href="/" className="backLink">
        <Icon name="arrowRight" size={16} style={{ transform: 'rotate(180deg)' }} /> Volver
      </Link>

      <div className="formCard">
        <h1 className="formTitle">Reportar una emergencia</h1>
        <p className="formLead">
          Avisa de forma anónima. No necesitas cuenta. Tu reporte llega a los gestores para su atención.
        </p>

        {error && (
          <div className="formError">
            <Icon name="alertTriangle" size={18} /> <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label className="label">¿Qué ocurre? *</label>
          <input
            className="control"
            placeholder="Ej. Inundación en el barrio…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Describe la situación *</label>
          <textarea
            className="control"
            placeholder="Cuéntanos qué pasa, cuánta gente está afectada y qué se necesita."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <label className="label">Gravedad</label>
        <div className="chipRow">
          {SEVERITY.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`chip ${severity === s.value ? 'chipActive' : ''}`}
              onClick={() => setSeverity(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="fieldRow" style={{ marginBottom: 16 }}>
          <div>
            <label className="label">Distrito</label>
            <input className="control" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div>
            <label className="label">Dirección / referencia</label>
            <input className="control" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        <button type="button" className="btn btnGhost btnFull" onClick={getLocation} style={{ marginBottom: 16 }}>
          <Icon name="mapPin" size={18} />
          {geoStatus === 'loading'
            ? 'Obteniendo ubicación…'
            : geoStatus === 'ok'
              ? 'Ubicación adjuntada ✓'
              : 'Usar mi ubicación actual'}
        </button>
        {geoStatus === 'error' && (
          <p className="timelineMeta" style={{ marginTop: -8, marginBottom: 16 }}>
            No se pudo obtener la ubicación. Puedes indicar el distrito y la dirección.
          </p>
        )}

        <label className="checkRow">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          Reportar de forma anónima
        </label>

        {!anonymous && (
          <div className="fieldRow" style={{ marginBottom: 16 }}>
            <div>
              <label className="label">Tu nombre</label>
              <input className="control" value={reporterName} onChange={(e) => setReporterName(e.target.value)} />
            </div>
            <div>
              <label className="label">Teléfono de contacto</label>
              <input className="control" value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)} />
            </div>
          </div>
        )}

        <div className="formNote">
          <Icon name="shieldCheck" size={18} />
          <span>Tu identidad se mantiene privada si reportas de forma anónima.</span>
        </div>

        <button
          type="button"
          className={`btn btnGold btnLg btnFull ${!valid || submitting ? 'btnDisabled' : ''}`}
          onClick={submit}
        >
          <Icon name="megaphone" size={18} /> {submitting ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  );
}
