
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockAgreements } from '@/lib/data';
import type { Agreement, Composer } from '@/lib/types';
import { SignatureCanvas } from '@/components/signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, VenetianMask, FileText, Send } from 'lucide-react';

export default function SigningPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);

  useEffect(() => {
    const foundAgreement = mockAgreements.find((a) => a.id === agreementId);
    if (foundAgreement) {
      setAgreement(foundAgreement);
      const firstUnsigned = foundAgreement.composers.find(c => !c.signature)?.id;
      if (firstUnsigned) {
        setSelectedSigner(firstUnsigned);
      }
    } else {
      router.push('/dashboard');
    }
  }, [agreementId, router]);

  const handleSignAgreement = () => {
    if (!selectedSigner || !signatureData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a signer and provide a signature.',
      });
      return;
    }

    // This is where you would typically call a server action to save the signature
    console.log({
      agreementId,
      composerId: selectedSigner,
      signature: signatureData,
      signedAt: new Date().toISOString(),
    });
    
    toast({
        title: 'Agreement Signed!',
        description: `${agreement?.composers.find(c=>c.id === selectedSigner)?.name} has signed the agreement.`,
    });

    // Simulate updating the mock data
    const updatedAgreement = { ...agreement! };
    const signerIndex = updatedAgreement.composers.findIndex(c => c.id === selectedSigner);
    updatedAgreement.composers[signerIndex].signature = signatureData;
    updatedAgreement.composers[signerIndex].signedAt = new Date().toISOString();

    const allSigned = updatedAgreement.composers.every(c => c.signature);
    if (allSigned) {
      updatedAgreement.status = 'Signed';
    } else {
      updatedAgreement.status = 'Sent';
    }
    
    setAgreement(updatedAgreement);

    // Find the next person to sign or go back to dashboard
    const nextUnsigned = updatedAgreement.composers.find(c => !c.signature)?.id;
    if (nextUnsigned) {
      setSelectedSigner(nextUnsigned);
    } else {
      toast({
        title: 'All signatures complete!',
        description: 'This agreement is now fully executed.',
        className: 'bg-green-500 text-white'
      });
      router.push('/dashboard');
    }
  };
  
  const handleSendForSignature = () => {
    if (!agreement) return;
    
    agreement.status = 'Sent';
    setAgreement({...agreement});

    toast({
      title: 'Agreement Sent',
      description: 'Invitations have been sent to all composers.',
    });
  }

  if (!agreement) {
    return <div>Loading...</div>;
  }

  const currentSigner = agreement.composers.find(c => c.id === selectedSigner);
  const unsignedComposers = agreement.composers.filter(c => !c.signature);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">Sign Agreement</h1>
          <p className="text-muted-foreground">
            Review the agreement details and provide your signature.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> {agreement.songTitle}</CardTitle>
                    <CardDescription>Created on: {new Date(agreement.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="whitespace-pre-wrap font-mono bg-muted p-4 rounded-md">
                        <h3 className="font-bold text-lg mb-2">SPLIT AGREEMENT</h3>
                        <p><strong>Song Title:</strong> {agreement.songTitle}</p>
                        <hr className="my-2 border-dashed" />
                        <h4 className="font-bold mt-4">Composers & Shares:</h4>
                        <ul>
                            {agreement.composers.map(c => (
                                <li key={c.id} className="ml-4 py-1">{c.name} ({c.email}) - {c.share}%</li>
                            ))}
                        </ul>
                         <hr className="my-2 border-dashed" />
                         <h4 className="font-bold mt-4">Signatures:</h4>
                          <ul>
                            {agreement.composers.map(c => (
                                <li key={c.id} className="ml-4 py-1 flex items-center gap-2">
                                  {c.signature 
                                    ? <CheckCircle className="text-green-500" />
                                    : <VenetianMask className="text-muted-foreground" />
                                  }
                                  <span>{c.name} - {c.signature ? `Signed on ${new Date(c.signedAt!).toLocaleString()}` : 'Awaiting Signature'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Signature Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {agreement.status === 'Draft' && (
                        <Button onClick={handleSendForSignature} className="w-full">
                            <Send className="mr-2 h-4 w-4"/> Send for Signatures
                        </Button>
                    )}

                    {agreement.status !== 'Draft' && (
                        <>
                             <div>
                                <Label htmlFor="signer-select">Select Your Name</Label>
                                <Select value={selectedSigner} onValueChange={setSelectedSigner} disabled={unsignedComposers.length === 0}>
                                <SelectTrigger id="signer-select">
                                    <SelectValue placeholder="Select signer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {unsignedComposers.map((composer) => (
                                    <SelectItem key={composer.id} value={composer.id}>
                                        {composer.name}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                            {currentSigner && !currentSigner.signature && (
                                <div className="space-y-2">
                                <Label>Draw Your Signature</Label>
                                <SignatureCanvas onSignatureEnd={setSignatureData} />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
                {agreement.status !== 'Draft' && agreement.status !== 'Signed' && (
                    <CardFooter>
                        <Button onClick={handleSignAgreement} disabled={!selectedSigner || !signatureData} className="w-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Sign Agreement
                        </Button>
                    </CardFooter>
                )}
                {agreement.status === 'Signed' && (
                  <CardFooter className="flex-col gap-4">
                    <p className="text-green-600 font-semibold text-center">This agreement is fully signed and executed.</p>
                     <Button onClick={() => router.push('/dashboard')} className="w-full">
                        Back to Dashboard
                    </Button>
                  </CardFooter>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
