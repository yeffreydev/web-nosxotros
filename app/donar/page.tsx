import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DonateForm } from '@/components/DonateForm';

export const metadata: Metadata = {
  title: 'Donar a una iniciativa',
  description: 'Apoya una iniciativa con dinero, especies o voluntariado. Recibe un código para seguir tu aporte.',
  robots: { index: false },
};

type SearchParams = {
  campaignId?: string;
  campaign?: string;
  type?: string;
  amount?: string;
  name?: string;
  email?: string;
};

const TYPES = ['MONEY', 'GOODS', 'TIME'] as const;
type PrefillType = (typeof TYPES)[number];

// Las donaciones solo se hacen desde una campaña. Sin campaña → al listado.
export default function DonatePage({ searchParams }: { searchParams: SearchParams }) {
  if (!searchParams.campaignId) redirect('/campanas');

  // Precarga desde la tarjeta rápida del home. Valores raros se ignoran.
  const type = TYPES.includes(searchParams.type as PrefillType)
    ? (searchParams.type as PrefillType)
    : undefined;
  const parsedAmount = Number(searchParams.amount);
  const amount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;

  return (
    <div style={{ paddingTop: 16 }}>
      <DonateForm
        campaignId={searchParams.campaignId}
        campaignTitle={searchParams.campaign}
        initialType={type}
        initialAmount={amount}
        initialName={searchParams.name}
        initialEmail={searchParams.email}
      />
    </div>
  );
}
