export function Progress({ pct, gold = false }: { pct: number; gold?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progressFill ${gold ? 'progressFillGold' : ''}`} style={{ width: `${v}%` }} />
    </div>
  );
}
