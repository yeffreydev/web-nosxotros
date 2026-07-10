'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import {
  createDonation,
  confirmDonationPayment,
  getActiveEmergencies,
  getCenters,
  getCampaignPayInfo,
  type CreateDonationBody,
  type DonationType,
  type PaymentMethod,
  type EmergencyLite,
  type CenterLite,
  type CampaignPayInfo,
} from '@/lib/clientApi';
import { formatSoles } from '@/lib/format';
import { useT } from '@/lib/i18n';

const TYPE_KEY: Record<DonationType, string> = {
  MONEY: 'donate.money',
  GOODS: 'donate.goods',
  TIME: 'donate.voluntariado',
};

const TYPES: { value: DonationType; label: string; icon: string; hint: string }[] = [
  { value: 'MONEY', label: 'Dinero', icon: 'coins', hint: 'Aporte monetario' },
  { value: 'GOODS', label: 'Especies', icon: 'gift', hint: 'Bienes en especie' },
  { value: 'TIME', label: 'Voluntariado', icon: 'clock', hint: 'Horas de voluntariado' },
];

const AMOUNTS = [20, 50, 100, 200];

const VOL_SKILLS = [
  'Logística',
  'Salud / Médico',
  'Cocina',
  'Conductor',
  'Psicología',
  'Construcción',
  'Comunicaciones',
  'General',
];

// Datos de pago simulados (demo). Se muestran cuando la campaña no trae los suyos.
const SIM_PAY = {
  yapeNumber: '987 654 321',
  bankName: 'BCP',
  bankAccount: '191-2345678-0-12',
  accountHolder: 'NOSXOTROS ONG',
};

