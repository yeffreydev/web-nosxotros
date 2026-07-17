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
  type VolunteerSkill,
  type Weekday,
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

// Habilidades tal como las entiende el backend (enum VolunteerSkill). Antes se
// mandaba la etiqueta en español dentro del texto libre y el organizador no podía
// filtrar por área.
const VOL_SKILLS: { value: VolunteerSkill; label: string }[] = [
  { value: 'LOGISTICS', label: 'Logística' },
  { value: 'MEDIC', label: 'Salud / Médico' },
  { value: 'COOK', label: 'Cocina' },
  { value: 'DRIVER', label: 'Conductor' },
  { value: 'PSYCHOLOGY', label: 'Psicología' },
  { value: 'CONSTRUCTION', label: 'Construcción' },
  { value: 'COMMS', label: 'Comunicaciones' },
  { value: 'GENERAL', label: 'General' },
];

// Semana peruana: arranca en lunes.
const VOL_DAYS: { value: Weekday; short: string; label: string }[] = [
  { value: 'MON', short: 'L', label: 'Lunes' },
  { value: 'TUE', short: 'M', label: 'Martes' },
  { value: 'WED', short: 'M', label: 'Miércoles' },
  { value: 'THU', short: 'J', label: 'Jueves' },
  { value: 'FRI', short: 'V', label: 'Viernes' },
  { value: 'SAT', short: 'S', label: 'Sábado' },
  { value: 'SUN', short: 'D', label: 'Domingo' },
];

