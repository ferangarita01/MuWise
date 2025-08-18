
'use client';
import { AgreementForm } from '@/components/agreement-form';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAgreements } from '@/hooks/useAgreements';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { DocumentViewer } from '@/components/document-viewer';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const newAgreementTemplate: Agreement = {
  id: 'new',
  songTitle: 'New Song Agreement',
  publicationDate: new Date().toISOString(),
  performerArtists: '',
  duration: '00:00',
  composers: [],
  status: 'Draft',
  createdAt: new Date().toISOString(),
};

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createAgreement } = useAgreements();

  const [formState, setFormState] = useState<Partial<Agreement>>({});

  const handleFormChange = (newData: Partial<Agreement>) => {
    setFormState(prev => ({...prev, ...newData, composers: newData.composers || prev.composers || [] }));
  };

  const handleSaveAgreement = async (newAgreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create an agreement.",
        });
        return;
    }

    try {
      const newAgreement = await createAgreement(newAgreementData);
      toast({
        title: "Agreement Created",
        description: "Your new agreement has been saved successfully.",
      });

      if (newAgreement?.id) {
        router.push(`/dashboard/agreements/${newAgreement.id}/sign`);
      } else {
        router.push(`/dashboard/agreements`);
      }
      return newAgreement;
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the agreement. Please try again.",
      });
      console.error(error);
    }
  };
  
  const previewAgreement: Agreement = {
      ...newAgreementTemplate,
      ...formState,
      songTitle: formState.songTitle || newAgreementTemplate.songTitle,
      composers: formState.composers || [],
  };

  return (
    <div className="relative max-w-full mx-auto">
      <header className="mb-6 flex items-center justify-between rounded-xl border px-3 py-3 backdrop-blur bg-muted/60 border-border">
         <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
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
                    <span className="text-sm font-medium tracking-tight text-foreground">Nuevo Acuerdo</span>
                </div>
            </div>
         </div>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
           <DocumentViewer agreement={previewAgreement} />
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-6">
            <AgreementForm 
                onSave={handleSaveAgreement} 
                onFormChange={handleFormChange}
            />
        </aside>
      </main>
    </div>
  );
}