// QR simulado determinista a partir de un texto (sin dependencias externas).
function SimQr({ seed, size = 180 }: { seed: string; size?: number }) {
  const N = 25;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < N * N; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 31;
    h = Math.imul(h, 16777619) >>> 0;
    cells.push((h & 7) < 3);
  }
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7 &&
      (r === br || r === br + 6 || c === bc || c === bc + 6 || (r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4));
    return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
  };
  const clearFinder = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
  const px = size / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR de pago simulado">
      <rect width={size} height={size} fill="#fff" />
      {Array.from({ length: N * N }).map((_, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        const on = isFinder(r, c) || (!clearFinder(r, c) && cells[i]);
        if (!on) return null;
        return <rect key={i} x={c * px} y={r * px} width={px} height={px} fill="#111" />;
      })}
    </svg>
  );
}

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
  const t = useT();

  const [type, setType] = useState<DonationType>('MONEY');
  const [amount, setAmount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [emergencyId, setEmergencyId] = useState(presetEmergencyId ?? '');
  const [centerId, setCenterId] = useState('');
  // Pago simulado: siempre Yape (no se elige método en la web).
  const paymentMethod: PaymentMethod = 'YAPE';
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  // Voluntariado
  const [volSkill, setVolSkill] = useState('');
  const [volDays, setVolDays] = useState('');
  const [volHours, setVolHours] = useState('');

  const [emergencies, setEmergencies] = useState<EmergencyLite[]>([]);
  const [centers, setCenters] = useState<CenterLite[]>([]);
  const [payInfo, setPayInfo] = useState<CampaignPayInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    getCenters()
      .then(setCenters)
      .catch(() => setCenters([]));
    if (isCampaign) {
      if (campaignId) getCampaignPayInfo(campaignId).then(setPayInfo).catch(() => setPayInfo(null));
      return; // las campañas son el destino; no se elige emergencia
    }
    getActiveEmergencies()
      .then(setEmergencies)
      .catch(() => setEmergencies([]));
  }, [isCampaign, campaignId]);

  const detailsValid =
    type === 'MONEY'
      ? typeof amount === 'number' && amount > 0
      : type === 'GOODS'
        ? typeof quantity === 'number' && quantity > 0 && description.trim().length > 0
        : // Voluntariado: horas, teléfono, área y disponibilidad.
          typeof quantity === 'number' &&
          quantity > 0 &&
          donorPhone.trim().length >= 6 &&
          volSkill.trim().length > 0 &&
          (volDays.trim().length > 0 || volHours.trim().length > 0);

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      // En voluntariado, la descripción resume área + disponibilidad.
      const volDesc =
        type === 'TIME'
          ? [
              volSkill && `Área: ${volSkill}`,
              volDays && `Días: ${volDays}`,
              volHours && `Horario: ${volHours}`,
              description && `Nota: ${description}`,
            ]
              .filter(Boolean)
              .join(' · ')
          : description;

      const body: CreateDonationBody = {
        type,
        campaignId: campaignId || undefined,
        emergencyId: !isCampaign && emergencyId ? emergencyId : undefined,
        centerId: !isCampaign && centerId ? centerId : undefined,
        description: volDesc || undefined,
        donorPhone: donorPhone || undefined,
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

  // Se puede donar dinero, especies o voluntariado a una campaña.
  const effectiveTypes = TYPES;

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
              <Icon name="target" size={18} /> {t('donate.trackMine')}
            </Link>
            <Link href="/" className="btn btnGhost btnFull">
              {t('donate.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="formWrap">
      <Link href={isCampaign ? '/campanas' : '/'} className="backLink">
        <Icon name="arrowRight" size={16} style={{ transform: 'rotate(180deg)' }} /> {t('donate.back')}
      </Link>

      <div className="formCard">
        <h1 className="formTitle">{isCampaign ? t('donate.titleCampaign') : t('donate.titleGeneral')}</h1>
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
        <label className="label">{t('donate.type')}</label>
        <div className="segmented" style={{ gridTemplateColumns: `repeat(${effectiveTypes.length}, 1fr)` }}>
          {effectiveTypes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`segItem ${type === opt.value ? 'segItemActive' : ''}`}
              onClick={() => setType(opt.value)}
            >
              <Icon name={opt.icon} size={22} />
              {t(TYPE_KEY[opt.value])}
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
          <>
            <div className="fieldRow" style={{ marginBottom: 16 }}>
              <div>
                <label className="label">Área en la que ayudas</label>
                <select className="control" value={volSkill} onChange={(e) => setVolSkill(e.target.value)}>
                  <option value="">Elige un área…</option>
                  {VOL_SKILLS.map((sk) => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Horas por semana</label>
                <input
                  className="control"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
            <div className="fieldRow" style={{ marginBottom: 16 }}>
              <div>
                <label className="label">Días disponibles</label>
                <input
                  className="control"
                  placeholder="Ej. Lun, Mié, Sáb"
                  value={volDays}
                  onChange={(e) => setVolDays(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Horario disponible</label>
                <input
                  className="control"
                  placeholder="Ej. 9:00–13:00"
                  value={volHours}
                  onChange={(e) => setVolHours(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Teléfono (obligatorio)</label>
              <input
                className="control"
                type="tel"
                inputMode="tel"
                placeholder="987654321"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Comentario (opcional)</label>
              <input
                className="control"
                placeholder="Experiencia, movilidad propia, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Destino (solo donación general) */}
        {!isCampaign && (
          <>
            <div className="field">
              <label className="label">Destino (emergencia)</label>
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
            <div className="field">
              <label className="label">Centro de acopio (opcional)</label>
              <select
                className="control"
                value={centerId}
                onChange={(e) => setCenterId(e.target.value)}
              >
                <option value="">Sin preferencia</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.openingHours ? ` — ${c.openingHours}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Datos de pago (Yape / cuenta / QR). Usa los de la campaña o simulados. */}
        {type === 'MONEY' && (() => {
          const yape = payInfo?.yapeNumber || SIM_PAY.yapeNumber;
          const bankName = payInfo?.bankName || SIM_PAY.bankName;
          const bankAccount = payInfo?.bankAccount || SIM_PAY.bankAccount;
          const holder = payInfo?.accountHolder || SIM_PAY.accountHolder;
          const qrSeed = `${yape}|${bankAccount}|${amount || ''}`;
          return (
            <div className="payInfoBox" style={{ margin: '4px 0 16px', padding: 16, borderRadius: 12, background: 'var(--surface-2, #f4f6f5)', fontSize: 14, lineHeight: 1.7 }}>
              <strong>Paga con Yape / Plin o transferencia</strong>
              <div style={{ marginTop: 4 }}>Yape/Plin: <strong>{yape}</strong></div>
              <div>Cuenta: <strong>{bankName} {bankAccount}</strong></div>
              <div>Titular: {holder}</div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                {payInfo?.qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={payInfo.qrImageUrl} alt="QR de pago" style={{ width: 180, height: 180, objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'inline-block', padding: 8, background: '#fff', borderRadius: 12 }}>
                    <SimQr seed={qrSeed} />
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Escanea el QR con Yape/Plin{amount ? ` · ${formatSoles(Number(amount))}` : ''}
                </div>
              </div>
            </div>
          );
        })()}

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
          <Icon name="heart" size={18} /> {submitting ? t('donate.processing') : t('donate.confirm')}
        </button>
      </div>
    </div>
  );
}
