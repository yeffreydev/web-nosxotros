'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import {
  createDonation,
  confirmDonationPayment,
  getActiveEmergencies,
  type CreateDonationBody,
  type DonationType,
  type PaymentMethod,
  type EmergencyLite,
} from '@/lib/clientApi';
import { formatSoles } from '@/lib/format';

const TYPES: { value: DonationType; label: string; icon: string; hint: string }[] = [
  { value: 'MONEY', label: 'Dinero', icon: 'coins', hint: 'Aporte monetario' },
  { value: 'GOODS', label: 'Especies', icon: 'gift', hint: 'Bienes en especie' },
  { value: 'TIME', label: 'Tiempo', icon: 'clock', hint: 'Horas de ayuda' },
];

const AMOUNTS = [20, 50, 100, 200];

const PAY: { value: PaymentMethod; label: string }[] = [
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'CARD', label: 'Tarjeta' },
];

export function DonateForm({
  campaignId,
  campaignTitle,
  emergencyId: presetEmergencyId,
}: {
  campaignId?: string;
  campaignTitle?: string;
  emergencyId?: string;
}) {
  const isCampaign = !!campaignId;

  const [type, setType] = useState<DonationType>('MONEY');
  const [amount, setAmount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [emergencyId, setEmergencyId] = useState(presetEmergencyId ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE');
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const [emergencies, setEmergencies] = useState<EmergencyLite[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (isCampaign) return; // las campañas son el destino; no se elige emergencia
    getActiveEmergencies()
      .then(setEmergencies)
      .catch(() => setEmergencies([]));
  }, [isCampaign]);

  const detailsValid =
    type === 'MONEY'
      ? typeof amount === 'number' && amount > 0
      : type === 'GOODS'
        ? typeof quantity === 'number' && quantity > 0 && description.trim().length > 0
        : typeof quantity === 'number' && quantity > 0;

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      const body: CreateDonationBody = {
        type,
        campaignId: campaignId || undefined,
        emergencyId: !isCampaign && emergencyId ? emergencyId : undefined,
        description: description || undefined,
        anonymous,
        donorName: !anonymous ? donorName || undefined : undefined,
        donorEmail: !anonymous ? donorEmail || undefined : undefined,
      };
      if (type === 'MONEY') {
        body.amount = typeof amount === 'number' ? amount : 0;
        body.paymentMethod = paymentMethod;
      } else {
        body.quantity = typeof quantity === 'number' ? quantity : 1;
        body.paymentMethod = 'IN_KIND';
      }
      const donation = await createDonation(body);
      if (type === 'MONEY') {
        await confirmDonationPayment(donation.id, 'WEB');
      }
      setCode(donation.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar la donación.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(code).catch(() => undefined);
  }

  // Campañas solo aceptan dinero
  const effectiveTypes = isCampaign ? TYPES.filter((t) => t.value === 'MONEY') : TYPES;

  if (code) {
    return (
      <div className="formWrap">
        <div className="resultCard">
          <span className="resultIcon">
            <Icon name="check" size={32} />
          </span>
          <h1 className="formTitle">¡Gracias por tu aporte!</h1>
          <p className="formLead">
            Guarda tu código para seguir el recorrido de tu donación con trazabilidad total.
          </p>
          <div className="codeChip">
            {code}
            <button type="button" className="copyBtn" onClick={copyCode} aria-label="Copiar código">
              <Icon name="check" size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            <Link href={`/consultar?code=${encodeURIComponent(code)}`} className="btn btnBrand btnFull">
              <Icon name="target" size={18} /> Seguir mi donación
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
      <Link href={isCampaign ? '/campanas' : '/'} className="backLink">
        <Icon name="arrowRight" size={16} style={{ transform: 'rotate(180deg)' }} /> Volver
      </Link>

      <div className="formCard">
        <h1 className="formTitle">{isCampaign ? 'Apoyar esta campaña' : 'Hacer una donación'}</h1>
        <p className="formLead">
          {isCampaign && campaignTitle
            ? `Tu aporte va directo a "${campaignTitle}". No necesitas iniciar sesión.`
            : 'Sin registrarte. Recibirás un código para seguir tu donación.'}
        </p>

        {error && (
          <div className="formError">
            <Icon name="alertTriangle" size={18} /> <span>{error}</span>
          </div>
        )}

        {/* Tipo */}
        <label className="label">Tipo de donación</label>
        <div className="segmented" style={{ gridTemplateColumns: `repeat(${effectiveTypes.length}, 1fr)` }}>
          {effectiveTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`segItem ${type === t.value ? 'segItemActive' : ''}`}
              onClick={() => setType(t.value)}
            >
              <Icon name={t.icon} size={22} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Detalle por tipo */}
        {type === 'MONEY' && (
          <>
            <label className="label">Monto</label>
            <div className="chipRow">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`chip ${amount === a ? 'chipActive' : ''}`}
                  onClick={() => setAmount(a)}
                >
                  {formatSoles(a)}
                </button>
              ))}
            </div>
            <div className="field">
              <input
                className="control"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Otro monto (S/)"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <label className="label">Método de pago</label>
            <div className="chipRow">
              {PAY.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`chip ${paymentMethod === p.value ? 'chipActive' : ''}`}
                  onClick={() => setPaymentMethod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        {type === 'GOODS' && (
          <div className="fieldRow" style={{ marginBottom: 16 }}>
            <div>
              <label className="label">Cantidad</label>
              <input
                className="control"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">¿Qué donas?</label>
              <input
                className="control"
                placeholder="Frazadas, agua, alimentos…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {type === 'TIME' && (
          <div className="fieldRow" style={{ marginBottom: 16 }}>
            <div>
              <label className="label">Horas</label>
              <input
                className="control"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">¿En qué puedes ayudar?</label>
              <input
                className="control"
                placeholder="Logística, cocina, traslados…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Destino (solo donación general) */}
        {!isCampaign && (
          <div className="field">
            <label className="label">Destino</label>
            <select
              className="control"
              value={emergencyId}
              onChange={(e) => setEmergencyId(e.target.value)}
            >
              <option value="">Donde más se necesite</option>
              {emergencies.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Donante */}
        <label className="checkRow">
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          Donar de forma anónima
        </label>

        {!anonymous && (
          <div className="fieldRow" style={{ marginBottom: 16 }}>
            <div>
              <label className="label">Nombre (opcional)</label>
              <input className="control" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
            </div>
            <div>
              <label className="label">Correo (opcional)</label>
              <input
                className="control"
                type="email"
                placeholder="Para consultar tus donaciones"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          className={`btn btnGold btnLg btnFull ${!detailsValid || submitting ? 'btnDisabled' : ''}`}
          onClick={submit}
        >
          <Icon name="heart" size={18} /> {submitting ? 'Procesando…' : 'Confirmar donación'}
        </button>
      </div>
    </div>
  );
}
