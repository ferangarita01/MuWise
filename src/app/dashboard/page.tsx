
'use client';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardContent } from '@/components/dashboard-content';
import type { Agreement } from '@/lib/types';
import { getAgreements } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth.tsx';

export default function DashboardPage() {
  const [agreements, setAgreements] = React.useState<Agreement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchAgreements = async () => {
      if (user) {
        setLoading(true);
        try {
          const fetchedAgreements = await getAgreements();
          setAgreements(fetchedAgreements);
        } catch (error) {
          console.error("Failed to fetch agreements:", error);
          // Handle error appropriately, e.g., show a toast notification
        } finally {
          setLoading(false);
        }
      } else {
        // Handle case where user is not logged in, e.g., clear agreements
        setAgreements([]);
        setLoading(false);
      }
    };

    fetchAgreements();
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent initialAgreements={agreements} />
    </React.Suspense>
  );
}


function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            
            <Skeleton className="h-96" />
        </div>
    )
}
