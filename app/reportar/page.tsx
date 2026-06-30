import type { Metadata } from 'next';
import { ReportForm } from '@/components/ReportForm';

export const metadata: Metadata = {
  title: 'Reportar emergencia',
  description: 'Reporta una emergencia de forma anónima. Sin cuenta. Tu aviso llega a los gestores para su atención.',
  alternates: { canonical: '/reportar' },
};

export default function ReportarPage() {
  return (
    <div style={{ paddingTop: 16 }}>
      <ReportForm />
    </div>
  );
}
