'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import {
  createDonation,
  uploadReceipt,
  getActiveEmergencies,
  getCenters,
  getCampaignCenters,
  type CreateDonationBody,
  type DonationType,
  type PaymentMethod,
  type EmergencyLite,
  type CenterLite,
  type VolunteerSkill,
  type Weekday,
} from '@/lib/clientApi';
import { formatSoles } from '@/lib/format';
import { assetUrl } from '@/lib/assets';
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

// Datos de pago de NOSXOTROS. Todas las donaciones de todas las campañas entran
// aquí; luego la asociación transfiere a cada campaña (los datos bancarios que
// registra el organizador son para ese desembolso, no se muestran al donante).
// Cuentas BBVA reales a nombre de ASOCIACION FT NOSXOTROS AREQUIPA.
const NOSXOTROS_PAY = {
  bankName: 'BBVA',
  accountHolder: 'ASOCIACION FT NOSXOTROS AREQUIPA',
  accounts: [
    { number: '0011-0220-0100184776', cci: '011-220-000100184776-11' },
    { number: '0011-0220-0100184784', cci: '011-220-000100184784-15' },
  ],
  // QR interoperable BBVA: acepta pago desde cualquier billetera digital
  // (Yape, Plin, apps de bancos).
  qrImageUrl: '/img/qr-bbva-billeteras.jpeg',
};

// Foto genérica del sitio cuando el centro no tiene la suya (licencia libre,
// ver web/public/img/CREDITOS.json).
const CENTER_FALLBACK_PHOTO = '/img/entrega-familias.jpg';

// Enlace para abrir la ubicación del centro en el mapa: usa el que cargó el
// organizador y, si no hay, arma uno de Google Maps con coordenadas o dirección.
function centerMapsHref(c: CenterLite): string {
  if (c.mapUrl) return c.mapUrl;
  if (typeof c.lat === 'number' && typeof c.lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
  }
  if (c.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
  }
  return '';
}

const CENTER_STATUS_LABEL: Record<NonNullable<CenterLite['status']>, string> = {
  OPEN: 'Recibiendo donaciones',
  NEAR_FULL: 'Casi lleno',
  FULL: 'Lleno',
  CLOSED: 'Cerrado',
};

