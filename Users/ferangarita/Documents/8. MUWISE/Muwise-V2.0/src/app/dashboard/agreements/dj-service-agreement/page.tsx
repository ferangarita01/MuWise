'use client';

import {
  Clock,
  PenLine,
  Download,
  BadgeCheck,
  ChevronDown,
  Check,
  Send,
  Link2,
  Loader2,
} from 'lucide-react';
import { SignatureCanvas } from '@/components/signature-canvas';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Composer } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';


interface AgreementActionsProps {
  isSending: boolean;
  onSignatureEnd: (data: string | null) => void;
  onSendRequest: (email: string) => Promise<boolean>;
  signatureData: string | null;
  onApplySignature: () => void;
  signers: Composer[];
}

export function AgreementActions({ isSending, onSignatureEnd, onSendRequest, signatureData, onApplySignature, signers }: AgreementActionsProps) {
  const signatureCanvasRef = useRef<{ clear: () => void; getSignature: () => string | null; }>(null);
  const [requestEmail, setRequestEmail] = useState('');
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [selectedSigner, setSelectedSigner] = useState<Composer | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSendRequest(requestEmail);
    if(success) {
      setRequestEmail('');
    }
  }
  
  const handleCopyLink = () => {
     navigator.clipboard.writeText(window.location.href).then(() => {
        toast({ title: 'Enlace copiado al portapapeles' });
      });
  }
  
  const initials = (name: string) => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

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
              <span>Guardado</span>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={onApplySignature}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10"
              disabled={!signatureData}
            >
              <PenLine className="h-4 w-4" />
              Aplicar mi Firma
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
          </div>
          
          {/* Step 1: SignatureCanvas */}
          <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">1</span>
                  <span className="text-sm font-medium text-foreground">Dibuja tu firma</span>
                </div>
              </div>
              <SignatureCanvas ref={signatureCanvasRef} onSignatureEnd={onSignatureEnd} />
            </div>

          {/* Step 2: Terms */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground/80">
                2
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
            Completa los 2 pasos para habilitar “Aplicar mi Firma”.
          </div>
        </div>

        {/* Request Signatures */}
        <div className="rounded-xl border border-secondary bg-secondary p-4 shadow-sm ring-1 ring-white/5">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-foreground">
            Solicitar firmas
          </h3>
          <form id="requestForm" onSubmit={handleRequestSubmit} className="space-y-2">
            <input
              id="requestEmail"
              name="email"
              type="email"
              placeholder="recipient@example.com"
              className="w-full rounded-md border border-secondary bg-secondary px-3 py-2 text-sm text-foreground placeholder-slate-400/70 outline-none ring-0 transition focus:border-slate-300/0 focus-visible:ring-2 focus-visible:ring-white/10"
              required
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="submit"
                id="requestBtn"
                disabled={isSending || !requestEmail}
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
                onClick={handleCopyLink}
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