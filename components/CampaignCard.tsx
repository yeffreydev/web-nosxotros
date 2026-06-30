import Link from 'next/link';
import type { Campaign } from '@/lib/types';
import { CAMPAIGN_CATEGORY, CAMPAIGN_STATUS, formatSoles, formatNumber, daysLeft } from '@/lib/format';
import { Progress } from './Progress';
import { Icon } from './Icon';

const TONE_CLASS: Record<string, string> = {
  success: 'badgeSuccess',
  gold: 'badgeGold',
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const cat = CAMPAIGN_CATEGORY[campaign.category];
  const st = CAMPAIGN_STATUS[campaign.status];
  const funded = campaign.progressPct >= 100 || campaign.status === 'FUNDED';
  const dleft = daysLeft(campaign.deadline);

  return (
    <Link href={`/campanas/${campaign.slug}`} className="card">
      <div
        className="cardCover"
        style={campaign.coverPhoto ? { backgroundImage: `url(${campaign.coverPhoto})` } : undefined}
      >
        {!campaign.coverPhoto && <Icon name={cat.icon} size={40} strokeWidth={1.6} />}
        <span className="badge badgeOnCover badgeGlass" style={{ left: 10 }}>
          <Icon name={cat.icon} size={13} /> {cat.label}
        </span>
        {campaign.featured && (
          <span className="badge badgeGold badgeOnCover" style={{ right: 10 }}>
            <Icon name="star" size={13} /> Destacada
          </span>
        )}
      </div>
      <div className="cardBody">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${TONE_CLASS[st.tone] ?? ''}`}>{st.label}</span>
          {dleft != null && campaign.status === 'ACTIVE' && (
            <span className="metaInline">
              <Icon name="clock" size={14} /> {dleft} días
            </span>
          )}
        </div>
        <h3 className="cardTitle">{campaign.title}</h3>
        <p className="cardSummary">{campaign.summary}</p>
        <div style={{ marginTop: 14 }}>
          {campaign.goalAmount != null && <Progress pct={campaign.progressPct} gold={funded} />}
          <div className="metaRow">
            <strong style={{ color: 'var(--brand-700)' }}>{formatSoles(campaign.raisedAmount)}</strong>
            <span style={{ color: 'var(--text-muted)' }}>
              {campaign.goalAmount != null
                ? `${campaign.progressPct}% · meta ${formatSoles(campaign.goalAmount)}`
                : 'sin meta fija'}
            </span>
          </div>
          <div className="metaInline" style={{ marginTop: 4 }}>
            <Icon name="heart" size={14} /> {formatNumber(campaign.backersCount)} donantes
          </div>
        </div>
      </div>
    </Link>
  );
}
