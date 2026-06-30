export type CampaignStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FUNDED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CampaignCategory =
  | 'HEALTH'
  | 'EDUCATION'
  | 'ENVIRONMENT'
  | 'ENTREPRENEURSHIP'
  | 'COMMUNITY'
  | 'EMERGENCY'
  | 'ANIMALS'
  | 'CULTURE'
  | 'TECHNOLOGY'
  | 'SPORTS'
  | 'OTHER';

export interface CampaignOrganizer {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  body: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CampaignRecentDonor {
  id: string;
  name: string;
  amount?: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  category: CampaignCategory;
  status: CampaignStatus;
  coverPhoto?: string;
  goalAmount?: number | null;
  raisedAmount: number;
  volunteerSkills?: string[];
  currency: string;
  backersCount: number;
  progressPct: number;
  deadline?: string;
  district?: string;
  featured: boolean;
  organizerId: string;
  organizer?: CampaignOrganizer;
  updates?: CampaignUpdate[];
  recentDonors?: CampaignRecentDonor[];
  createdAt: string;
}
