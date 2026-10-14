import Link from 'next/link';
import type { Campaign } from '@/lib/types';
import { CAMPAIGN_CATEGORY, CAMPAIGN_STATUS, formatNumber, daysLeft } from '@/lib/format';
import { coverFor, initiativeKind } from '@/lib/covers';
import { ImpactMeters, TraceSeal } from './ImpactMeters';
import { Icon } from './Icon';

const TONE_CLASS: Record<string, string> = {
  success: 'badgeSuccess',
  gold: 'badgeGold',
};

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const cat = CAMPAIGN_CATEGORY[campaign.category];
  const st = CAMPAIGN_STATUS[campaign.status];
  const kind = initiativeKind(campaign);
  const dleft = daysLeft(campaign.deadline);
  const cover = coverFor(campaign);
  const photos = campaign.photos?.length ?? 0;

  return (
    <Link href={`/campanas/${campaign.slug}`} className="card">
      <div className="cardCover">
        <span className="cardCoverImg" style={{ backgroundImage: `url(${cover.url})` }} aria-hidden="true" />
        <span
          className={`badge badgeOnCover kindBadge kindBadge-${kind.key}`}
          style={{ left: 10, maxWidth: campaign.featured ? '58%' : 'calc(100% - 20px)' }}
        >
          <Icon name={kind.icon} size={13} /> {kind.label}
        </span>
        {campaign.featured && (
          <span className="badge badgeGold badgeOnCover" style={{ right: 10 }}>
            <Icon name="star" size={13} /> Destacada
          </span>
        )}
        {photos > 1 && (
          <span className="cardPhotoCount" aria-label={`${photos} fotos`}>
            <Icon name="image" size={13} /> {photos}
          </span>
        )}
      </div>
      <div className="cardBody">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${TONE_CLASS[st.tone] ?? ''}`}>{st.label}</span>
            <span className="badge">
              <Icon name={cat.icon} size={12} /> {cat.label}
            </span>
          </span>
          {/* "0 días" no dice nada: si el plazo vence hoy se dice así. */}
          {dleft != null && campaign.status === 'ACTIVE' && (
            <span className="metaInline">
              <Icon name="clock" size={14} /> {dleft === 0 ? 'Último día' : `${dleft} días`}
            </span>
          )}
        </div>
        <h3 className="cardTitle">{campaign.title}</h3>
        <p className="cardSummary">{campaign.summary}</p>
        <div style={{ marginTop: 14 }}>
          <ImpactMeters campaign={campaign} compact />
          <div className="cardFoot">
            <TraceSeal />
            <span className="metaInline">
              <Icon name="heart" size={14} /> {formatNumber(campaign.backersCount)} donantes
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
