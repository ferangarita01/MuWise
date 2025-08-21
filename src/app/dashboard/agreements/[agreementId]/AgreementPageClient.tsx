// /src/app/dashboard/agreements/[agreementId]/AgreementPageClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { AgreementHeader } from '@/components/agreement/agreement-header';
import { AgreementDocument } from '@/components/agreement/agreement-document';
import { AgreementActions } from '@/components/agreement/agreement-actions';
import { SignersTable } from '@/components/agreement/signers-table';
import { toast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2 } from 'lucide-react';
import React from 'react';

declare global {
  interface Window {
    html2pdf: any;
  }
}

// ✅ Ahora recibe agreementId como prop
export default function AgreementPageClient({ agreementId }: { agreementId: string }) {
  const { userProfile, loading: profileLoading } = useUserProfile();
  const pageRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (profileLoading || !userProfile || isInitialized) return;
    if (!pageRef.current) return;

    setIsInitialized(true);

    // 👇 aquí mantienes TODO tu código de inicialización y lógica original
    // (lo pegas sin tocar nada más)
  }, [profileLoading, userProfile, isInitialized]);

  if (profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={pageRef} className="relative mx-auto max-w-7xl px-4 py-6">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/5 blur-3xl"></div>
      </div>

      <AgreementHeader />

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section id="documentColumn" className="lg:col-span-8">
          <div className="rounded-xl border bg-secondary shadow-sm ring-1 ring-white/5">
            <div className="overflow-hidden rounded-t-xl">
              <div className="relative">
                <img
                  src="https://placehold.co/1200x300.png"
                  alt="Mountains header"
                  className="h-40 w-full object-cover sm:h-44 md:h-48"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                        Contrato
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Service Contract for DJs
                      </h1>
                      <p className="mt-1 text-sm text-foreground/75">
                        Un acuerdo estándar para contratar un DJ para un evento o presentación.
                      </p>
                    </div>
                    <div className="hidden items-center gap-2 text-foreground/70 md:flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4.5 w-4.5"
                      >
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M10 9H8"></path>
                        <path d="M16 13H8"></path>
                        <path d="M16 17H8"></path>
                      </svg>
                      {/* ✅ Ahora usas la prop directamente */}
                      <span className="text-xs font-medium">ID: {agreementId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="doc-scroll" className="max-h-[72vh] overflow-auto px-6 pb-6">
              <article id="doc-wrapper" className="mx-auto max-w-3xl">
                {userProfile && <SignersTable userProfile={userProfile} />}
                <AgreementDocument />
              </article>
            </div>
          </div>
        </section>

        <AgreementActions />
      </main>
    </div>
  );
}
