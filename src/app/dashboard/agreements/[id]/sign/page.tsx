
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockAgreements } from '@/lib/data';
import type { Agreement } from '@/lib/types';
import { SignatureCanvas } from '@/components/signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, VenetianMask, UserCheck, ShieldCheck, Music, Download, Printer } from 'lucide-react';
import { DocumentLayout } from '@/components/document-layout';
import { DocumentHeader } from '@/components/document-header';
import { ComposerTable } from '@/components/composer-table';
import { LegalTerms } from '@/components/legal-terms';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function SigningPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;
  
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
    if (!selectedSigner || !signatureData || !termsAgreed) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please agree to the terms, select a signer, and provide a signature.',
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

    const signedCount = updatedAgreement.composers.filter(c => c.signature).length;
    const totalCount = updatedAgreement.composers.length;
    
    if (signedCount === totalCount) {
      updatedAgreement.status = 'Signed';
    } else {
      updatedAgreement.status = 'Partial';
    }
    
    setAgreement(updatedAgreement);
    setSignatureData(null);
    setTermsAgreed(false);

    const nextUnsigned = updatedAgreement.composers.find(c => !c.signature)?.id;
    if (nextUnsigned) {
      setSelectedSigner(nextUnsigned);
    } else {
      toast({
        title: 'All signatures complete!',
        description: 'This agreement is now fully executed.',
        className: 'bg-green-500 text-white'
      });
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  if (!agreement || !isClient) {
    return <div className="flex items-center justify-center h-screen">Loading Document...</div>;
  }

  const currentSigner = agreement.composers.find(c => c.id === selectedSigner);
  const unsignedComposers = agreement.composers.filter(c => !c.signature);
  const allSigned = unsignedComposers.length === 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto p-4 md:p-8 bg-muted/40 min-h-screen">
      {/* Left side: Document */}
      <div className="flex-grow lg:max-w-[70%]">
        <DocumentLayout>
            <DocumentHeader agreement={agreement} />
            
            <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider">SECTION 1 - COMPOSITION DETAILS</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2 font-semibold bg-gray-50 border-r w-1/4">Song Title</td>
                                <td className="p-2">{agreement.songTitle}</td>
                            </tr>
                             <tr className="border-b">
                                <td className="p-2 font-semibold bg-gray-50 border-r">Creation Date</td>
                                <td className="p-2">{new Date(agreement.createdAt).toLocaleDateString()}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2 font-semibold bg-gray-50 border-r">Performer Artists</td>
                                <td className="p-2">{agreement.performerArtists || 'N/A'}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2 font-semibold bg-gray-50 border-r">Duration</td>
                                <td className="p-2">{agreement.duration || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section>
                 <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider">SECTION 2 - LEGAL DECLARATION</h2>
                <p className="mt-2 text-sm italic">
                    We, the undersigned, hereby confirm our respective percentage of contribution and publishing company affiliations for the above-mentioned musical composition as detailed below:
                </p>
            </section>

             <section>
                 <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider">SECTION 3 - COMPOSERS & PUBLISHING</h2>
                 <ComposerTable composers={agreement.composers} />
            </section>
            
            <section>
                <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider">SECTION 4 - TERMS & CONDITIONS</h2>
                <LegalTerms />
            </section>

            <section>
                <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider">SECTION 5 - SIGNATURES</h2>
                <div className="mt-4 space-y-8">
                {agreement.composers.map(composer => (
                    <div key={composer.id}>
                        <p className="font-semibold">Composer: {composer.name}</p>
                        <div className="flex flex-col md:flex-row gap-8 mt-2">
                             <div className="flex-1">
                                {composer.signature ? (
                                    <img src={composer.signature} alt={`Signature of ${composer.name}`} className="h-12 border-b border-gray-400" />
                                ) : (
                                    <div className="h-12 border-b border-gray-400"></div>
                                )}
                                <p className="text-xs text-gray-600">Signature</p>
                             </div>
                             <div className="w-48">
                                {composer.signedAt ? (
                                    <p className="h-12 pt-5 border-b border-gray-400">{new Date(composer.signedAt).toLocaleDateString()}</p>
                                ) : (
                                    <div className="h-12 border-b border-gray-400"></div>
                                )}
                                 <p className="text-xs text-gray-600">Date</p>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </section>

        </DocumentLayout>
         <div className="flex justify-end gap-2 mt-4 print:hidden">
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2"/> Print</Button>
            <Button variant="outline"><Download className="mr-2"/> Download PDF</Button>
        </div>
      </div>

      {/* Right side: Signing Panel */}
      <div className="lg:w-[30%] lg:max-w-[400px] flex-shrink-0 print:hidden">
        <Card className="sticky top-8 shadow-lg">
            <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Music className="text-primary"/>
                    DIGITAL SIGNATURE PROCESS
                </CardTitle>
            </CardHeader>
             <CardContent className="p-6 space-y-6">
                {allSigned ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold">Agreement Fully Signed</h3>
                        <p className="text-muted-foreground">This document is now complete and legally binding.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <Label htmlFor="signer-select" className="text-xs uppercase font-semibold">Step 1: Select Your Name</Label>
                            <Select value={selectedSigner} onValueChange={setSelectedSigner}>
                                <SelectTrigger id="signer-select" className="mt-1">
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
                        
                        {currentSigner && (
                           <>
                             <Separator />
                             <div>
                                 <h4 className="text-xs uppercase font-semibold mb-2">Step 2: Confirm & Sign</h4>
                                <div className="text-sm space-y-1 bg-primary/5 p-3 rounded-md border border-primary/20">
                                    <p>Signing for: <span className="font-bold">{currentSigner.name}</span></p>
                                    <p>Email: <span className="font-bold">{currentSigner.email}</span></p>
                                    <p>Share: <span className="font-bold">{currentSigner.share}%</span></p>
                                </div>
                             </div>
                            <div className="space-y-2">
                                <Label>Step 3: Draw Your Signature</Label>
                                <SignatureCanvas key={selectedSigner} onSignatureEnd={setSignatureData} />
                            </div>
                            <div className="flex items-start space-x-3">
                                <Checkbox id="terms" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(!!checked)} className="mt-1" />
                                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                                    I have read the document and agree to the terms and conditions outlined above.
                                </Label>
                            </div>
                            <p className="text-xs text-center text-muted-foreground pt-2">
                                By signing, you certify your identity and your intent to sign this agreement electronically.
                            </p>
                           </>
                        )}
                    </>
                )}
            </CardContent>

            {!allSigned && (
                <CardFooter>
                    <Button 
                        onClick={handleSignAgreement} 
                        disabled={!selectedSigner || !signatureData || !termsAgreed} 
                        className="w-full text-base py-6"
                    >
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Sign & Finalize Agreement
                    </Button>
                </CardFooter>
            )}
             {allSigned && (
                  <CardFooter>
                     <Button onClick={() => router.push('/dashboard')} className="w-full">
                        Back to Dashboard
                    </Button>
                  </CardFooter>
                )}
        </Card>
      </div>
    </div>
  );
}

    