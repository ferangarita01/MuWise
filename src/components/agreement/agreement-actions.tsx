
'use client';

import {
  Clock,
  PenLine,
  Download,
  BadgeCheck,
  ChevronDown,
  Pencil,
  Undo2,
  Trash2,
  Check,
  Send,
  Link2,
  Loader2,
} from 'lucide-react';

interface AgreementActionsProps {
  isSending: boolean;
}

export function AgreementActions({ isSending }: AgreementActionsProps) {
  return (
    <aside className="lg:col-span-4 lg:sticky lg:top-6">
      <div className="space-y-6">
        {/* Actions */}
        <div className="rounded-xl border border-secondary bg-secondary p-4 shadow-sm ring-1 ring-white/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Acciones
            </h3>
            <div className="inline-flex items-center gap-1 text-[11px] text-foreground/60">
              <Clock className="h-3.5 w-3.5" />
              <span id="autosaveIndicator">Auto-guardado</span>
            </div>
          </div>
          <div className="space-y-2">
            <button
              id="primarySignBtn"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
              disabled
            >
              <PenLine className="h-4 w-4" />
              Firmar documento
            </button>
            <button
              id="downloadBtn"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-secondary bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-secondary bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground/45"
              disabled
            >
              <BadgeCheck className="h-4 w-4" />
              Certificado digital (pronto)
            </button>
          </div>
        </div>

        {/* Guided Flow */}
        <div className="rounded-xl border border-secondary bg-secondary p-4 shadow-sm ring-1 ring-white/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Flujo de firma
            </h3>
            <span
              id="progressLabel"
              className="text-xs font-medium text-foreground/75"
            >
              0%
            </span>
          </div>
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              id="progressBar"
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: '0%' }}
            ></div>
          </div>

          {/* Step 1: Select Signer */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">
                1
              </span>
              <span className="text-sm font-medium text-foreground">
                Selecciona quién firma
              </span>
            </div>
            {/* Custom dropdown */}
            <div className="relative">
              <button
                id="signerSelectBtn"
                className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-secondary bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-all hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
              >
                <span className="flex items-center gap-2">
                  <span
                    id="signerAvatar"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium text-foreground/90"
                  >
                    ?
                  </span>
                  <span id="signerSelectLabel">Seleccionar firmante</span>
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div
                id="signerMenu"
                className="absolute z-20 mt-2 hidden w-full overflow-hidden rounded-md border border-secondary bg-background shadow-lg ring-1 ring-white/5"
              >
                <button
                  data-signer="client"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground transition hover:brightness-110"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium text-foreground/90">
                      AT
                    </span>
                    Ana Torres
                  </span>
                  <span
                    id="menu-status-client"
                    className="text-[10px] text-accent"
                  >
                    Pendiente
                  </span>
                </button>
                <button
                  data-signer="provider"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground transition hover:brightness-110"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-medium text-foreground/90">
                      DN
                    </span>
                    DJ Nova
                  </span>
                  <span
                    id="menu-status-provider"
                    className="text-[10px] text-accent"
                  >
                    Pendiente
                  </span>
                </button>
                <div id="extraSignerMenu" className="border-t border-secondary"></div>
              </div>
            </div>
          </div>

          {/* Step 2: SignatureCanvas */}
          <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">2</span>
                  <span className="text-sm font-medium text-foreground">Dibuja tu firma</span>
                </div>
                {/* Pen controls */}
                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <button id="penThin" className="rounded-md border border-input bg-background/50 px-2 py-1 text-[11px] font-medium text-foreground/80 transition hover:brightness-110">Fino</button>
                    <button id="penNormal" className="rounded-md border border-input bg-background px-2 py-1 text-[11px] font-medium text-foreground/95 transition hover:brightness-110">Medio</button>
                    <button id="penThick" className="rounded-md border border-input bg-background/50 px-2 py-1 text-[11px] font-medium text-foreground/80 transition hover:brightness-110">Grueso</button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button id="penBlack" data-color="#0f172a" className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-secondary transition" style={{ backgroundColor: '#0f172a' }}></button>
                    <button id="penBlue" data-color="#2563eb" className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-secondary transition" style={{ backgroundColor: '#2563eb' }}></button>
                    <button id="penPurple" data-color="#7c3aed" className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-secondary transition" style={{ backgroundColor: '#7c3aed' }}></button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-secondary bg-foreground/5 ring-1 ring-white/5">
                <div className="flex items-center justify-between border-b border-secondary px-3 py-2 text-foreground/70">
                  <div className="flex items-center gap-2 text-xs">
                    <Pencil className="h-4 w-4" />
                    Traza con el mouse o el dedo
                  </div>
                  <div className="flex items-center gap-2">
                    <button id="undoBtn" className="inline-flex items-center gap-1 rounded-md border border-secondary bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10">
                      <Undo2 className="h-3.5 w-3.5" />
                      Deshacer
                    </button>
                    <button id="clearBtn" className="inline-flex items-center gap-1 rounded-md border border-secondary bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10">
                      <Trash2 className="h-3.5 w-3.5" />
                      Limpiar
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="rounded-md bg-white ring-1 ring-inset ring-black/5" style={{ backgroundImage: 'radial-gradient(circle at 12px 12px, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    <canvas id="signaturePad" className="block h-44 w-full cursor-crosshair touch-none" width="340" height="176"></canvas>
                  </div>
                </div>
              </div>
            </div>

          {/* Step 3: Terms */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">
                3
              </span>
              <span className="text-sm font-medium text-foreground">
                Acepta los términos
              </span>
            </div>
            {/* Custom checkbox */}
            <button
              id="termsToggle"
              type="button"
              className="group inline-flex w-full items-start gap-3 rounded-md border border-secondary bg-secondary p-3 text-left transition hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border border-foreground/25 bg-secondary transition">
                <Check
                  id="termsIcon"
                  className="hidden h-4 w-4 text-foreground"
                />
              </span>
              <span className="text-sm text-foreground/85">
                He leído y acepto los términos legales del acuerdo y autorizo
                el uso de mi firma electrónica.
              </span>
            </button>
            <input id="termsAccepted" type="checkbox" className="hidden" />
          </div>

          <div className="rounded-md bg-foreground/5 p-3 text-xs text-foreground/65">
            Completa los 3 pasos para habilitar “Firmar documento”.
          </div>
        </div>

        {/* Request Signatures */}
        <div className="rounded-xl border border-secondary bg-secondary p-4 shadow-sm ring-1 ring-white/5">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-foreground">
            Solicitar firmas
          </h3>
          <form id="requestForm" className="space-y-2">
            <input
              id="requestEmail"
              name="email"
              type="email"
              placeholder="recipient@example.com"
              className="w-full rounded-md border border-secondary bg-secondary px-3 py-2 text-sm text-foreground placeholder-slate-400/70 outline-none ring-0 transition focus:border-slate-300/0 focus-visible:ring-2 focus-visible:ring-white/10"
              required
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="submit"
                id="requestBtn"
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSending ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <button
                id="copyLinkBtn"
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-secondary bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground/90 transition hover:translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
              >
                <Link2 className="h-4 w-4" />
                Copiar enlace
              </button>
            </div>
          </form>
        </div>
      </div>
    </aside>
  );
}
