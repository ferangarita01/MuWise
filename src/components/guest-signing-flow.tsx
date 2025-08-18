
'use client';

import { useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentLayout } from './document-layout';
import { SignatureCanvas } from './signature-canvas';
import { Checkbox } from './ui/checkbox';
import { generatePdfAction, updateComposerSignature, completeGuestSignature } from '@/lib/actions';
import { CheckCircle, Download, KeyRound, Mail, PenLine, Loader2 } from 'lucide-react';
import { AgreementDocument } from './agreement-document';

type GuestSigningFlowProps = {
  agreement: Agreement;
  token: string;
};

type SigningStep = 'verifyIdentity' | 'sign' | 'complete';

export function GuestSigningFlow({ agreement: initialAgreement, token }: GuestSigningFlowProps) {
  const [agreement, setAgreement] = useState(initialAgreement);
  const [step, setStep] = useState<SigningStep>('sign'); // Start directly at signing step
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // In a real flow, you would also need to identify WHICH composer is signing.
  // This would typically be part of the data fetched with the token.
  // For now, we'll assume the first composer who hasn't signed is the guest.
  const signingComposer = agreement.composers.find(c => !c.signature);

  if (!signingComposer) {
    return (
       <div className="text-center py-12 space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">Agreement Already Signed!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
                All parties have already signed this document.
            </p>
            <Button onClick={() => handleDownload(agreement.id)}>
                <Download className="mr-2" />
                Download Signed Agreement
            </Button>
        </div>
    )
  }
  
  const handleSignAgreement = async () => {
    if (!signatureData || !termsAgreed) {
        toast({
            variant: 'destructive',
            title: 'Incomplete',
            description: 'Please provide your signature and agree to the terms.'
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
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save signature."
        toast({ variant: 'destructive', title: 'Error', description: errorMessage });
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
        toast({ title: "PDF Generated", description: "Your download has started." });
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.error });
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 'sign':
        return (
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                     <DocumentLayout>
                        <AgreementDocument agreement={agreement} signers={agreement.composers} />
                     </DocumentLayout>
                </div>
                <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                            <PenLine className="h-6 w-6 text-primary" />
                            <div>
                                <h3 className="text-lg font-semibold">Sign the Agreement</h3>
                                <p className="text-muted-foreground text-sm">
                                    You are signing as <span className="font-bold text-foreground">{signingComposer.name}</span>. 
                                </p>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Please draw your signature below. It will be legally binding.</p>
                        <SignatureCanvas onSignatureEnd={setSignatureData} />
                        <div className="flex items-start space-x-3 pt-2">
                            <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(!!checked)} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                                I have read the document and agree to the legally binding terms and conditions outlined within.
                            </Label>
                        </div>
                      </CardContent>
                      <CardFooter>
                         <Button onClick={handleSignAgreement} className="w-full" disabled={!signatureData || !termsAgreed || isProcessing}>
                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Apply Signature & Finalize'}
                        </Button>
                      </CardFooter>
                    </Card>
                </div>
            </div>
        );

      case 'complete':
        return (
            <div className="text-center py-12 space-y-4">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
                <h2 className="text-3xl font-bold">Agreement Signed!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Thank you, {signingComposer.name}. Your signature has been applied. 
                    A copy has been sent to your email and you can download it below.
                </p>
                <Button onClick={() => handleDownload(agreement.id)}>
                    <Download className="mr-2" />
                    Download Signed Agreement
                </Button>
            </div>
        )
    }
  };

  return (
    <Card className="max-w-7xl mx-auto border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Agreement: "{agreement.songTitle}"</CardTitle>
        <CardDescription>
          You have been invited by {agreement.composers.filter(c => c.email !== signingComposer.email).map(c => c.name).join(', ') || 'the author'} to sign this songwriter split agreement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}
