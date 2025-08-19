
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Download, Send, Share2, PenLine, FileText, UserPlus, Plus, Trash2, Pencil, Undo2, Link2, Check, ChevronDown, Save, Loader2, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { AgreementDocument } from '@/components/agreement-document';
import type { Agreement, Composer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FormattedDate } from '@/components/formatted-date';
import { sendSignatureRequest } from '@/ai/flows/send-signature-request';
import { Badge } from '@/components/ui/badge';
import { updateComposerSignature, generateSigningLink } from '@/lib/actions';
import { SignatureCanvas } from '@/components/signature-canvas';

const initialAgreementData: Agreement = {
    id: 'dj-service-agreement',
    songTitle: 'Contrato de Prestación de Servicios de DJ',
    publicationDate: new Date().toISOString(),
    performerArtists: 'DJ Nova',
    duration: 'N/A',
    composers: [
      { id: 'C1', name: 'Ana Torres', role: 'Cliente', share: 0, email: 'ana@example.com', publisher: 'N/A' },
      { id: 'C2', name: 'DJ Nova', role: 'Proveedor', share: 100, email: 'dj.nova@example.com', publisher: 'N/A' },
    ],
    status: 'Draft',
    createdAt: new Date().toISOString(),
};


export default function TemplatePage({ params }: { params: { templateId: string } }) {
  const { templateId } = params;
  const [agreement, setAgreement] = React.useState<Agreement>(initialAgreementData);
  const [signers, setSigners] = React.useState<Composer[]>(agreement.composers);
  const [selectedSignerId, setSelectedSignerId] = React.useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isAddSignerFormVisible, setIsAddSignerFormVisible] = React.useState(false);
  const [requestEmail, setRequestEmail] = React.useState('');
  const [isSendingRequest, setIsSendingRequest] = React.useState(false);
  const { toast } = useToast();
  
  const [newSignerName, setNewSignerName] = React.useState('');
  const [newSignerEmail, setNewSignerEmail] = React.useState('');
  const [newSignerRole, setNewSignerRole] = React.useState('Invitado');
  const [signatureData, setSignatureData] = React.useState<string | null>(null);
  const [isSigning, setIsSigning] = React.useState(false);

  const signatureCanvasRef = React.useRef<{ clear: () => void; getSignature: () => string | null }>(null);


  const handleSignDocument = async () => {
    if (!selectedSignerId || !signatureData || !termsAccepted) {
      toast({ variant: 'destructive', title: 'Faltan campos', description: 'Por favor, selecciona un firmante, dibuja tu firma y acepta los términos.' });
      return;
    }

    setIsSigning(true);
    try {
      await updateComposerSignature(agreement.id, selectedSignerId, signatureData);
      
      const updatedSigners = signers.map(s => 
        s.id === selectedSignerId 
          ? { ...s, signature: signatureData, signedAt: new Date().toISOString() } 
          : s
      );
      setSigners(updatedSigners);

      const allSigned = updatedSigners.every(s => s.signature);
      setAgreement(prev => ({ ...prev, status: allSigned ? 'Signed' : 'Partial' }));
      
      toast({ title: '¡Firmado!', description: 'El documento ha sido firmado exitosamente.' });
      
      // Reset flow
      setSelectedSignerId(null);
      setSignatureData(null);
      signatureCanvasRef.current?.clear();
      setTermsAccepted(false);

    } catch (error) {
      const message = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
      toast({ variant: 'destructive', title: 'Error al firmar', description: message });
    } finally {
      setIsSigning(false);
    }
  };


  const handleAddSigner = () => {
    if (!newSignerName || !newSignerEmail) {
      toast({ title: 'Error', description: 'Please fill out all fields for the new signer.', variant: 'destructive' });
      return;
    }
    const newSigner: Composer = {
      id: 's' + Date.now(),
      name: newSignerName,
      role: newSignerRole as any,
      share: 0,
      email: newSignerEmail,
      publisher: 'N/A',
    };
    setSigners(prev => [...prev, newSigner]);
    setNewSignerName('');
    setNewSignerEmail('');
    setNewSignerRole('Invitado');
    setIsAddSignerFormVisible(false);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...", { agreement, signers });
    toast({
        title: "Draft Saved!",
        description: "Your agreement has been saved as a draft.",
    });
  };

  const handleSendRequest = async () => {
    if (!requestEmail || !/\S+@\S+\.\S+/.test(requestEmail)) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
        return;
    }

    const signer = signers.find(s => s.email === requestEmail);
    if (!signer) {
        toast({ variant: 'destructive', title: 'Signer not found', description: 'This email does not belong to any signer on this agreement.' });
        return;
    }

    setIsSendingRequest(true);
    try {
        const result = await sendSignatureRequest({
            agreementId: agreement.id,
            signerId: signer.id,
            signerEmail: signer.email
        });

        if (result.status === 'success') {
            toast({
                title: 'Request Sent!',
                description: result.message
            });
            setRequestEmail('');
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        toast({ variant: 'destructive', title: 'Failed to Send', description: message });
    } finally {
        setIsSendingRequest(false);
    }
  };


  const handleCopyLink = async () => {
    if (!requestEmail || !/\S+@\S+\.\S+/.test(requestEmail)) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address to generate a link.' });
        return;
    }
    const signer = signers.find(s => s.email === requestEmail);
     if (!signer) {
        toast({ variant: 'destructive', title: 'Signer not found', description: 'This email does not belong to any signer on this agreement.' });
        return;
    }
    
    setIsSendingRequest(true);
    try {
        const link = await generateSigningLink(agreement.id, signer.id);
        await navigator.clipboard.writeText(link);
        toast({ title: 'Link Copied', description: 'Signing link has been copied to your clipboard.' });
    } catch(err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Failed to Copy Link', description: message });
    } finally {
        setIsSendingRequest(false);
    }
  };


  const selectedSigner = signers.find(s => s.id === selectedSignerId);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
  
  const getSignatureProgress = () => {
    const signedCount = signers.filter(s => s.signature).length;
    const totalCount = signers.length;
    return totalCount > 0 ? (signedCount / totalCount) * 100 : 0;
  };
  const progress = getSignatureProgress();

  return (
    <div className="relative max-w-7xl mr-auto ml-auto pt-6 pr-4 pb-6 pl-4">

    <header className="mb-6 flex items-center justify-between rounded-xl border px-3 py-3 backdrop-blur bg-muted/60 border-border">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline">
            <Link href="/dashboard">
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
        <span id="statusBadge" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border bg-accent/10 text-accent border-accent/30">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          En progreso
        </span>
      </div>
    </header>

    <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section id="documentColumn" className="lg:col-span-8 flex flex-col gap-6">
        <div className="rounded-xl border shadow-sm ring-1 ring-white/5 bg-muted border-border">
          <div className="overflow-hidden rounded-t-xl">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1670852714979-f73d21652a83?w=2560&q=80" alt="Mountains header" data-ai-hint="mountains landscape" className="h-40 w-full object-cover sm:h-44 md:h-48"/>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                 <div className="flex items-end justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium border-foreground/15 text-foreground/80 bg-foreground/5">Contrato</div>
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-foreground">{agreement.songTitle}</h1>
                        <p className="mt-1 text-sm text-foreground/75">Un acuerdo estándar para contratar un DJ para un evento o presentación.</p>
                    </div>
                    <div className="hidden items-center gap-2 md:flex text-foreground/70">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-medium">ID: {templateId}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div id="doc-scroll" className="max-h-[72vh] overflow-auto px-6 pb-6">
             <AgreementDocument agreement={agreement} signers={signers} />
          </div>
        </div>
         <div className="flex justify-end">
            <Button onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
          </div>
      </section>

      <aside className="lg:col-span-4 lg:sticky lg:top-6">
        <div className="space-y-6">
           <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Flujo de firma</CardTitle>
                    <span id="progressLabel" className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                 <div id="progressBar" className="h-1.5 w-full overflow-hidden rounded-full bg-secondary mt-3">
                    <div className="h-full bg-primary transition-all" style={{width: `${progress}%`}}></div>
                </div>
             </CardHeader>
             <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">1</span>
                    <span className="text-sm font-medium">Selecciona quién firma</span>
                  </div>
                  <div className="relative">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span className="flex items-center gap-2">
                                <span className="hidden h-5 w-5 items-center justify-center rounded-full sm:inline-flex bg-muted text-xs font-medium">
                                    {selectedSigner ? getInitials(selectedSigner.name) : '?'}
                                </span>
                                <span>{selectedSigner ? `${selectedSigner.role} — ${selectedSigner.name}` : 'Seleccionar firmante'}</span>
                                </span>
                                <ChevronDown/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {signers.map(signer => (
                                <DropdownMenuItem key={signer.id} onSelect={() => setSelectedSignerId(signer.id)} disabled={!!signer.signature}>
                                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium mr-2">
                                        {getInitials(signer.name)}
                                     </span>
                                     <span>{signer.role} — {signer.name}</span>
                                     {signer.signature && <Check className="ml-auto h-4 w-4 text-green-500" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                   <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">2</span>
                        <span className="text-sm font-medium">Dibuja tu firma</span>
                    </div>
                    <SignatureCanvas onSignatureEnd={setSignatureData} ref={signatureCanvasRef} />
                </div>
                
                 <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">3</span>
                        <span className="text-sm font-medium">Acepta los términos</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                        >
                            He leído y acepto los términos legales.
                        </label>
                    </div>
                 </div>
             </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Acciones</CardTitle>
                    <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5"/> Auto-save
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button id="primarySignBtn" size="lg" className="w-full" onClick={handleSignDocument} disabled={!selectedSignerId || !termsAccepted || !signatureData || isSigning}>
                {isSigning ? <Loader2 className="animate-spin" /> : <PenLine/>} 
                {isSigning ? 'Firmando...' : 'Firmar documento'}
              </Button>
              <Button id="downloadBtn" variant="secondary" size="lg" className="w-full">
                <Download/> Descargar PDF
              </Button>
              <Button variant="outline" size="lg" className="w-full" disabled>
                <BadgeCheck/> Certificado digital (pronto)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Solicitar firmas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <Input 
                  id="requestEmail" 
                  type="email" 
                  placeholder="recipient@example.com"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  disabled={isSendingRequest}
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button id="requestBtn" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSendRequest} disabled={isSendingRequest}>
                        {isSendingRequest ? <Loader2 className="animate-spin" /> : <><Send/> Enviar solicitud</>}
                    </Button>
                    <Button id="copyLinkBtn" variant="secondary" className="w-full" onClick={handleCopyLink} disabled={isSendingRequest}>
                        {isSendingRequest ? <Loader2 className="animate-spin" /> : <><Link2/> Copiar enlace</>}
                    </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </main>
  </div>
  );
}
