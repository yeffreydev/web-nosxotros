import type { Metadata } from 'next';
import { ConsultPanel } from '@/components/ConsultPanel';

export const metadata: Metadata = {
  title: 'Consultar mi donación',
  description: 'Sigue el recorrido de tu donación con tu código o tu correo. Trazabilidad total, sin iniciar sesión.',
  alternates: { canonical: '/consultar' },
};

export default function ConsultarPage({ searchParams }: { searchParams: { code?: string } }) {
  return (
    <div style={{ paddingTop: 16 }}>
      <ConsultPanel initialCode={searchParams.code} />
    </div>
  );
}
