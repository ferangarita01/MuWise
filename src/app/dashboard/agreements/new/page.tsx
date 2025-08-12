
'use client';
import { AgreementForm } from '@/components/agreement-form';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockAgreements } from '@/lib/data'; // We might still need this for context, but state is managed elsewhere

export default function NewAgreementPage({ agreements, setAgreements }: { agreements: Agreement[], setAgreements: (agreements: Agreement[]) => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSaveAgreement = (newAgreement: Agreement) => {
    // In a real app, this would be an API call.
    // Here we just update the parent's state.
    setAgreements([...(agreements || mockAgreements), newAgreement]);
    toast({
      title: "Agreement Saved",
      description: "Your new agreement has been created successfully.",
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col gap-8">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">New Agreement</h1>
          <p className="text-muted-foreground">
            Define the terms of a new songwriter split.
          </p>
        </div>
      <AgreementForm onSave={handleSaveAgreement} />
    </div>
  );
}