export function DonateForm({
  campaignId,
  campaignTitle,
  emergencyId: presetEmergencyId,
  initialType,
  initialAmount,
  initialName,
  initialEmail,
}: {
  campaignId?: string;
  campaignTitle?: string;
  emergencyId?: string;
  initialType?: DonationType;
  initialAmount?: number;
  initialName?: string;
  initialEmail?: string;
}) {
  const isCampaign = !!campaignId;
  const t = useT();

  const [type, setType] = useState<DonationType>(initialType ?? 'MONEY');
  const [amount, setAmount] = useState<number | ''>(initialAmount ?? '');
  const [accountNumber, setAccountNumber] = useState('');
  // Prueba del abono: número de operación y/o captura del voucher.
  const [operationNumber, setOperationNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [emergencyId, setEmergencyId] = useState(presetEmergencyId ?? '');
  // Pago simulado: siempre Yape (no se elige método en la web).
  const paymentMethod: PaymentMethod = 'YAPE';
  const [anonymous, setAnonymous] = useState(false);
  const [donorName, setDonorName] = useState(initialName ?? '');
  const [donorEmail, setDonorEmail] = useState(initialEmail ?? '');
  const [donorPhone, setDonorPhone] = useState('');
  // Voluntariado
  const [volSkills, setVolSkills] = useState<VolunteerSkill[]>([]);
  const [volDays, setVolDays] = useState<Weekday[]>([]);
  const [volStart, setVolStart] = useState('08:00');
  const [volEnd, setVolEnd] = useState('13:00');

  const [emergencies, setEmergencies] = useState<EmergencyLite[]>([]);
  const [centers, setCenters] = useState<CenterLite[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    // En una campaña se muestran SUS centros de acopio; si aún no tiene,
    // se cae a la lista general para no dejar al donante sin destino.
    const loadCenters =
      isCampaign && campaignId
        ? getCampaignCenters(campaignId).then((cs) => (cs.length ? cs : getCenters()))
        : getCenters();
    loadCenters.then(setCenters).catch(() => setCenters([]));
    // Los datos de pago no dependen de la campaña: todas las donaciones entran
    // a las cuentas de NOSXOTROS y la asociación desembolsa a cada campaña.
    if (isCampaign) return; // las campañas son el destino; no se elige emergencia
    getActiveEmergencies()
      .then(setEmergencies)
      .catch(() => setEmergencies([]));
  }, [isCampaign, campaignId]);

  // El horario debe avanzar: "de 14:00 a 09:00" no significa nada.
  const rangeValid = volStart < volEnd;

  // Especies no se registra aquí: solo se muestran los centros de acopio y el
  // donante lleva las cosas en persona (el registro lo hace el centro).
  const detailsValid =
    type === 'MONEY'
      ? typeof amount === 'number' &&
        amount > 0 &&
        accountNumber.trim().length > 0 &&
        // Sin operación ni voucher el aporte no se puede acreditar nunca.
        (operationNumber.trim().length > 0 || receiptUrl.length > 0) &&
        !uploadingReceipt
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
    if (type === 'GOODS' || detailsValid || submitting) return '';
    if (type === 'MONEY') {
      if (!(typeof amount === 'number' && amount > 0)) return 'Elige o escribe un monto para continuar.';
      if (!accountNumber.trim()) return 'Escribe el número de cuenta o celular desde el que transferiste.';
      if (uploadingReceipt) return 'Espera a que termine de subir tu comprobante.';
      if (!operationNumber.trim() && !receiptUrl)
        return 'Escribe el número de operación o sube la captura de tu comprobante.';
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

  async function onReceiptPicked(file?: File) {
    if (!file) return;
    setReceiptError('');
    if (!file.type.startsWith('image/')) {
      setReceiptError('El comprobante debe ser una imagen (captura o foto).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('La imagen pesa más de 5 MB. Sube una captura más liviana.');
      return;
    }
    setUploadingReceipt(true);
    try {
      const url = await uploadReceipt(file);
      setReceiptUrl(url);
      setReceiptName(file.name);
    } catch (e) {
      setReceiptError(e instanceof Error ? e.message : 'No se pudo subir el comprobante.');
    } finally {
      setUploadingReceipt(false);
    }
  }

  function clearReceipt() {
    setReceiptUrl('');
    setReceiptName('');
    setReceiptError('');
  }

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
        body.donorAccountNumber = accountNumber.trim();
        body.operationNumber = operationNumber.trim() || undefined;
        body.receiptUrl = receiptUrl || undefined;
      } else {
        body.quantity = typeof quantity === 'number' ? quantity : 1;
        body.paymentMethod = 'IN_KIND';
      }
      // No se confirma el pago aquí: queda "no acreditado" hasta que un
      // administrador coteje la transferencia y la acredite.
      const donation = await createDonation(body);
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
            {type === 'MONEY' && ' Tu aporte queda como "no acreditado" hasta que el administrador confirme la transferencia.'}
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
          <div className="field">
            <label className="label">Destino (emergencia)</label>
            <select
              className="control"
              data-empty={emergencyId === '' ? 'true' : undefined}
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

        {/* Especies: no hay formulario. Solo se listan los centros de acopio de
            la campaña; el donante lleva las cosas en persona y el centro las
            registra al recibirlas. */}
        {type === 'GOODS' && (
          <div className="field">
            <label className="label">Centros de acopio de esta campaña</label>
            <p className="fieldHint">
              Lleva tu donación a cualquiera de estos centros. Ahí la reciben y la registran.
            </p>
            <p className="noMedsNote" role="note">
              <Icon name="alertTriangle" size={18} />
              <span>
                <strong>No recibimos medicamentos.</strong> Por seguridad sanitaria, los centros
                de acopio no aceptan fármacos de ningún tipo (los botiquines de primeros
                auxilios sí se reciben).
              </span>
            </p>
            <div className="centerList">
              {centers.map((c) => {
                const photo = assetUrl(c.photoUrl) || CENTER_FALLBACK_PHOTO;
                const mapsHref = centerMapsHref(c);
                const phone = c.contactPhone?.trim();
                return (
                  <div key={c.id} className="centerCard">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Foto del ${c.name}`}
                      className="centerCardPhoto"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== window.location.origin + CENTER_FALLBACK_PHOTO) {
                          img.src = CENTER_FALLBACK_PHOTO;
                        }
                      }}
                    />
                    <div className="centerCardBody">
                      <div className="centerCardHead">
                        <strong className="centerCardName">{c.name}</strong>
                        {c.status && (
                          <span className={`centerCardStatus centerCardStatus-${c.status}`}>
                            {CENTER_STATUS_LABEL[c.status]}
                          </span>
                        )}
                      </div>

                      {c.address && (
                        <p className="centerCardRow">
                          <Icon name="mapPin" size={16} />
                          <span>
                            {c.address}
                            {c.reference ? ` · ${c.reference}` : ''}
                          </span>
                        </p>
                      )}
                      {c.openingHours && (
                        <p className="centerCardRow">
                          <Icon name="clock" size={16} />
                          <span>{c.openingHours}</span>
                        </p>
                      )}
                      {phone && (
                        <p className="centerCardRow">
                          <Icon name="phone" size={16} />
                          <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
                        </p>
                      )}

                      {mapsHref && (
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btnGhost centerCardMapBtn"
                        >
                          <Icon name="mapPin" size={16} /> Abrir ubicación en Maps
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
              {centers.length === 0 && (
                <p className="fieldHint">Por ahora no hay centros de acopio disponibles.</p>
              )}
            </div>
          </div>
        )}

        {/* Datos de pago de NOSXOTROS: iguales en todas las campañas. El dinero
            entra a la asociación y ella lo transfiere a cada campaña. */}
        {type === 'MONEY' && (
          <div className="payInfoBox" style={{ margin: '4px 0 16px', padding: 16, borderRadius: 12, background: 'var(--surface-2, #f4f6f5)', fontSize: 14, lineHeight: 1.7 }}>
            <strong>Paga con cualquier billetera digital o transferencia</strong>
            {NOSXOTROS_PAY.accounts.map((a) => (
              <div key={a.number}>
                <div>Cuenta: <strong>{NOSXOTROS_PAY.bankName} {a.number}</strong></div>
                <div>CCI: <strong>{a.cci}</strong></div>
              </div>
            ))}
            <div>Titular: {NOSXOTROS_PAY.accountHolder}</div>
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: 8, background: '#fff', borderRadius: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={NOSXOTROS_PAY.qrImageUrl}
                  alt={`QR de pago BBVA de ${NOSXOTROS_PAY.accountHolder}: escanéalo con cualquier billetera digital`}
                  style={{ width: 220, maxWidth: '100%', height: 'auto', objectFit: 'contain', borderRadius: 8 }}
                />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Escanea el QR y paga con cualquier billetera digital (Yape, Plin, app de tu banco)
                {amount ? ` · ${formatSoles(Number(amount))}` : ''}
              </div>
            </div>
          </div>
        )}

        {type === 'MONEY' && (
          <div className="field">
            <label className="label" htmlFor="accountNumber">Tu número de cuenta o celular Yape/Plin</label>
            <p className="fieldHint">Con qué transferiste. Así el administrador coteja el abono y lo acredita.</p>
            <input
              id="accountNumber"
              className="control"
              placeholder="987654321 o 191-2345678-0-12"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
        )}

        {/* Prueba del abono: número de operación o captura. Uno de los dos es
            obligatorio; sin eso nadie puede acreditar la transferencia. */}
        {type === 'MONEY' && (
          <div className="field">
            <label className="label" htmlFor="operationNumber">
              Comprobante de tu transferencia <span className="labelReq">obligatorio</span>
            </label>
            <p className="fieldHint">
              Escribe el número de operación <strong>o</strong> sube la captura. Con cualquiera de los
              dos basta.
            </p>
            <input
              id="operationNumber"
              className="control"
              placeholder="N.° de operación (ej. 00123456)"
              value={operationNumber}
              onChange={(e) => setOperationNumber(e.target.value)}
              inputMode="numeric"
            />

            <div className="orDivider" aria-hidden="true">
              <span>o</span>
            </div>

            {receiptUrl ? (
              <div className="receiptPreview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={receiptUrl} alt="Comprobante subido" className="receiptThumb" />
                <div className="receiptInfo">
                  <strong>
                    <Icon name="check" size={15} /> Comprobante subido
                  </strong>
                  <span>{receiptName}</span>
                </div>
                <button type="button" className="receiptRemove" onClick={clearReceipt}>
                  Quitar
                </button>
              </div>
            ) : (
              <label className={`uploadBox ${uploadingReceipt ? 'uploadBoxBusy' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="uploadInput"
                  disabled={uploadingReceipt}
                  onChange={(e) => onReceiptPicked(e.target.files?.[0])}
                />
                <span className="uploadIcon">
                  <Icon name="image" size={22} />
                </span>
                <span className="uploadText">
                  <strong>{uploadingReceipt ? 'Subiendo comprobante…' : 'Subir captura del comprobante'}</strong>
                  <span>JPG o PNG, hasta 5 MB</span>
                </span>
              </label>
            )}

            {receiptError && (
              <p className="fieldError" role="alert">
                {receiptError}
              </p>
            )}
          </div>
        )}

        {/* Donante. En voluntariado no hay anonimato: sin nombre ni correo el
            organizador no puede coordinar con quien se ofrece. En especies no
            hay nada que registrar aquí. */}
        {type === 'MONEY' && (
          <label className="checkRow">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Donar de forma anónima
          </label>
        )}

        {type !== 'GOODS' && (type === 'TIME' || !anonymous) && (
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

        {/* En especies no hay nada que enviar: el aporte se concreta llevando
            las cosas al centro de acopio. */}
        {type !== 'GOODS' && (
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
        )}
      </div>
    </div>
  );
}
