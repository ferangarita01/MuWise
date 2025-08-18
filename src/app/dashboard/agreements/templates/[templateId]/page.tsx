
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Download, Send, Share2, PenLine, BadgeCheck, FileText, UserPlus, Plus, Trash2, Pencil, Undo2, Link2, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function TemplatePage({ params }: { params: { templateId: string } }) {

  useEffect(() => {
    // This script block contains the logic from the user's HTML mockup.
    // It's included here to make the page interactive as per the design.
    const state = {
      selectedSigner: null,
      termsAccepted: false,
      signers: {
        client: { id: 'client', name: 'Ana Torres', role: 'Cliente', email: 'ana@example.com', signed: false, date: null, targetImgId: 'sig-client' },
        provider: { id: 'provider', name: 'DJ Nova', role: 'Proveedor', email: 'dj.nova@example.com', signed: false, date: null, targetImgId: 'sig-provider' }
      },
      extraSigners: []
    };

    // Elements
    const signerBtn = document.getElementById('signerSelectBtn');
    const signerMenu = document.getElementById('signerMenu');
    const extraSignerMenu = document.getElementById('extraSignerMenu');
    const signerLabel = document.getElementById('signerSelectLabel');
    const signerAvatar = document.getElementById('signerAvatar');
    const primarySignBtn = document.getElementById('primarySignBtn');
    const termsToggle = document.getElementById('termsToggle');
    const termsAcceptedInput = document.getElementById('termsAccepted');
    const termsIcon = document.getElementById('termsIcon');
    const statusBadge = document.getElementById('statusBadge');
    const allSignedBadge = document.getElementById('allSignedBadge');

    const sigClientImg = document.getElementById('sig-client');
    const sigProviderImg = document.getElementById('sig-provider');
    const sigClientEmpty = document.getElementById('sig-client-empty');
    const sigProviderEmpty = document.getElementById('sig-provider-empty');
    const sigClientDate = document.getElementById('sig-client-date');
    const sigProviderDate = document.getElementById('sig-provider-date');
    const extraSignaturesWrap = document.getElementById('extra-signatures');

    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');

    const addSignerBtn = document.getElementById('addSignerBtn');
    const addSignerForm = document.getElementById('addSignerForm');
    const newSignerName = document.getElementById('newSignerName') as HTMLInputElement;
    const newSignerEmail = document.getElementById('newSignerEmail') as HTMLInputElement;
    const newSignerRole = document.getElementById('newSignerRole') as HTMLSelectElement;
    const confirmAddSignerBtn = document.getElementById('confirmAddSignerBtn');
    const cancelAddSignerBtn = document.getElementById('cancelAddSignerBtn');
    const signersList = document.getElementById('signersList');

    function allSignersArray() {
      return [state.signers.client, state.signers.provider, ...state.extraSigners];
    }
    
    function setBadgeCompleted() {
        if (!statusBadge) return;
        statusBadge.innerHTML = `
            <span class="h-2 w-2 rounded-full" style="background-color: hsl(221.2 83.2% 53.3%);"></span>
            Completado
        `;
        statusBadge.setAttribute('style', 'border: 1px solid hsla(221.2,83.2%,53.3%,0.35); background-color: hsla(221.2,83.2%,53.3%,0.12); color: hsl(221.2 83.2% 53.3%);');
    }

    function updateAllSigned() {
        const allSigned = allSignersArray().every(s => s.signed);
        if (allSigned && allSignedBadge) {
            allSignedBadge.classList.remove('hidden');
            setBadgeCompleted();
        }
    }

    function calcProgress() {
        let pct = 0;
        if (state.selectedSigner) pct += 33.34;
        // @ts-ignore
        if (window.sig && !window.sig.isEmpty()) pct += 33.33;
        if (state.termsAccepted) pct += 33.33;
        return Math.min(100, Math.round(pct));
    }

    function updateProgress() {
        const pct = calcProgress();
        if(progressBar) progressBar.style.width = pct + '%';
        if(progressLabel) progressLabel.textContent = pct + '%';
    }
    
    // Custom dropdown behavior
    signerBtn?.addEventListener('click', () => signerMenu?.classList.toggle('hidden'));
    document.addEventListener('click', (e) => {
        if (signerBtn && !signerBtn.contains(e.target as Node) && signerMenu && !signerMenu.contains(e.target as Node)) {
            signerMenu.classList.add('hidden');
        }
    });

    signerMenu?.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button[data-signer]');
        if (!btn) return;
        const id = btn.getAttribute('data-signer');
        const s = allSignersArray().find(x => x.id === id) ?? state.signers.client;
        state.selectedSigner = s.id;
        if(signerLabel) signerLabel.textContent = `${s.role} — ${s.name}`;
        if(signerAvatar) signerAvatar.textContent = s.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
        signerMenu.classList.add('hidden');
        refreshPrimaryBtn();
        updateProgress();
    });

    termsToggle?.addEventListener('click', () => {
        (termsAcceptedInput as HTMLInputElement).checked = !(termsAcceptedInput as HTMLInputElement).checked;
        state.termsAccepted = (termsAcceptedInput as HTMLInputElement).checked;

        const box = termsToggle.querySelector('span.inline-flex.h-5.w-5');
        if (state.termsAccepted) {
            (box as HTMLElement).style.backgroundColor = 'hsl(221.2 83.2% 53.3%)';
            (box as HTMLElement).style.borderColor = 'hsl(221.2 83.2% 53.3%)';
            termsIcon?.classList.remove('hidden');
        } else {
            (box as HTMLElement).style.backgroundColor = 'hsl(217.2 32.6% 17.5%)';
            (box as HTMLElement).style.borderColor = 'hsla(210,40%,98%,0.25)';
            termsIcon?.classList.add('hidden');
        }
        refreshPrimaryBtn();
        updateProgress();
    });

    class SignatureCanvas {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        paths: any[];
        currentPath: any[];
        isDrawing: boolean;
        strokeStyle: string;
        lineWidth: number;
        
        constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d')!;
            this.paths = [];
            this.currentPath = [];
            this.isDrawing = false;
            this.strokeStyle = '#0f172a';
            this.lineWidth = 2.2;
            this.resize();
            this.attach();
            window.addEventListener('resize', this.resize.bind(this));
        }

        attach() {
            const c = this.canvas;
            c.addEventListener('pointerdown', this.onPointerDown.bind(this));
            c.addEventListener('pointermove', this.onPointerMove.bind(this));
            window.addEventListener('pointerup', this.onPointerUp.bind(this));
        }

        resize() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * ratio;
            this.canvas.height = rect.height * ratio;
            this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            this.redraw();
        }

        onPointerDown(e: PointerEvent) {
            const pos = this.getPos(e);
            this.isDrawing = true;
            this.currentPath = [pos];
            this.paths.push(this.currentPath);
            this.drawDot(pos);
        }

        onPointerMove(e: PointerEvent) {
            if (!this.isDrawing) return;
            const pos = this.getPos(e);
            this.currentPath.push(pos);
            this.redraw();
        }

        onPointerUp() {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            if (this.currentPath.length <= 1) {
                this.currentPath.push({ x: this.currentPath[0].x + 0.01, y: this.currentPath[0].y + 0.01 });
            }
            this.redraw();
            refreshPrimaryBtn();
            updateProgress();
        }

        getPos(e: PointerEvent) {
            const rect = this.canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        drawDot(p: { x: number, y: number }) {
            this.ctx.save();
            this.ctx.fillStyle = this.strokeStyle;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.lineWidth / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        redraw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.strokeStyle = this.strokeStyle;
            this.ctx.lineWidth = this.lineWidth;
            for (const path of this.paths) {
                if (path.length === 1) {
                    this.drawDot(path[0]);
                    continue;
                }
                this.ctx.beginPath();
                this.ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    this.ctx.lineTo(path[i].x, path[i].y);
                }
                this.ctx.stroke();
            }
        }
        
        clear() { this.paths = []; this.redraw(); refreshPrimaryBtn(); updateProgress(); }
        undo() { this.paths.pop(); this.redraw(); refreshPrimaryBtn(); updateProgress(); }
        isEmpty() { return this.paths.length === 0; }
        toDataURL() { return this.canvas.toDataURL('image/png'); }
    }

    const signaturePad = document.getElementById('signaturePad') as HTMLCanvasElement;
    if (signaturePad) {
      // @ts-ignore
      window.sig = new SignatureCanvas(signaturePad);
      // @ts-ignore
      document.getElementById('clearBtn')?.addEventListener('click', () => window.sig.clear());
      // @ts-ignore
      document.getElementById('undoBtn')?.addEventListener('click', () => window.sig.undo());
    }

    function refreshPrimaryBtn() {
      if (!primarySignBtn) return;
      // @ts-ignore
      const ready = !!state.selectedSigner && window.sig && !window.sig.isEmpty() && state.termsAccepted;
      (primarySignBtn as HTMLButtonElement).disabled = !ready;
    }

    function updateSignedBadge(el: HTMLElement | null) {
      if(!el) return;
      el.className = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';
      el.style.backgroundColor = 'hsla(221.2,83.2%,53.3%,0.12)';
      el.style.color = 'hsl(221.2 83.2% 53.3%)';
      el.style.border = '1px solid hsla(221.2,83.2%,53.3%,0.35)';
      el.innerHTML = '<span class="h-1.5 w-1.5 rounded-full" style="background-color: hsl(221.2 83.2% 53.3%);"></span> Firmado';
    }

    function applySignature() {
      if (!state.selectedSigner) return;
      const all = allSignersArray();
      const signer = all.find(s => s.id === state.selectedSigner);
      if (!signer) return;

      // @ts-ignore
      const dataUrl = window.sig.toDataURL();
      
      let imgEl, emptyEl, dateEl, statusEl, menuStatusEl;
      if (signer.id === 'client') {
          imgEl = sigClientImg; emptyEl = sigClientEmpty; dateEl = sigClientDate; statusEl = document.getElementById('status-client'); menuStatusEl = document.getElementById('menu-status-client');
      } else if (signer.id === 'provider') {
          imgEl = sigProviderImg; emptyEl = sigProviderEmpty; dateEl = sigProviderDate; statusEl = document.getElementById('status-provider'); menuStatusEl = document.getElementById('menu-status-provider');
      } else {
          imgEl = document.getElementById(signer.targetImgId);
          emptyEl = document.getElementById(`${signer.targetImgId}-empty`);
          dateEl = document.getElementById(`${signer.targetImgId}-date`);
          statusEl = document.getElementById(`status-${signer.id}`);
          menuStatusEl = document.getElementById(`menu-status-${signer.id}`);
      }

      if (imgEl) (imgEl as HTMLImageElement).src = dataUrl;
      imgEl?.classList.remove('hidden');
      emptyEl?.classList.add('hidden');

      signer.signed = true;
      signer.date = new Date();
      if(dateEl) dateEl.textContent = signer.date.toLocaleString();

      updateSignedBadge(statusEl);
      if (menuStatusEl) {
        menuStatusEl.textContent = 'Firmado';
        (menuStatusEl as HTMLElement).style.color = 'hsl(221.2 83.2% 53.3%)';
      }

      // @ts-ignore
      window.sig.clear();
      state.termsAccepted = false;
      (termsAcceptedInput as HTMLInputElement).checked = false;
      const box = termsToggle?.querySelector('span.inline-flex');
      if (box) {
          (box as HTMLElement).style.backgroundColor = 'hsl(217.2 32.6% 17.5%)';
          (box as HTMLElement).style.borderColor = 'hsla(210,40%,98%,0.25)';
      }
      termsIcon?.classList.add('hidden');

      refreshPrimaryBtn();
      updateProgress();
      updateAllSigned();
    }
    
    primarySignBtn?.addEventListener('click', applySignature);

    addSignerBtn?.addEventListener('click', () => addSignerForm?.classList.toggle('hidden'));
    cancelAddSignerBtn?.addEventListener('click', () => addSignerForm?.classList.add('hidden'));

    function createSignerRow(signer: any) {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between px-4 py-3';
        row.innerHTML = `...`; // Simplified for brevity
        signersList?.appendChild(row);
    }
    
    confirmAddSignerBtn?.addEventListener('click', () => {
        const name = newSignerName.value.trim();
        const email = newSignerEmail.value.trim();
        const role = newSignerRole.value.trim() || 'Invitado';
        if (!name || !email) return;

        const id = 's' + Date.now();
        const signer = { id, name, role, email, signed: false, date: null, targetImgId: 'sig-' + id };
        state.extraSigners.push(signer);
        // Functions to create DOM elements would be here
    });

  }, []);


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
                </div>
                <div id="signersList" className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10 text-foreground text-xs font-medium">AT</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Ana Torres <span className="text-xs text-muted-foreground">(Cliente)</span></p>
                        <p className="text-xs text-muted-foreground">ana@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span id="status-client" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-accent/10 text-accent border-accent/30"><span className="h-1.5 w-1.5 rounded-full bg-accent"></span> Pendiente</span>
                      <span id="date-client" className="text-xs text-muted-foreground"></span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10 text-foreground text-xs font-medium">DN</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">DJ Nova <span className="text-xs text-muted-foreground">(Proveedor)</span></p>
                        <p className="text-xs text-muted-foreground">dj.nova@example.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span id="status-provider" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-accent/10 text-accent border-accent/30"><span className="h-1.5 w-1.5 rounded-full bg-accent"></span> Pendiente</span>
                        <span id="date-provider" className="text-xs text-muted-foreground"></span>
                    </div>
                  </div>
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
                        <div className="rounded-lg border p-4">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Firma del Cliente</p>
                            <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-border bg-background">
                            <img id="sig-client" alt="Firma cliente" className="max-h-24 hidden invert" />
                            <span id="sig-client-empty" className="text-xs text-muted-foreground">Pendiente de firma</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Nombre: Ana Torres</span>
                            <span id="sig-client-date"></span>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Firma del Proveedor</p>
                            <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-border bg-background">
                            <img id="sig-provider" alt="Firma proveedor" className="max-h-24 hidden invert" />
                            <span id="sig-provider-empty" className="text-xs text-muted-foreground">Pendiente de firma</span>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Nombre: DJ Nova</span>
                            <span id="sig-provider-date"></span>
                            </div>
                        </div>
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
                    <Button id="signerSelectBtn" variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <span id="signerAvatar" className="hidden h-5 w-5 items-center justify-center rounded-full sm:inline-flex bg-muted text-xs font-medium">?</span>
                        <span id="signerSelectLabel">Seleccionar firmante</span>
                      </span>
                      <ChevronDown/>
                    </Button>
                    <div id="signerMenu" className="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-md border shadow-lg ring-1 ring-white/5 bg-popover border-border">
                      <button data-signer="client" className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-accent">
                        <span className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">AT</span>
                            Cliente — Ana Torres
                        </span>
                        <span id="menu-status-client" className="text-[10px] text-accent-foreground">Pendiente</span>
                      </button>
                       <button data-signer="provider" className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-accent">
                        <span className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">DN</span>
                           Proveedor — DJ Nova
                        </span>
                        <span id="menu-status-provider" className="text-[10px] text-accent-foreground">Pendiente</span>
                      </button>
                    </div>
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
                     <button id="termsToggle" type="button" className="group flex w-full items-start gap-3 rounded-md border p-3 text-left transition bg-background hover:bg-muted/50">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border border-primary transition">
                            <Check id="termsIcon" className="hidden h-4 w-4"/>
                        </span>
                        <span className="text-sm text-muted-foreground">
                        He leído y acepto los términos legales del acuerdo y autorizo el uso de mi firma electrónica.
                        </span>
                    </button>
                    <input id="termsAccepted" type="checkbox" className="hidden"/>
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
              <Button id="primarySignBtn" size="lg" className="w-full" disabled>
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
