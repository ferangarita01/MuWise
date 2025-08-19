
'use client';

import { useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { DocumentLayout } from './document-layout';
import { SignatureCanvas } from './signature-canvas';
import { Checkbox } from './ui/checkbox';
import { generatePdfAction, completeGuestSignature } from '@/lib/actions';
import { CheckCircle, Download, PenLine, Loader2, PartyPopper } from 'lucide-react';
import { AgreementDocument } from './agreement-document';
import { Label } from './ui/label';

type GuestSigningFlowProps = {
  agreement: Agreement;
  token: string;
  signerId: string;
};

type SigningStep = 'review' | 'complete';

export function GuestSigningFlow({ agreement: initialAgreement, token, signerId }: GuestSigningFlowProps) {
  const [agreement, setAgreement] = useState(initialAgreement);
  const [step, setStep] = useState<SigningStep>('review'); 
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const signingComposer = agreement.composers.find(c => c.id === signerId);

  // If for some reason the signerId doesn't match or they already signed, show complete.
  if (!signingComposer || signingComposer.signature) {
    return (
       <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
            <PartyPopper className="h-20 w-20 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">¡Todo listo por aquí!</h2>
            <p className="text-muted-foreground">
                Este acuerdo ya ha sido firmado por tu parte. No se requiere ninguna otra acción.
            </p>
            <Button onClick={() => handleDownload(agreement.id)}>
                <Download className="mr-2" />
                Descargar una Copia
            </Button>
        </div>
    )
  }
  
  const handleSignAgreement = async () => {
    if (!signatureData || !termsAgreed) {
        toast({
            variant: 'destructive',
            title: 'Faltan campos',
            description: 'Por favor, dibuja tu firma y acepta los términos para continuar.'
        });
        return;
    }
    setIsProcessing(true);
    try {
        await completeGuestSignature({
          agreementId: agreement.id,
          signerId: signingComposer.id,
          signatureDataUrl: signatureData,
          token: token
        });
        setStep('complete');
        toast({
            title: '¡Firma completada!',
            description: 'Tu firma ha sido registrada de forma segura.',
            variant: 'default',
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save signature."
        toast({ variant: 'destructive', title: 'Error al Firmar', description: errorMessage });
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleDownload = async (agreementId: string) => {
    if (!agreementId) return;
    const result = await generatePdfAction(agreementId);
    if ('data' in result) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.data}`;
        link.download = `agreement-${agreementId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "PDF Generado", description: "Tu descarga ha comenzado." });
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.error });
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 'review':
        return (
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                     <DocumentLayout>
                        <AgreementDocument agreement={agreement} />
                     </DocumentLayout>
                </div>
                <div className="space-y-6 lg:sticky lg:top-8">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                            <PenLine className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="text-lg font-semibold">Firmar el Acuerdo</h3>
                                <p className="text-muted-foreground text-sm">
                                    Estás firmando como <span className="font-bold text-foreground">{signingComposer.name}</span>. 
                                </p>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Por favor, dibuja tu firma en el recuadro. Esta será legalmente vinculante.</p>
                        <SignatureCanvas onSignatureEnd={setSignatureData} />
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(!!checked)} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                                He leído el documento y acepto los términos y condiciones legalmente vinculantes que se describen en él.
                            </Label>
                        </div>
                      </CardContent>
                      <CardFooter>
                         <Button onClick={handleSignAgreement} className="w-full" disabled={!signatureData || !termsAgreed || isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Aplicar Firma y Finalizar'}
                        </Button>
                      </CardFooter>
                    </Card>
                </div>
            </div>
        );

      case 'complete':
        return (
            <div className="text-center py-12 space-y-4 max-w-lg mx-auto">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                <h2 className="text-3xl font-bold">¡Acuerdo Firmado!</h2>
                <p className="text-muted-foreground">
                    Gracias, {signingComposer.name}. Tu firma ha sido aplicada correctamente. 
                    Se ha enviado una copia a tu correo electrónico y puedes descargar el documento firmado a continuación.
                </p>
                <Button onClick={() => handleDownload(agreement.id)}>
                    <Download className="mr-2" />
                    Descargar Acuerdo Firmado
                </Button>
            </div>
        )
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl">Revisar y Firmar: "{agreement.songTitle}"</CardTitle>
            <CardDescription>
            Has sido invitado por {agreement.composers.filter(c => c.id !== signerId).map(c => c.name).join(', ') || 'el autor'} para firmar este acuerdo.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {renderStepContent()}
        </CardContent>
    </div>
  );
}

    