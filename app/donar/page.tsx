import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DonateForm } from '@/components/DonateForm';

export const metadata: Metadata = {
  title: 'Donar a una campaña',
  description: 'Apoya una campaña con dinero, especies o voluntariado. Recibe un código para seguir tu aporte.',
  robots: { index: false },
};

type SearchParams = { campaignId?: string; campaign?: string };

// Las donaciones solo se hacen desde una campaña. Sin campaña → al listado.
export default function DonatePage({ searchParams }: { searchParams: SearchParams }) {
  if (!searchParams.campaignId) redirect('/campanas');
  return (
    <div style={{ paddingTop: 16 }}>
      <DonateForm campaignId={searchParams.campaignId} campaignTitle={searchParams.campaign} />
    </div>
  );
}
