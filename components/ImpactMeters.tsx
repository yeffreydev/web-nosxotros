import type { Campaign } from '@/lib/types';
import { formatNumber, formatSoles } from '@/lib/format';
import { Icon } from './Icon';

type Meter = {
  key: string;
  icon: string;
  label: string;
  value: string;
  pct: number | null;
};

const pct = (done: number, goal: number) => Math.max(0, Math.min(100, Math.round((done / goal) * 100)));

/**
 * Avance de una iniciativa en sus tres dimensiones —fondos, insumos y
 * voluntarios— más las familias atendidas. La meta en dinero es solo una de
 * ellas: mostrarla sola hace que la plataforma se lea como una colecta.
 */
export function impactMeters(c: Campaign): { meters: Meter[]; families: number } {
  const im = c.impact;
  const meters: Meter[] = [];

  meters.push({
    key: 'money',
    icon: 'coins',
    label: 'Fondos',
    value:
      c.goalAmount != null
        ? `${formatSoles(c.raisedAmount)} / ${formatSoles(c.goalAmount)}`
        : `${formatSoles(c.raisedAmount)} recaudados`,
    pct: c.goalAmount ? pct(c.raisedAmount, c.goalAmount) : null,
  });

  if (im && im.goodsTarget > 0) {
    meters.push({
      key: 'goods',
      icon: 'gift',
      label: 'Insumos',
      value: `${formatNumber(im.goodsCollected)} / ${formatNumber(im.goodsTarget)} acopiados`,
      pct: pct(im.goodsCollected, im.goodsTarget),
    });
  }

  const volGoal = im?.volunteerGoal ?? c.volunteerGoal;
  const vols = im?.volunteers ?? 0;
  if (volGoal || vols > 0) {
    meters.push({
      key: 'volunteers',
      icon: 'users',
      label: 'Voluntarios',
      value: volGoal ? `${formatNumber(vols)} / ${formatNumber(volGoal)} inscritos` : `${formatNumber(vols)} inscritos`,
      pct: volGoal ? pct(vols, volGoal) : null,
    });
  }

  return { meters, families: im?.familiesServed ?? 0 };
}

export function ImpactMeters({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const { meters, families } = impactMeters(campaign);
  return (
    <div className={`impactMeters ${compact ? 'impactMetersCompact' : ''}`}>
      {meters.map((m) => (
        <div key={m.key} className="impactMeter">
          <div className="impactMeterHead">
            <span className="impactMeterLabel">
              <Icon name={m.icon} size={14} /> {m.label}
            </span>
            <span className="impactMeterValue">{m.value}</span>
          </div>
          {m.pct != null && (
            <div
              className="progress progressThin"
              role="progressbar"
              aria-label={m.label}
              aria-valuenow={m.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={`progressFill impactFill-${m.key}`} style={{ width: `${m.pct}%` }} />
            </div>
          )}
        </div>
      ))}
      {families > 0 && (
        <div className="impactFamilies">
          <Icon name="heart" size={14} /> <strong>{formatNumber(families)}</strong>{' '}
          {families === 1 ? 'familia atendida' : 'familias atendidas'}
        </div>
      )}
    </div>
  );
}

/** Sello de trazabilidad: cada aporte lleva un código que el donante puede seguir. */
export function TraceSeal({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`traceSeal ${onDark ? 'traceSealDark' : ''}`} title="Cada aporte recibe un código y se sigue de principio a fin">
      <Icon name="shieldCheck" size={14} /> Trazabilidad verificada
    </span>
  );
}
