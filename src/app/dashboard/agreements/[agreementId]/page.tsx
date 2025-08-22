// /src/app/dashboard/agreements/[agreementId]/page.tsx

import { Suspense } from 'react';
import AgreementPageClient from './AgreementPageClient';
import { Loader2 } from 'lucide-react';

function AgreementPageLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <h1 className="text-xl font-bold">Cargando acuerdo...</h1>
            <p className="text-muted-foreground">Obteniendo los detalles del acuerdo y firmantes.</p>
        </div>
    )
}

export default function AgreementPage({ params }: { params: { agreementId: string } }) {
  return (
    <Suspense fallback={<AgreementPageLoading />}>
      <AgreementPageClient agreementId={params.agreementId} />
    </Suspense>
  );
}
