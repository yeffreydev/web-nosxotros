import type { Metadata } from 'next';
import { DonateForm } from '@/components/DonateForm';

export const metadata: Metadata = {
  title: 'Donar',
  description: 'Haz una donación sin registrarte. Recibe un código para seguir tu aporte con trazabilidad total.',
  alternates: { canonical: '/donar' },
};

type SearchParams = { campaignId?: string; campaign?: string; emergencyId?: string };

export default function DonatePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <DonateForm
        campaignId={searchParams.campaignId}
        campaignTitle={searchParams.campaign}
        emergencyId={searchParams.emergencyId}
      />
    </div>
  );
}
