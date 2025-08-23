
'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgreementActions } from '@/components/agreement/agreement-actions';
import { SignersTable } from '@/components/agreement/signers-table';
import { useToast } from '@/hooks/use-toast';
import type { Agreement } from '@/lib/types';
import { DocumentHeader } from '@/components/document-header';
import { LegalTerms } from '@/components/legal-terms';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2, Save, Send } from 'lucide-react';
import { updateAgreementStatusAction, updateSignerSignatureAction, getAgreementByIdAction, removeSignerFromAgreementAction } from '@/actions/agreementActions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
} from 'lucide-react';

export default function AgreementPageClient({ agreementId }: { agreementId: string }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSending, setIsSending] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAgreement() {
        if (!agreementId) return;
        setIsLoading(true);
        const result = await getAgreementByIdAction(agreementId);
        if (result.status === 'success' && result.data) {
            setAgreement(result.data);
        } else {
            toast({
                title: 'Error al cargar el acuerdo',
                description: result.message,
                variant: 'destructive'
            });
            setAgreement(null);
        }
        setIsLoading(false);
    }
    fetchAgreement();
  }, [agreementId, toast]);

  const handleDeleteSigner = async (signerId: string) => {
    if (!agreement) return;

    const result = await removeSignerFromAgreementAction({
      agreementId: agreement.id,
      signerId,
    });

    if (result.status === 'success') {
      toast({
        title: 'Firmante Eliminado',
        description: 'El firmante ha sido eliminado del acuerdo.',
      });
      // Update local state to reflect the change immediately
      setAgreement(prev => {
        if (!prev) return null;
        return {
          ...prev,
          composers: prev.composers.filter(c => c.id !== signerId),
        };
      });
    } else {
      toast({
        title: 'Error al eliminar firmante',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Borrador guardado',
      description: 'El borrador ha sido guardado en tu biblioteca.',
    });
    router.push('/dashboard/agreements');
  };

  const handleFinalizeDocument = async () => {
    if (!agreement) return;
    setIsFinalizing(true);
    
    const result = await updateAgreementStatusAction(agreement.id, 'Completado');
    if (result.status === 'success' && result.data?.pdfUrl) {
        toast({
            title: 'Documento Finalizado y Guardado',
            description: 'El PDF del acuerdo ha sido generado y almacenado de forma segura.',
            action: (
              <Button asChild>
                <Link href={result.data.pdfUrl} target="_blank" rel="noopener noreferrer">Ver PDF Final</Link>
              </Button>
            )
        });
        router.push('/dashboard/agreements');
    } else {
        toast({
            title: 'Error al finalizar',
            description: result.message,
            variant: 'destructive',
        });
    }
     setIsFinalizing(false);
  };
  
  const handleApplySignature = async () => {
    if (!signatureData || !agreement || !userProfile) {
        toast({ title: 'Error', description: 'Firma o datos del acuerdo no disponibles.', variant: 'destructive'});
        return;
    }

    const currentUserSigner = agreement.composers.find(c => c.email.toLowerCase() === userProfile.email?.toLowerCase());

    if (!currentUserSigner) {
        toast({ title: 'Error', description: 'No eres un firmante en este acuerdo.', variant: 'destructive'});
        return;
    }

    const result = await updateSignerSignatureAction({
        agreementId: agreement.id,
        signerId: currentUserSigner.id, 
        signatureDataUrl: signatureData,
    });
    
    if (result.status === 'success') {
      toast({
        title: 'Firma Aplicada',
        description: 'Tu firma ha sido guardada en el documento.',
      });
      // Re-fetch agreement to show updated signature
      const updatedAgreement = await getAgreementByIdAction(agreementId);
      if (updatedAgreement.status === 'success' && updatedAgreement.data) {
        setAgreement(updatedAgreement.data);
      }
    } else {
      toast({
        title: 'Error al aplicar firma',
        description: result.message,
        variant: 'destructive',
      });
    }
  };


  const handleSendRequest = async (email: string) => {
     if (!agreement || !userProfile) return false;
        
        const participant = agreement.composers.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (!participant) {
            toast({ title: 'Error', description: 'El correo no corresponde a ningún firmante.', variant: 'destructive' });
            return false;
        }
        
        setIsSending(true);
        try {
            const response = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agreementId: agreement.id,
                    participantId: participant.id,
                    participantEmail: participant.email,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({ title: 'Solicitud enviada', description: `La solicitud de firma fue enviada a ${participant.email}` });
                return true;
            } else {
                toast({ title: 'Error al enviar', description: result.error, variant: 'destructive' });
                return false;
            }
        } catch (error) {
            toast({ title: 'Error de red', description: 'No se pudo conectar al servidor.', variant: 'destructive' });
            return false;
        } finally {
            setIsSending(false);
        }
  }


  if (isLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h1 className="text-xl font-bold">Cargando acuerdo...</h1>
          <p className="text-muted-foreground">Obteniendo los detalles del acuerdo y firmantes.</p>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <h1 className="text-2xl font-bold">Contrato no encontrado</h1>
          <p className="text-muted-foreground">El contrato que estás buscando no existe o fue eliminado.</p>
      </div>
    )
  }

  const allSigned = agreement.composers.every(s => s.signature);

  return (
    <div ref={pageRef} className="relative mx-auto max-w-7xl px-4 py-6">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/5 blur-3xl"></div>
      </div>

       <header className="mb-6 flex items-center justify-between rounded-xl border border-secondary bg-secondary/60 px-3 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast({ title: 'Enlace copiado' }))}
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartir enlace
          </Button>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border ${
              allSigned 
                ? 'border-primary/35 bg-primary/10 text-primary' 
                : 'border-accent/35 bg-accent/10 text-accent'
            }`}
          >
            <span className={`relative flex h-2 w-2 ${!allSigned ? 'animate-ping' : ''}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${!allSigned ? 'bg-accent' : ''}`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${allSigned ? 'bg-primary' : 'bg-accent'}`}></span>
            </span>
            {allSigned ? 'Completado' : 'En progreso'}
          </span>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section id="documentColumn" className="lg:col-span-8">
          <div className="rounded-xl border bg-secondary shadow-sm ring-1 ring-white/5">
              <div className="overflow-hidden rounded-t-xl">
                  <div className="relative">
                      <img src={agreement.image} data-ai-hint="agreement header" alt="Agreement header" className="h-40 w-full object-cover sm:h-44 md:h-48" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                           <DocumentHeader agreement={agreement} />
                      </div>
                  </div>
              </div>
              <div id="doc-scroll" className="max-h-[72vh] overflow-auto px-6 pb-6">
                  <article id="doc-wrapper" className="mx-auto max-w-3xl">
                      <SignersTable 
                        signers={agreement.composers}
                        onDeleteSigner={handleDeleteSigner}
                      />
                      
                        <div className="leading-relaxed rounded-lg border border-secondary bg-background/50 ring-1 ring-white/5 p-5 mt-6">
                            <div className="mx-auto max-w-3xl rounded-md bg-white text-slate-900 shadow-lg ring-1 ring-inset ring-slate-900/5 p-6 space-y-6">
                                <p className="text-sm leading-6 text-slate-700">{agreement.description}</p>
                                <LegalTerms />
                                <div className="rounded-md bg-slate-50 p-4 text-xs leading-6 ring-1 ring-inset ring-slate-200 text-slate-700">
                                    <p>Al firmar, confirmas que has leído y aceptas los términos de uso, política de privacidad y reconoces que tu firma electrónica es legalmente vinculante. Conserva una copia para tus registros.</p>
                                </div>
                                <section>
                                    <h3 className="mb-3 text-base font-medium text-slate-900">Firmas</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {agreement.composers.map(composer => (
                                            <div key={composer.id} className="rounded-lg border border-slate-200 bg-white p-4">
                                                <p className="mb-2 text-xs font-medium text-slate-500">Firma ({composer.role})</p>
                                                <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-white">
                                                    {composer.signature ? (
                                                        <img src={composer.signature} alt={`Firma de ${composer.name}`} className="max-h-24" />
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Pendiente de firma</span>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Nombre: {composer.name}</span>
                                                    <span>{composer.signedAt ? new Date(composer.signedAt).toLocaleDateString() : ''}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div id="extra-signatures" className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"></div>
                                </section>
                            </div>
                        </div>

                  </article>
              </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
              <Button
                onClick={handleSaveDraft}
                disabled={isFinalizing}
                variant="outline"
              >
                  <Save className="h-4 w-4" />
                  Guardar Borrador
              </Button>
              <Button
                onClick={handleFinalizeDocument}
                disabled={isFinalizing || !allSigned}
                className="group"
              >
                  {isFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isFinalizing ? 'Finalizando...' : 'Finalizar Documento'}
              </Button>
          </div>
        </section>

        <AgreementActions 
            isSending={isSending} 
            onSignatureEnd={setSignatureData}
            onSendRequest={handleSendRequest}
            signatureData={signatureData}
            onApplySignature={handleApplySignature}
            signers={agreement.composers}
        />
      </main>
    </div>
  );
}
