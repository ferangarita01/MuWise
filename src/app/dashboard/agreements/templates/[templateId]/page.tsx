
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Send, Share2, FileText, Link2, Check, Loader2, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { AgreementDocument } from '@/components/agreement-document';
import type { Agreement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sendSignatureRequest } from '@/ai/actions';
import { Badge } from '@/components/ui/badge';
import { getAgreement, generateSigningLink } from '@/lib/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FormattedDate } from '@/components/formatted-date';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function TemplatePage() {
  const params = useParams();
  const templateId = params.templateId as string;
  const [agreement, setAgreement] = React.useState<Agreement | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [requestEmail, setRequestEmail] = React.useState('');
  const [isSendingRequest, setIsSendingRequest] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadAgreement() {
      if (!templateId) return;
      setLoading(true);
      try {
        // Fetch the initial agreement
        const fetchedAgreement = await getAgreement(templateId);
        if (fetchedAgreement) {
          setAgreement(fetchedAgreement as Agreement);
        } else {
           toast({ variant: 'destructive', title: 'Error', description: `Agreement with ID ${templateId} not found.`});
        }
      } catch (error) {
        console.error("Failed to fetch agreement", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load agreement data.'});
      } finally {
        setLoading(false);
      }
    }
    loadAgreement();
  }, [templateId, toast]);


  const handleSaveDraft = () => {
    console.log("Saving draft...", { agreement });
    toast({
        title: "Draft Saved!",
        description: "Your agreement has been saved as a draft.",
    });
  };

  const handleSendRequest = async () => {
    if (!agreement) return;
    if (!requestEmail || !/\S+@\S+\.\S+/.test(requestEmail)) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
        return;
    }

    const signer = agreement.composers.find(s => s.email === requestEmail);
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
     if (!agreement) return;
    if (!requestEmail || !/\S+@\S+\.\S+/.test(requestEmail)) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address to generate a link.' });
        return;
    }
    const signer = agreement.composers.find(s => s.email === requestEmail);
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

  if (loading) {
    return <div className="text-center p-20"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/></div>;
  }
  
  if (!agreement) {
      return <div className="text-center p-20">Agreement not found.</div>;
  }
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  const getSignatureProgress = () => {
    const signers = agreement.composers;
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
          <span className="ml-2">Compartir</span>
        </Button>
        <Badge id="statusBadge" variant={agreement.status === 'Signed' ? 'default' : 'outline'} className={agreement.status === 'Signed' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
          {agreement.status}
        </Badge>
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
             <AgreementDocument agreement={agreement} />
          </div>
        </div>
         <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              Guardar Borrador
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
      </section>

      <aside className="lg:col-span-4 lg:sticky lg:top-6">
        <div className="space-y-6">
           <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Estado de Firmas</CardTitle>
                    <span id="progressLabel" className="text-xs font-medium text-muted-foreground">{Math.round(progress)}% Completado</span>
                </div>
                 <div id="progressBar" className="h-1.5 w-full overflow-hidden rounded-full bg-secondary mt-3">
                    <div className="h-full bg-primary transition-all" style={{width: `${progress}%`}}></div>
                </div>
             </CardHeader>
             <CardContent className="space-y-3">
              <TooltipProvider>
                {agreement.composers.map(signer => (
                  <div key={signer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(signer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{signer.name}</p>
                        <p className="text-xs text-muted-foreground">{signer.email}</p>
                      </div>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger>
                        {signer.signature ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="text-xs">Firmado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs">Pendiente</span>
                          </div>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {signer.signedAt ? (
                           <p>Firmado el <FormattedDate dateString={signer.signedAt} options={{dateStyle: 'long', timeStyle: 'short'}} /></p>
                        ) : (
                          <p>Aún no ha firmado</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </TooltipProvider>
             </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Solicitar Firmas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Introduce el email de un firmante para enviarle una solicitud o generar un enlace único para firmar.
                </p>
                <Input 
                  id="requestEmail" 
                  type="email" 
                  placeholder="nombre@ejemplo.com"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  disabled={isSendingRequest}
                />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button id="requestBtn" className="w-full" onClick={handleSendRequest} disabled={isSendingRequest || !requestEmail}>
                        {isSendingRequest ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-4 w-4"/> Enviar Email</>}
                    </Button>
                    <Button id="copyLinkBtn" variant="secondary" className="w-full" onClick={handleCopyLink} disabled={isSendingRequest || !requestEmail}>
                        {isSendingRequest ? <Loader2 className="animate-spin" /> : <><Link2 className="mr-2 h-4 w-4"/> Copiar Enlace</>}
                    </Button>
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle className="text-base">Acciones Finales</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button id="downloadBtn" variant="outline" size="lg" className="w-full">
                <Download className="mr-2 h-4 w-4"/> Descargar Certificado
              </Button>
              <Button variant="secondary" size="lg" className="w-full">
                <BadgeCheck className="mr-2 h-4 w-4"/> Verificar en Blockchain (Pronto)
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </main>
  </div>
  );
}

    