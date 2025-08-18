
'use client';

import { useState } from 'react';
import type { Agreement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentLayout } from './document-layout';
import { DocumentHeader } from './document-header';
import { ComposerTable } from './composer-table';
import { LegalTerms } from './legal-terms';
import { SignatureCanvas } from './signature-canvas';
import { Checkbox } from './ui/checkbox';
import { generatePdfAction, updateComposerSignature } from '@/lib/actions';
import { CheckCircle, Download, KeyRound, Mail, PenLine } from 'lucide-react';
import { AgreementDocument } from './agreement-document';

type GuestSigningFlowProps = {
  agreement: Agreement;
};

type SigningStep = 'verifyIdentity' | 'sign' | 'complete';

export function GuestSigningFlow({ agreement: initialAgreement }: GuestSigningFlowProps) {
  const [agreement, setAgreement] = useState(initialAgreement);
  const [step, setStep] = useState<SigningStep>('verifyIdentity');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const { toast } = useToast();

  // In a real flow, you would also need to identify WHICH composer is signing.
  // This would typically be part of the data fetched with the token.
  // For now, we'll assume the first composer is the guest.
  const signingComposer = agreement.composers[0];

  const handleSendCode = () => {
    // Simulate sending a code
    setIsCodeSent(true);
    toast({
      title: 'Verification Code Sent',
      description: `A 6-digit code has been sent to ${signingComposer.email}.`,
    });
  };

  const handleVerifyCode = () => {
    // Simulate code verification
    if (verificationCode === '123456') {
      toast({
        title: 'Email Verified!',
        description: 'You can now proceed to sign the document.',
      });
      setStep('sign');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The verification code is incorrect. Please try again.',
      });
    }
  };
  
  const handleSignAgreement = async () => {
    if (!signatureData || !termsAgreed) {
        toast({
            variant: 'destructive',
            title: 'Incomplete',
            description: 'Please provide your signature and agree to the terms.'
        });
        return;
    }
    try {
        await updateComposerSignature(agreement.id, signingComposer.id, signatureData);
        setStep('complete');
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save signature.' });
    }
  }
  
  const handleDownload = async () => {
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


  const renderStepContent = () => {
    switch (step) {
      case 'verifyIdentity':
        return (
          <div className="space-y-4 max-w-md mx-auto text-center">
             <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                    <Mail className="h-10 w-10 text-primary" />
                </div>
            </div>
            <h2 className="text-xl font-semibold">Verify Your Identity</h2>
            <p className="text-muted-foreground">To sign this document, please confirm you have access to the email address below.</p>
            <div className="p-4 bg-muted rounded-md text-center font-mono text-sm">{signingComposer.email}</div>
            {!isCodeSent ? (
              <Button onClick={handleSendCode} className="w-full">
                <KeyRound className="mr-2" />
                Send Verification Code
              </Button>
            ) : (
              <div className="space-y-4 pt-4">
                 <Label htmlFor="code" className="text-left block">Enter 6-digit code</Label>
                 <Input 
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                 />
                 <Button onClick={handleVerifyCode} className="w-full">Verify & Proceed</Button>
              </div>
            )}
          </div>
        );

      case 'sign':
        return (
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                     <DocumentLayout>
                        <AgreementDocument agreement={agreement} signers={agreement.composers} />
                     </DocumentLayout>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <PenLine className="h-6 w-6 text-primary" />
                            <h3 className="text-lg font-semibold">Sign the Agreement</h3>
                        </div>
                        <p className="text-muted-foreground">
                            You are signing as <span className="font-bold text-foreground">{signingComposer.name}</span>. 
                            Please draw your signature below.
                        </p>
                    </div>
                    <SignatureCanvas onSignatureEnd={setSignatureData} />
                    <div className="flex items-start space-x-3">
                        <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(!!checked)} className="mt-1" />
                        <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                            I have read the document and agree to the terms and conditions outlined.
                        </Label>
                    </div>
                    <Button onClick={handleSignAgreement} className="w-full" disabled={!signatureData || !termsAgreed}>
                        Apply Signature & Finalize
                    </Button>
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
                <Button onClick={handleDownload}>
                    <Download className="mr-2" />
                    Download Signed Agreement
                </Button>
            </div>
        )
    }
  };

  return (
    <Card className="max-w-7xl mx-auto">
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