// Medias horas de 05:00 a 22:00: cubre la jornada real sin volverse una lista infinita.
const TIME_OPTIONS = Array.from({ length: (22 - 5) * 2 + 1 }, (_, i) => {
  const minutes = 5 * 60 + i * 30;
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
});

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
  const [volSkills, setVolSkills] = useState<VolunteerSkill[]>([]);
  const [volDays, setVolDays] = useState<Weekday[]>([]);
  const [volStart, setVolStart] = useState('08:00');
  const [volEnd, setVolEnd] = useState('13:00');

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

  // El horario debe avanzar: "de 14:00 a 09:00" no significa nada.
  const rangeValid = volStart < volEnd;

  const detailsValid =
    type === 'MONEY'
      ? typeof amount === 'number' && amount > 0
      : type === 'GOODS'
        ? typeof quantity === 'number' && quantity > 0 && description.trim().length > 0
        : // Voluntariado: horas, teléfono, área y disponibilidad.
          typeof quantity === 'number' &&
          quantity > 0 &&
          donorPhone.trim().length >= 6 &&
          donorName.trim().length > 0 &&
          volSkills.length > 0 &&
          volDays.length > 0 &&
          rangeValid;

  // Lo primero que falta para poder enviar, en orden de aparición del formulario.
  const missingHint = (() => {
    if (detailsValid || submitting) return '';
    if (type === 'MONEY') return 'Elige o escribe un monto para continuar.';
    if (type === 'GOODS') {
      if (!(typeof quantity === 'number' && quantity > 0)) return 'Indica cuántas unidades vas a donar.';
      if (!description.trim()) return 'Describe qué vas a donar.';
      return '';
    }
    if (volSkills.length === 0) return 'Elige al menos un área en la que puedes ayudar.';
    if (volDays.length === 0) return 'Elige al menos un día disponible.';
    if (!rangeValid) return 'La hora de fin debe ser posterior a la de inicio.';
    if (!(typeof quantity === 'number' && quantity > 0)) return 'Indica cuántas horas por semana puedes apoyar.';
    if (donorPhone.trim().length < 6) return 'Escribe un teléfono de contacto.';
    if (!donorName.trim()) return 'Escribe tu nombre para que el organizador sepa quién eres.';
    return '';
  })();

  const toggleDay = (d: Weekday) =>
    setVolDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const toggleSkill = (s: VolunteerSkill) =>
    setVolSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function submit() {
    setError('');
    setSubmitting(true);
    try {
      // Voluntariado: el área y la disponibilidad van en campos propios, así el
      // backend puede inscribirlo en la campaña. La descripción queda para su
      // comentario. Y nunca es anónimo: el organizador tiene que poder contactarlo.
      const isVol = type === 'TIME';
      const hideIdentity = anonymous && !isVol;

      const body: CreateDonationBody = {
        type,
        campaignId: campaignId || undefined,
        emergencyId: !isCampaign && emergencyId ? emergencyId : undefined,
        centerId: !isCampaign && centerId ? centerId : undefined,
        description: description.trim() || undefined,
        donorPhone: donorPhone || undefined,
        anonymous: hideIdentity,
        donorName: !hideIdentity ? donorName || undefined : undefined,
        donorEmail: !hideIdentity ? donorEmail || undefined : undefined,
        ...(isVol
          ? {
              volunteerSkills: volSkills,
              volunteerDays: volDays,
              volunteerStartTime: volStart,
              volunteerEndTime: volEnd,
            }
          : {}),
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
            <div className="field">
              <label className="label">¿En qué puedes ayudar?</label>
              <p className="fieldHint">Elige todas las que apliquen.</p>
              <div className="chipGrid">
                {VOL_SKILLS.map((sk) => {
                  const on = volSkills.includes(sk.value);
                  return (
                    <button
                      key={sk.value}
                      type="button"
                      className={`chip ${on ? 'chipOn' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleSkill(sk.value)}
                    >
                      {on && <Icon name="check" size={14} />} {sk.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <label className="label">¿Qué días puedes?</label>
              <div className="dayRow" role="group" aria-label="Días disponibles">
                {VOL_DAYS.map((d) => {
                  const on = volDays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      className={`dayChip ${on ? 'dayChipOn' : ''}`}
                      aria-pressed={on}
                      aria-label={d.label}
                      title={d.label}
                      onClick={() => toggleDay(d.value)}
                    >
                      {d.short}
                    </button>
                  );
                })}
              </div>
              <p className="fieldHint">
                {volDays.length === 0
                  ? 'Toca los días en los que puedes apoyar.'
                  : `${volDays.length} ${volDays.length === 1 ? 'día' : 'días'}: ${VOL_DAYS.filter((d) => volDays.includes(d.value))
                      .map((d) => d.label)
                      .join(', ')}`}
              </p>
            </div>

            <div className="fieldRow" style={{ marginBottom: 16 }}>
              <div>
                <label className="label" htmlFor="volStart">Desde</label>
                <select id="volStart" className="control" value={volStart} onChange={(e) => setVolStart(e.target.value)}>
                  {TIME_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="volEnd">Hasta</label>
                <select id="volEnd" className="control" value={volEnd} onChange={(e) => setVolEnd(e.target.value)}>
                  {TIME_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
            {!rangeValid && (
              <p className="fieldError" role="alert">
                La hora de fin debe ser posterior a la de inicio.
              </p>
            )}

            <div className="fieldRow" style={{ marginBottom: 16 }}>
              <div>
                <label className="label" htmlFor="volHours">Horas por semana</label>
                <input
                  id="volHours"
                  className="control"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label" htmlFor="volPhone">Teléfono (obligatorio)</label>
                <input
                  id="volPhone"
                  className="control"
                  type="tel"
                  inputMode="tel"
                  placeholder="987654321"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="volNote">Comentario (opcional)</label>
              <input
                id="volNote"
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

        {/* Donante. En voluntariado no hay anonimato: sin nombre ni correo el
            organizador no puede coordinar con quien se ofrece. */}
        {type !== 'TIME' && (
          <label className="checkRow">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Donar de forma anónima
          </label>
        )}

        {(type === 'TIME' || !anonymous) && (
          <div className="fieldRow" style={{ marginBottom: 16 }}>
            <div>
              <label className="label" htmlFor="donorName">
                {type === 'TIME' ? 'Nombre (obligatorio)' : 'Nombre (opcional)'}
              </label>
              <input
                id="donorName"
                className="control"
                placeholder={type === 'TIME' ? '¿Cómo te llamas?' : undefined}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="donorEmail">Correo (opcional)</label>
              <input
                id="donorEmail"
                className="control"
                type="email"
                placeholder={type === 'TIME' ? 'Para que te contacten' : 'Para consultar tus donaciones'}
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Qué falta. Un botón apagado sin explicación deja al donante adivinando. */}
        {missingHint && (
          <p className="fieldHint" style={{ marginBottom: 8 }}>
            {missingHint}
          </p>
        )}

        <button
          type="button"
          // `disabled` de verdad, no solo la clase: btnDisabled apaga el ratón con
          // pointer-events, pero con el teclado se seguía pudiendo enviar el
          // formulario incompleto.
          disabled={!detailsValid || submitting}
          className={`btn btnGold btnLg btnFull ${!detailsValid || submitting ? 'btnDisabled' : ''}`}
          onClick={submit}
        >
          <Icon name="heart" size={18} /> {submitting ? t('donate.processing') : t('donate.confirm')}
        </button>
      </div>
    </div>
  );
}
