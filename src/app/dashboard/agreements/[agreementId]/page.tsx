
'use client';

import { useRef, useEffect, useState } from 'react';
import { AgreementHeader } from '@/components/agreement/agreement-header';
import { AgreementActions } from '@/components/agreement/agreement-actions';
import { SignersTable } from '@/components/agreement/signers-table';
import { toast } from '@/hooks/use-toast';
import { contractData } from '@/app/dashboard/agreements/page';
import type { Contract } from '@/lib/types';
import { DocumentHeader } from '@/components/document-header';
import { LegalTerms } from '@/components/legal-terms';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    html2pdf: any;
  }
}

export default function AgreementPage({ params }: { params: { agreementId: string } }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const agreement = contractData.find(c => c.id === params.agreementId);
  const { userProfile, loading: profileLoading } = useUserProfile();
  
  // State to manage signers initialization
  const [isReady, setIsReady] = useState(false);


  useEffect(() => {
    if (!agreement || !userProfile || !pageRef.current || isReady) return;
    
    // State
    const state = {
      selectedSigner: null as string | null,
      termsAccepted: false,
      signers: {
        client: { id: 'client', name: userProfile.displayName || 'Client', role: 'Cliente', email: userProfile.email || '', signed: false, date: null, targetImgId: 'sig-client' },
        provider: { id: 'provider', name: 'DJ Nova', role: 'Proveedor', email: 'dj.nova@example.com', signed: false, date: null, targetImgId: 'sig-provider' }
      },
      extraSigners: [] as any[]
    };

    // Elements
    const el = (id: string) => document.getElementById(id);
    const signerBtn = el('signerSelectBtn');
    const signerMenu = el('signerMenu');
    const extraSignerMenu = el('extraSignerMenu');
    const signerLabel = el('signerSelectLabel');
    const signerAvatar = el('signerAvatar');
    const primarySignBtn = el('primarySignBtn');
    const downloadBtn = el('downloadBtn');
    const requestBtn = el('requestBtn');
    const requestEmail = el('requestEmail') as HTMLInputElement;
    const copyLinkBtn = el('copyLinkBtn');
    const termsToggle = el('termsToggle');
    const termsAcceptedInput = el('termsAccepted') as HTMLInputElement;
    const termsIcon = el('termsIcon');
    const autosaveIndicator = el('autosaveIndicator');

    const shareBtn = el('shareBtn');
    const statusClient = el('status-client');
    const statusProvider = el('status-provider');
    const menuStatusClient = el('menu-status-client');
    const menuStatusProvider = el('menu-status-provider');
    const allSignedBadge = el('allSignedBadge');
    const statusBadge = el('statusBadge');

    const sigClientImg = el('sig-client') as HTMLImageElement;
    const sigProviderImg = el('sig-provider') as HTMLImageElement;
    const sigClientEmpty = el('sig-client-empty');
    const sigProviderEmpty = el('sig-provider-empty');
    const sigClientDate = el('sig-client-date');
    const sigProviderDate = el('sig-provider-date');
    const extraSignaturesWrap = el('extra-signatures');

    const progressBar = el('progressBar');
    const progressLabel = el('progressLabel');

    const addSignerBtn = el('addSignerBtn');
    const addSignerForm = el('addSignerForm');
    const newSignerName = el('newSignerName') as HTMLInputElement;
    const newSignerEmail = el('newSignerEmail') as HTMLInputElement;
    const newSignerRole = el('newSignerRole') as HTMLSelectElement;
    const confirmAddSignerBtn = el('confirmAddSignerBtn');
    const cancelAddSignerBtn = el('cancelAddSignerBtn');

    if(!signerBtn) return; // Exit if elements are not ready
    setIsReady(true);
    
    let autosaveTimeout: NodeJS.Timeout;
    function triggerAutosave() {
      if (!autosaveIndicator) return;
      clearTimeout(autosaveTimeout);
      autosaveIndicator.textContent = 'Guardando...';
      autosaveTimeout = setTimeout(() => {
          autosaveIndicator.textContent = 'Guardado';
      }, 1000);
    }

    function setBadgeCompleted() {
      if (!statusBadge) return;
      statusBadge.innerHTML = `
        <span class="h-2 w-2 rounded-full" style="background-color: hsl(221.2 83.2% 53.3%);"></span>
        Completado
      `;
      statusBadge.setAttribute('style', 'border: 1px solid hsla(221.2,83.2%,53.3%,0.35); background-color: hsla(221.2,83.2%,53.3%,0.12); color: hsl(221.2 83.2% 53.3%);');
      statusBadge.className = "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium";
    }

    function allSignersArray() {
      return [state.signers.client, state.signers.provider, ...state.extraSigners];
    }

    function updateAllSigned() {
      const allSigned = allSignersArray().every(s => s.signed);
      if (allSigned) {
        allSignedBadge?.classList.remove('hidden');
        setBadgeCompleted();
      }
    }

    function calcProgress() {
      let pct = 0;
      if (state.selectedSigner) pct += 33.34;
      if (!sig.isEmpty()) pct += 33.33;
      if (state.termsAccepted) pct += 33.33;
      return Math.min(100, Math.round(pct));
    }

    function updateProgress() {
      const pct = calcProgress();
      if (progressBar) progressBar.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = pct + '%';
    }

    // Custom dropdown behavior
    signerBtn.addEventListener('click', () => {
      signerMenu?.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (signerBtn && !signerBtn.contains(e.target as Node) && signerMenu && !signerMenu.contains(e.target as Node)) {
        signerMenu.classList.add('hidden');
      }
    });

    signerMenu?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button[data-signer]');
      if (!btn || !signerLabel || !signerAvatar || !signerMenu) return;
      const id = btn.getAttribute('data-signer');
      const s = allSignersArray().find(x => x.id === id);
      if (!s) return;
      state.selectedSigner = s.id;
      signerLabel.textContent = `${s.role} — ${s.name}`;
      signerAvatar.textContent = s.name.split(' ').map((p:string) => p[0]).slice(0,2).join('').toUpperCase();
      signerMenu.classList.add('hidden');
      refreshPrimaryBtn();
      updateProgress();
    });

    termsToggle?.addEventListener('click', () => {
      termsAcceptedInput.checked = !termsAcceptedInput.checked;
      state.termsAccepted = termsAcceptedInput.checked;

      const box = termsToggle.querySelector('span.inline-flex.h-5.w-5');
      if (!box || !termsIcon) return;
      if (state.termsAccepted) {
        box.setAttribute('style', 'background-color: hsl(221.2 83.2% 53.3%); border-color: hsl(221.2 83.2% 53.3%);');
        termsIcon.classList.remove('hidden');
      } else {
        box.setAttribute('style', 'background-color: hsl(217.2 32.6% 17.5%); border-color: hsla(210,40%,98%,0.25);');
        termsIcon.classList.add('hidden');
      }
      refreshPrimaryBtn();
      updateProgress();
      triggerAutosave();
    });

    class SignatureCanvas {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      paths: {x: number, y: number}[][];
      currentPath: {x: number, y: number}[];
      isDrawing: boolean;
      strokeStyle: string;
      lineWidth: number;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.paths = [];
        this.currentPath = [];
        this.isDrawing = false;
        this.strokeStyle = '#0f172a'; // default dark
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
        triggerAutosave();
      }
      getPos(e: PointerEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      drawDot(p: {x: number, y: number}) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.strokeStyle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      redraw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        for (const path of this.paths) {
          if (path.length === 1) {
            this.drawDot(path[0]);
            continue;
          }
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      clear() {
        this.paths = [];
        this.redraw();
        refreshPrimaryBtn();
        updateProgress();
      }
      undo() {
        this.paths.pop();
        this.redraw();
        refreshPrimaryBtn();
        updateProgress();
      }
      isEmpty() {
        return this.paths.length === 0;
      }
      toDataURL() {
        return this.canvas.toDataURL('image/png');
      }
    }

    const sigPadEl = el('signaturePad') as HTMLCanvasElement;
    if(!sigPadEl) return;
    const sig = new SignatureCanvas(sigPadEl);
    el('clearBtn')?.addEventListener('click', () => sig.clear());
    el('undoBtn')?.addEventListener('click', () => sig.undo());

    function selectWeight(target: HTMLElement) {
      el('penThin')?.setAttribute('style', 'border-color: rgb(30, 41, 59); background-color: rgba(248, 250, 252, 0.04); color: rgba(248, 250, 252, 0.85);');
      el('penNormal')?.setAttribute('style', 'border-color: rgb(30, 41, 59); background-color: rgba(248, 250, 252, 0.04); color: rgba(248, 250, 252, 0.85);');
      el('penThick')?.setAttribute('style', 'border-color: rgb(30, 41, 59); background-color: rgba(248, 250, 252, 0.04); color: rgba(248, 250, 252, 0.85);');
      target.setAttribute('style', 'border-color: rgb(30, 41, 59); background-color: rgba(248, 250, 252, 0.12); color: rgba(248, 250, 252, 0.95);');
    }
    function setColorActive(btnId: string) {
      ['penBlack','penBlue','penPurple'].forEach(id => {
        const btn = el(id);
        if(btn) btn.setAttribute('style', `background-color: ${btn.dataset.color}; box-shadow: none; outline: none; transform: scale(1);`);
      });
      const activeBtn = el(btnId);
      if(activeBtn) activeBtn.setAttribute('style', `background-color: ${activeBtn.dataset.color}; box-shadow: rgba(255, 255, 255, 0.08) 0px 0px 0px 2px inset; outline: none; transform: scale(1.02);`);
    }

    el('penThin')?.addEventListener('click', (e) => { sig.lineWidth = 1.6; selectWeight(e.currentTarget as HTMLElement); });
    el('penNormal')?.addEventListener('click', (e) => { sig.lineWidth = 2.2; selectWeight(e.currentTarget as HTMLElement); });
    el('penThick')?.addEventListener('click', (e) => { sig.lineWidth = 3.2; selectWeight(e.currentTarget as HTMLElement); });
    el('penBlack')?.addEventListener('click', () => { sig.strokeStyle = '#0f172a'; setColorActive('penBlack'); });
    el('penBlue')?.addEventListener('click', () => { sig.strokeStyle = '#2563eb'; setColorActive('penBlue'); });
    el('penPurple')?.addEventListener('click', () => { sig.strokeStyle = '#7c3aed'; setColorActive('penPurple'); });
    
    // Set initial colors and weight
    (el('penNormal') as HTMLElement)?.click();
    (el('penBlack') as HTMLElement)?.click();


    function refreshPrimaryBtn() {
      const ready = !!state.selectedSigner && !sig.isEmpty() && state.termsAccepted;
      if (primarySignBtn) (primarySignBtn as HTMLButtonElement).disabled = !ready;
    }

    function updatePendingBadge(el: HTMLElement) {
      el.className = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';
      el.setAttribute('style', 'background-color: hsla(35.1,100%,50%,0.12); color: hsl(35.1 100% 50%); border: 1px solid hsla(35.1,100%,50%,0.35);');
      el.innerHTML = '<span class="h-1.5 w-1.5 rounded-full" style="background-color: hsl(35.1 100% 50%);"></span> Pendiente';
    }

    function updateSignedBadge(el: HTMLElement) {
      el.className = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium';
      el.setAttribute('style', 'background-color: hsla(221.2,83.2%,53.3%,0.12); color: hsl(221.2 83.2% 53.3%); border: 1px solid hsla(221.2,83.2%,53.3%,0.35);');
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg> Firmado';
    }

    function applySignature() {
      if (!state.selectedSigner) return;
      const signer = allSignersArray().find(s => s.id === state.selectedSigner);
      if (!signer) return;

      const dataUrl = sig.toDataURL();
      
      const imgEl = el(signer.targetImgId) as HTMLImageElement;
      const emptyEl = el(`${signer.targetImgId}-empty`);
      const dateEl = el(`${signer.targetImgId}-date`) || el(`date-${signer.id}`);
      const statusEl = el(`status-${signer.id}`);
      const menuStatusEl = el(`menu-status-${signer.id}`);

      if (!imgEl) return;
      
      imgEl.src = dataUrl;
      imgEl.classList.remove('hidden');
      emptyEl?.classList.add('hidden');

      signer.signed = true;
      signer.date = new Date();
      const formatted = signer.date.toLocaleString('es-ES');
      
      if (statusEl) updateSignedBadge(statusEl);
      if (dateEl) dateEl.textContent = formatted;

      if (menuStatusEl) {
        menuStatusEl.textContent = 'Firmado';
        menuStatusEl.setAttribute('style', 'color: hsl(221.2 83.2% 53.3%)');
      }

      sig.clear();
      state.termsAccepted = false;
      termsAcceptedInput.checked = false;
      const box = termsToggle?.querySelector('span.inline-flex.h-5.w-5');
      if (box && termsIcon) {
          box.setAttribute('style', 'background-color: hsl(217.2 32.6% 17.5%); border-color: hsla(210,40%,98%,0.25);');
          termsIcon.classList.add('hidden');
      }
      
      toast({ title: 'Firma aplicada', description: `${signer.role} — ${signer.name}` });
      refreshPrimaryBtn();
      updateProgress();
      updateAllSigned();
      triggerAutosave();
    }

    primarySignBtn?.addEventListener('click', applySignature);

    downloadBtn?.addEventListener('click', () => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => {
            const element = document.getElementById('doc-wrapper');
            const opt = {
                margin: 0.5,
                filename: 'Agreement.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            if (window.html2pdf) {
                window.html2pdf().from(element).set(opt).save();
            }
        };
        document.head.appendChild(script);
    });

    requestBtn?.addEventListener('click', () => {
      if (!requestEmail) return;
      const email = requestEmail.value.trim();
      if (!email) return toast({ title: 'Error', description: 'Ingresa un correo válido', variant: 'destructive'});
      toast({ title: 'Solicitud enviada', description: `La solicitud de firma fue enviada a ${email}` });
      requestEmail.value = '';
    });
    
    function copyUrlToClipboard() {
      const url = location.href;
      navigator.clipboard.writeText(url).then(() => {
        toast({ title: 'Enlace copiado al portapapeles' });
      });
    }

    copyLinkBtn?.addEventListener('click', copyUrlToClipboard);
    shareBtn?.addEventListener('click', copyUrlToClipboard);
    
    document.getElementById('backBtn')?.addEventListener('click', () => {
      history.back();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && signerMenu) signerMenu.classList.add('hidden');
    });

    function createSignerRow(signer: any) {
        const signersList = el('signersList');
        if (!signersList) return;
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between px-4 py-3';
        row.innerHTML = `
            <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full" style="background-color: hsla(210,40%,98%,0.08); color: hsla(210,40%,98%,0.9); font-size: 12px; font-weight: 500;">${initials(signer.name)}</div>
            <div>
                <p class="text-sm font-medium" style="color: hsl(210 40% 98%);">${signer.name} <span class="text-xs" style="color: hsla(210,40%,98%,0.6);">(${signer.role})</span></p>
                <p class="text-xs" style="color: hsla(210,40%,98%,0.65);">${signer.email}</p>
            </div>
            </div>
            <div class="flex items-center gap-2">
            <span id="status-${signer.id}" class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"></span>
            <span id="date-${signer.id}" class="text-xs" style="color: hsla(210,40%,98%,0.5);"></span>
            </div>
        `;
        signersList.appendChild(row);
        const statusEl = document.getElementById(`status-${signer.id}`);
        if(statusEl) updatePendingBadge(statusEl);
    }

    function createMenuOption(signer: any) {
        if (!extraSignerMenu) return;
        const btn = document.createElement('button');
        btn.setAttribute('data-signer', signer.id);
        btn.className = 'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:brightness-110';
        btn.style.color = 'hsl(210 40% 98%)';
        btn.innerHTML = `
          <span class="flex items-center gap-2">
            <span class="flex h-5 w-5 items-center justify-center rounded-full" style="background-color: hsla(210,40%,98%,0.08); color: hsla(210,40%,98%,0.9); font-size: 10px; font-weight: 500;">${initials(signer.name)}</span>
            ${signer.role} — ${signer.name}
          </span>
          <span id="menu-status-${signer.id}" class="text-[10px]" style="color: hsl(35.1 100% 50%);">Pendiente</span>
        `;
        extraSignerMenu.appendChild(btn);
    }
    
    function createSignatureCard(signer: any) {
        if(!extraSignaturesWrap) return;
        const card = document.createElement('div');
        card.className = 'rounded-lg border p-4';
        card.setAttribute('style', 'background-color: rgb(255,255,255); border-color: rgb(226,232,240);');
        card.innerHTML = `
          <p class="mb-2 text-xs font-medium" style="color: rgb(100,116,139);">Firma — ${signer.role}</p>
          <div class="flex h-28 items-center justify-center rounded-md border-2 border-dashed" style="border-color: rgb(226,232,240); background-color: #ffffff;">
            <img id="${signer.targetImgId}" alt="Firma ${signer.name}" class="max-h-24 hidden">
            <span id="${signer.targetImgId}-empty" class="text-xs" style="color: rgb(148,163,184);">Pendiente de firma</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-[11px]" style="color: rgb(100,116,139);">
            <span>Nombre: ${signer.name}</span>
            <span id="${signer.targetImgId}-date"></span>
          </div>
        `;
        extraSignaturesWrap.appendChild(card);
    }

    function initials(name: string) {
      return name.split(' ').map((p:string) => p[0]).slice(0,2).join('').toUpperCase();
    }

    function validateEmail(email: string) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    addSignerBtn?.addEventListener('click', () => {
      addSignerForm?.classList.toggle('hidden');
    });
    cancelAddSignerBtn?.addEventListener('click', () => {
      addSignerForm?.classList.add('hidden');
      newSignerName.value = '';
      newSignerEmail.value = '';
      newSignerRole.value = 'Invitado';
    });

    confirmAddSignerBtn?.addEventListener('click', () => {
      const name = newSignerName.value.trim();
      const email = newSignerEmail.value.trim();
      const role = newSignerRole.value.trim() || 'Invitado';
      if (!name || !validateEmail(email)) {
        return toast({title: 'Datos incompletos', description:'Completa nombre y un correo válido', variant: 'destructive'});
      }
      const id = 's' + Date.now();
      const signer = { id, name, role, email, signed: false, date: null, targetImgId: 'sig-' + id };
      state.extraSigners.push(signer);

      createSignerRow(signer);
      createMenuOption(signer);
      createSignatureCard(signer);
      
      toast({title: 'Firmante agregado', description: name});
      newSignerName.value = '';
      newSignerEmail.value = '';
      newSignerRole.value = 'Invitado';
      addSignerForm?.classList.add('hidden');
      triggerAutosave();
    });

    // Initialize UI states
    if (statusClient) updatePendingBadge(statusClient);
    if (statusProvider) updatePendingBadge(statusProvider);
    refreshPrimaryBtn();
    updateProgress();
  }, [agreement, userProfile, isReady]);

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <h1 className="text-xl font-bold">Cargando acuerdo...</h1>
          <p className="text-muted-foreground">Obteniendo los detalles del acuerdo y firmantes.</p>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <h1 className="text-2xl font-bold">Contrato no encontrado</h1>
          <p className="text-muted-foreground">El contrato que estás buscando no existe o fue eliminado.</p>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="relative mx-auto max-w-7xl px-4 py-6">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/5 blur-3xl"></div>
      </div>

      <AgreementHeader />

      {/* Main layout */}
      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Document Viewer */}
        <section id="documentColumn" className="lg:col-span-8">
          <div className="rounded-xl border bg-secondary shadow-sm ring-1 ring-white/5">
              <div className="overflow-hidden rounded-t-xl">
                  <div className="relative">
                      <img src={agreement.image} data-ai-hint="agreement header" alt="Agreement header" className="h-40 w-full object-cover sm:h-44 md:h-48" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                           <DocumentHeader agreement={agreement} />
                      </div>
                  </div>
              </div>
              <div id="doc-scroll" className="max-h-[72vh] overflow-auto px-6 pb-6">
                  <article id="doc-wrapper" className="mx-auto max-w-3xl">
                      <SignersTable userProfile={userProfile} />
                      
                        <div className="leading-relaxed rounded-lg border border-secondary bg-background/50 ring-1 ring-white/5 p-5 mt-6">
                            <div className="mx-auto max-w-3xl rounded-md bg-white text-slate-900 shadow-lg ring-1 ring-inset ring-slate-900/5 p-6 space-y-6">
                                <p className="text-sm leading-6 text-slate-700">{agreement.desc}</p>
                                <LegalTerms />
                                <div className="rounded-md bg-slate-50 p-4 text-xs leading-6 ring-1 ring-inset ring-slate-200 text-slate-700">
                                    <p>Al firmar, confirmas que has leído y aceptas los términos de uso, política de privacidad y reconoces que tu firma electrónica es legalmente vinculante. Conserva una copia para tus registros.</p>
                                </div>
                                <section>
                                    <h3 className="mb-3 text-base font-medium text-slate-900">Firmas</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <p className="mb-2 text-xs font-medium text-slate-500">Firma del Cliente</p>
                                            <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-white">
                                                <img id="sig-client" alt="Firma cliente" className="max-h-24 hidden" />
                                                <span id="sig-client-empty" className="text-xs text-slate-400">Pendiente de firma</span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                                <span>Nombre: {userProfile?.displayName || 'Cliente'}</span>
                                                <span id="sig-client-date"></span>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <p className="mb-2 text-xs font-medium text-slate-500">Firma del Proveedor</p>
                                            <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-white">
                                                <img id="sig-provider" alt="Firma proveedor" className="max-h-24 hidden" />
                                                <span id="sig-provider-empty" className="text-xs text-slate-400">Pendiente de firma</span>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                                                <span>Nombre: DJ Nova</span>
                                                <span id="sig-provider-date"></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="extra-signatures" className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"></div>
                                </section>
                            </div>
                        </div>

                  </article>
              </div>
          </div>
        </section>

        <AgreementActions />
      </main>
    </div>
  );
}
