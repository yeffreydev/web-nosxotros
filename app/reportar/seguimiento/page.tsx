import type { Metadata } from 'next';
import { ReportTrack } from '@/components/ReportTrack';

export const metadata: Metadata = {
  title: 'Seguir mi reporte',
  description: 'Consulta el estado de tu reporte de emergencia con tu código.',
  robots: { index: false, follow: false },
};

export default function SeguimientoPage({ searchParams }: { searchParams: { code?: string } }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <ReportTrack initialCode={searchParams.code} />
    </div>
  );
}
