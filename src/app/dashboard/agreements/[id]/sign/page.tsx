
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAgreement, updateComposerSignature, generatePdfAction } from '@/lib/actions';
import type { Agreement, Composer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Share2, PenLine, Download, BadgeCheck, Clock, CheckCircle } from 'lucide-react';
import { SignatureCanvas } from '@/components/signature-canvas';
import { ComposerTable } from '@/components/composer-table';
import { LegalTerms } from '@/components/legal-terms';
import { DocumentHeader } from '@/components/document-header';
import { DocumentLayout } from '@/components/ui/document-layout';
import { SignerManagement } from '@/components/signer-management';
import { SigningPanel } from '@/components/signing-panel';
import { DocumentViewer } from '@/components/document-viewer';
import Link from 'next/link';

export default function EnhancedSigningPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (agreementId) {
      getAgreement(agreementId)
        .then(fetchedAgreement => {
          if (fetchedAgreement) {
            setAgreement(fetchedAgreement);
            const firstUnsigned = fetchedAgreement.composers.find(c => !c.signature)?.id;
            if (firstUnsigned) {
              setSelectedSignerId(firstUnsigned);
            }
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Agreement not found.' });
            router.push('/dashboard');
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [agreementId, router, toast]);

  const handleDownloadPdf = async () => {
    if (!agreement) return;
    const result = await generatePdfAction(agreement.id);
    if ('data' in result) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.data}`;
      link.download = `agreement-${agreement.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "PDF Generated", description: "Your download has started." });
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.error });
    }
  };

  const handleApplySignature = async () => {
    if (!selectedSignerId || !signatureData || !termsAccepted) {
      toast({
        variant: 'destructive',
        title: 'Incomplete',
        description: 'Please select a signer, draw your signature, and accept the terms.',
      });
      return;
    }
    
    try {
      await updateComposerSignature(agreementId, selectedSignerId, signatureData);
      const updatedAgreement = await getAgreement(agreementId);
      if (updatedAgreement) {
        setAgreement(updatedAgreement);
      }
      
      toast({
        title: 'Signature Applied!',
        description: 'The signature has been successfully recorded.',
      });

      // Reset for next signature
      setSignatureData(null);
      setTermsAccepted(false);
      const nextUnsigned = updatedAgreement?.composers.find(c => !c.signature)?.id;
      setSelectedSignerId(nextUnsigned || null);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save signature.' });
    }
  };

  const allSigned = useMemo(() => {
    return agreement?.composers.every(c => !!c.signature);
  }, [agreement]);
  
  if (isLoading || !agreement) {
    return <div className="flex items-center justify-center h-screen">Loading Agreement...</div>;
  }

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
              {allSigned ? (
                 <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border bg-primary/10 text-primary border-primary/30">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completado
                 </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border bg-accent/10 text-accent border-accent/30">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                  </span>
                  En progreso
                </div>
              )}
         </div>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
           <DocumentViewer agreement={agreement} />
        </section>

        <aside className="lg:col-span-4 lg:sticky lg:top-6">
          <div className="space-y-6">
             <div className="rounded-xl border p-4 shadow-sm ring-1 ring-white/5 bg-muted border-border">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">Acciones</h3>
                  <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Auto-save
                  </div>
                </div>
                <div className="space-y-2">
                  <Button onClick={handleApplySignature} className="w-full" size="lg" disabled={!selectedSignerId || !signatureData || !termsAccepted}>
                    <PenLine className="mr-2" />
                    Firmar documento
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg" onClick={handleDownloadPdf}>
                    <Download className="mr-2" />
                    Descargar PDF
                  </Button>
                   <Button variant="outline" className="w-full" size="lg" disabled>
                    <BadgeCheck className="mr-2" />
                    Certificado digital (pronto)
                  </Button>
                </div>
             </div>
             {!allSigned && (
                <SigningPanel 
                    agreement={agreement}
                    selectedSignerId={selectedSignerId}
                    onSignerChange={setSelectedSignerId}
                    termsAccepted={termsAccepted}
                    onTermsChange={setTermsAccepted}
                    onSignatureChange={setSignatureData}
                />
             )}
              <div className="rounded-xl border p-4 shadow-sm ring-1 ring-white/5 bg-muted border-border">
                <h3 className="mb-3 text-base font-semibold tracking-tight text-foreground">Firmantes</h3>
                <SignerManagement composers={agreement.composers} />
              </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

