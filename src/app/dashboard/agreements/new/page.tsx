
'use client';
import { AgreementForm } from '@/components/agreement-form';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockAgreements } from '@/lib/data';

// This is a client component, but it needs to receive server-side state or be wrapped in a provider.
// For now, we assume this page is part of a flow that has access to the agreements state.
export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();

  // This would ideally come from a global state/context or be passed down.
  // For now, we'll assume we're adding to a list that will be reflected elsewhere.
  const handleSaveAgreement = (newAgreement: Agreement) => {
    // In a real app, this would be an API call to save the agreement.
    // The dashboard will then refetch or update its state.
    // Here we'll just log it and redirect.
    console.log("New agreement to be saved:", newAgreement);

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
