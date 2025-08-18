
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Download, Send, Share2, PenLine, BadgeCheck, FileText, UserPlus, Plus, Trash2, Pencil, Undo2, Link2, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const initialSigners = [
    { id: 'client', name: 'Ana Torres', role: 'Cliente', email: 'ana@example.com', signed: false, date: null, targetImgId: 'sig-client' },
    { id: 'provider', name: 'DJ Nova', role: 'Proveedor', email: 'dj.nova@example.com', signed: false, date: null, targetImgId: 'sig-provider' }
];

export default function TemplatePage({ params }: { params: { templateId: string } }) {
  const [signers, setSigners] = useState(initialSigners);
  const [selectedSignerId, setSelectedSignerId] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAddSignerFormVisible, setIsAddSignerFormVisible] = useState(false);
  
  // State for the new signer form
  const [newSignerName, setNewSignerName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerRole, setNewSignerRole] = useState('Invitado');
  
  // Signature pad state would go here, for now we simulate it.
  // const [isSignaturePadEmpty, setIsSignaturePadEmpty] = useState(true);
  
  const handleAddSigner = () => {
    if (!newSignerName || !newSignerEmail) {
      alert('Please fill out all fields for the new signer.');
      return;
    }
    const newSigner = {
      id: 's' + Date.now(),
      name: newSignerName,
      role: newSignerRole,
      email: newSignerEmail,
      signed: false,
      date: null,
      targetImgId: 'sig-s' + Date.now()
    };
    setSigners(prev => [...prev, newSigner]);
    setNewSignerName('');
    setNewSignerEmail('');
    setNewSignerRole('Invitado');
    setIsAddSignerFormVisible(false);
  };

  const selectedSigner = signers.find(s => s.id === selectedSignerId);

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
            <span className="text-sm font-medium tracking-tight text-foreground">Service Contract for DJs</span>
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
      <section id="documentColumn" className="lg:col-span-8">
        <div className="rounded-xl border shadow-sm ring-1 ring-white/5 bg-muted border-border">
          <div className="overflow-hidden rounded-t-xl">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1670852714979-f73d21652a83?w=2560&q=80" alt="Mountains header" data-ai-hint="mountains landscape" className="h-40 w-full object-cover sm:h-44 md:h-48"/>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium border-foreground/15 text-foreground/80 bg-foreground/5">Contrato</div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl text-foreground">Service Contract for DJs</h1>
                    <p className="mt-1 text-sm text-foreground/75">Un acuerdo estándar para contratar un DJ para un evento o presentación.</p>
                  </div>
                  <div className="hidden items-center gap-2 md:flex text-foreground/70">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium">ID: AGR-98231</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div id="doc-scroll" className="max-h-[72vh] overflow-auto px-6 pb-6">
            <article id="doc-wrapper" className="mx-auto max-w-3xl">
              <div className="mb-6 rounded-lg border ring-1 ring-white/5 bg-muted border-border">
                <div className="flex items-center justify-between border-b px-4 py-3 border-border">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Firmantes</h2>
                   <div className="flex items-center gap-2">
                    {signers.every(s => s.signed) && (
                        <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/30">Todos firmaron</span>
                    )}
                    <Button size="sm" onClick={() => setIsAddSignerFormVisible(prev => !prev)} className="py-1.5 h-auto text-xs">
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Añadir firmante
                    </Button>
                  </div>
                </div>
                {isAddSignerFormVisible && (
                    <div className="border-b px-4 py-3 border-border">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                        <div className="md:col-span-4">
                            <Input value={newSignerName} onChange={e => setNewSignerName(e.target.value)} placeholder="Nombre completo" className="h-9"/>
                        </div>
                        <div className="md:col-span-4">
                            <Input value={newSignerEmail} onChange={e => setNewSignerEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com" className="h-9"/>
                        </div>
                        <div className="md:col-span-2">
                            <Input value={newSignerRole} onChange={e => setNewSignerRole(e.target.value)} placeholder="Rol" className="h-9"/>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                        <Button onClick={handleAddSigner} size="sm" className="w-full"><Plus className="h-4 w-4" /> Agregar</Button>
                        <Button onClick={() => setIsAddSignerFormVisible(false)} size="sm" variant="ghost" className="w-full">Cancelar</Button>
                        </div>
                    </div>
                    </div>
                )}
                <div id="signersList" className="divide-y divide-border">
                  {signers.map(signer => (
                      <div key={signer.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10 text-foreground text-xs font-medium">
                                {signer.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                            <p className="text-sm font-medium text-foreground">{signer.name} <span className="text-xs text-muted-foreground">({signer.role})</span></p>
                            <p className="text-xs text-muted-foreground">{signer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {signer.signed ? (
                                <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10">
                                    <BadgeCheck className="h-3 w-3 mr-1" />
                                    Firmado
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10">
                                    <Clock className="h-3 w-3 mr-1" />
                                     Pendiente
                                </Badge>
                            )}
                        <span className="text-xs text-muted-foreground">{signer.date ? new Date(signer.date).toLocaleString() : ''}</span>
                        </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="leading-relaxed ring-1 ring-white/5 border rounded-lg p-5 bg-card border-border text-card-foreground">
                <div className="prose prose-sm prose-invert max-w-none">
                    <p>This DJ Service Contract (the "Agreement") is made effective as of {'{{Date}}'}, by and between {'{{Client_Name}}'} ("Client") and {'{{DJ_Name}}'} ("DJ").</p>
                    <ol>
                        <li><strong>Services.</strong> The DJ will provide music and entertainment services for the event detailed below:<br/>Event: {'{{Event_Type}}'}<br/>Date: {'{{Event_Date}}'}<br/>Time: {'{{Event_Time}}'}<br/>Location: {'{{Event_Location}}'}</li>
                        <li><strong>Payment.</strong> The Client agrees to pay the DJ a total fee of {'{{Total_Fee}}'}. A non-refundable deposit of {'{{Deposit_Amount}}'} is due upon signing this Agreement. The remaining balance is due on the day of the event.</li>
                        <li><strong>Cancellation.</strong> If the Client cancels the event less than 30 days prior, the full amount will be due. If the DJ cancels, the deposit will be fully refunded.</li>
                        <li><strong>Equipment.</strong> The DJ will provide all necessary equipment to perform the services. The Client must provide a safe location with adequate power.</li>
                        <li><strong>Indemnification.</strong> The Client agrees to indemnify and hold the DJ harmless from any liability, claims, or damages arising from the event, except for those caused by the DJ's gross negligence.</li>
                    </ol>
                    <h3>Firmas</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {signers.map(signer => (
                             <div key={signer.targetImgId} className="rounded-lg border p-4">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Firma del {signer.role}</p>
                                <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-border bg-background">
                                    {signer.signed ? (
                                        <img id={signer.targetImgId} alt={`Firma ${signer.name}`} className="max-h-24 invert" />
                                    ) : (
                                        <span id={`${signer.targetImgId}-empty`} className="text-xs text-muted-foreground">Pendiente de firma</span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>Nombre: {signer.name}</span>
                                <span id={`${signer.targetImgId}-date`}>{signer.date ? new Date(signer.date).toLocaleDateString() : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <aside className="lg:col-span-4 lg:sticky lg:top-6">
        <div className="space-y-6">
           <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Flujo de firma</CardTitle>
                    <span id="progressLabel" className="text-xs font-medium text-muted-foreground">0%</span>
                </div>
                 <div id="progressBar" className="h-1.5 w-full overflow-hidden rounded-full bg-secondary mt-3">
                    <div className="h-full bg-primary transition-all" style={{width: '0%'}}></div>
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
                                    {selectedSigner ? selectedSigner.name.split(' ').map(p=>p[0]).join('') : '?'}
                                </span>
                                <span>{selectedSigner ? `${selectedSigner.role} — ${selectedSigner.name}` : 'Seleccionar firmante'}</span>
                                </span>
                                <ChevronDown/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {signers.map(signer => (
                                <DropdownMenuItem key={signer.id} onSelect={() => setSelectedSignerId(signer.id)}>
                                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium mr-2">
                                        {signer.name.split(' ').map(p=>p[0]).join('')}
                                     </span>
                                     <span>{signer.role} — {signer.name}</span>
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
                    <div className="rounded-lg border bg-background">
                         <div className="flex items-center justify-between border-b p-2">
                            <span className="text-xs text-muted-foreground">Usa tu mouse o dedo</span>
                            <div className="flex gap-2">
                                <Button id="undoBtn" variant="ghost" size="sm"><Undo2 className="h-3.5 w-3.5 mr-1"/> Deshacer</Button>
                                <Button id="clearBtn" variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5 mr-1"/> Limpiar</Button>
                            </div>
                        </div>
                        <div className="p-2">
                            <canvas id="signaturePad" className="block h-44 w-full cursor-crosshair rounded-md bg-white"></canvas>
                        </div>
                    </div>
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
              <Button id="primarySignBtn" size="lg" className="w-full" disabled={!selectedSignerId || !termsAccepted}>
                <PenLine/> Firmar documento
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
                <Input id="requestEmail" type="email" placeholder="recipient@example.com"/>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button id="requestBtn" className="w-full bg-accent text-accent-foreground hover:bg-accent/90"><Send/> Enviar solicitud</Button>
                    <Button id="copyLinkBtn" variant="secondary" className="w-full"><Link2/> Copiar enlace</Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </main>
  </div>
  );
}
