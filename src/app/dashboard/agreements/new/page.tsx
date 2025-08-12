
'use client';
import { AgreementForm } from '@/components/agreement-form';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createAgreement } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

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
      await createAgreement(user.uid, newAgreementData);
      toast({
        title: "Agreement Saved",
        description: "Your new agreement has been created successfully.",
      });
      router.push('/dashboard');
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the agreement. Please try again.",
      });
      console.error(error);
    }
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
