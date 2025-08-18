
'use client';

import { AgreementForm } from '@/components/agreement-form';
import { DocumentViewer } from '@/components/document-viewer';
import { getAgreement, updateAgreement } from '@/lib/actions';
import type { Agreement } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<Partial<Agreement>>({});

  useEffect(() => {
    if (agreementId) {
      getAgreement(agreementId)
        .then(data => {
          if (data) {
            setAgreement(data);
            setFormState(data);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [agreementId]);
  
  const handleFormChange = (newData: Partial<Agreement>) => {
    setFormState(prev => ({...prev, ...newData, composers: newData.composers || prev.composers || [] }));
  };
  
  const handleSave = async (updatedAgreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    try {
        await updateAgreement(agreementId, updatedAgreementData);
        toast({
            title: 'Acuerdo Actualizado',
            description: 'Tus cambios se han guardado exitosamente.',
        });
        router.push(`/dashboard/agreements/${agreementId}/sign`);
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo actualizar el acuerdo.',
        });
        console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando acuerdo...</div>;
  }
  
  if (!agreement) {
    return <div className="flex items-center justify-center h-screen">Acuerdo no encontrado.</div>;
  }

  const previewAgreement: Agreement = {
      ...agreement,
      ...formState,
      // Make sure composers array is always present
      composers: formState.composers || agreement.composers,
  };


  return (
    <div className="relative max-w-full mx-auto">
      <header className="mb-6 flex items-center justify-between rounded-xl border px-3 py-3 backdrop-blur bg-muted/60 border-border">
         <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/agreements">
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-2">Volver</span>
              </Link>
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border text-[11px] font-medium tracking-tight bg-foreground/5 border-border text-foreground/80">SC</div>
                <div className="hidden sm:block text-muted-foreground/50">/</div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Acuerdos</span>
                    <div className="hidden sm:block text-muted-foreground/50">/</div>
                    <span className="text-sm font-medium tracking-tight text-foreground">{agreement.songTitle}</span>
                </div>
            </div>
         </div>
         <div className="flex items-center gap-2 sm:gap-3">
             <Button variant="outline" className="hidden sm:inline-flex">
                <Share2 className="h-4 w-4"/>
                <span className="ml-2">Compartir enlace</span>
             </Button>
         </div>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
           <DocumentViewer agreement={previewAgreement} />
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-6">
            <AgreementForm 
                existingAgreement={agreement} 
                onSave={handleSave} 
                onFormChange={handleFormChange}
            />
        </aside>
      </main>
    </div>
  );
}
