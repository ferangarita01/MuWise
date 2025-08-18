
'use client';
import type { Agreement } from "@/lib/types";
import { DocumentHeader } from "./document-header";
import { ComposerTable } from "./composer-table";
import { LegalTerms } from "./legal-terms";
import { DocumentLayout } from "./ui/document-layout";

export function DocumentViewer({ agreement }: { agreement: Agreement }) {
  return (
    <div className="rounded-xl border shadow-sm ring-1 ring-white/5 bg-muted border-border">
      <div className="overflow-hidden rounded-t-xl">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1670852714979-f73d21652a83?w=2560&q=80"
            alt="Mountains header"
            data-ai-hint="mountains landscape"
            className="h-40 w-full object-cover sm:h-44 md:h-48"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
             <DocumentHeader agreement={agreement} />
          </div>
        </div>
      </div>
      <div className="max-h-[72vh] overflow-auto px-6 pb-6">
        <article className="mx-auto max-w-3xl prose prose-invert prose-sm">
            <DocumentLayout>
                <div className="my-8">
                     <ComposerTable composers={agreement.composers} />
                </div>
                <LegalTerms />
                <section>
                    <h2 className="text-sm font-bold uppercase text-foreground tracking-wider mt-8">SIGNATURES AND EXECUTION</h2>
                    <div className="w-full border-b border-foreground/30 my-2"></div>
                    <div className="mt-4 space-y-8">
                    {agreement.composers.map((composer, index) => (
                        <div key={composer.id}>
                            <p className="font-semibold text-xs uppercase text-muted-foreground">COMPOSER {index + 1}</p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                <div>
                                    <span className="text-xs text-muted-foreground">Print Name:</span>
                                    <p className="font-semibold border-b border-foreground/20 pb-1">{composer.name}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Percentage:</span>
                                    <p className="font-semibold border-b border-foreground/20 pb-1">{composer.share}%</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Signature:</span>
                                    {composer.signature ? (
                                        <img src={composer.signature} alt={`Signature of ${composer.name}`} className="h-12 w-full object-contain object-left border-b border-foreground/20 invert-[1] brightness-0" />
                                    ) : (
                                        <div className="h-12 border-b border-foreground/20"></div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Date:</span>
                                    {composer.signedAt ? (
                                        <p className="h-12 flex items-end pb-1 border-b border-foreground/20">{new Date(composer.signedAt).toLocaleDateString()}</p>
                                    ) : (
                                        <div className="h-12 border-b border-foreground/20"></div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs text-muted-foreground">Email:</span>
                                    <p className="font-semibold border-b border-foreground/20 pb-1">{composer.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </section>
            </DocumentLayout>
        </article>
      </div>
    </div>
  );
}
