
'use client';
import { AgreementForm } from '@/components/agreement-form';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockAgreements } from '@/lib/data';

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSaveAgreement = (newAgreement: Agreement) => {
    // In a real app, this would be an API call to save the agreement.
    // Here we'll just log it, add it to our mock data, and redirect.
    console.log("New agreement to be saved:", newAgreement);
    mockAgreements.unshift(newAgreement); // Add to the beginning of the array

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
