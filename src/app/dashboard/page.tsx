
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardContent } from '@/components/dashboard-content';
import { mockAgreements } from '@/lib/data';
import type { Agreement } from '@/lib/types';


export default function DashboardPage() {
  const [agreements, setAgreements] = React.useState<Agreement[]>(mockAgreements);

  const handleSetAgreements = (updatedAgreements: Agreement[] | ((prev: Agreement[]) => Agreement[])) => {
    setAgreements(updatedAgreements);
  };


  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent agreements={agreements} setAgreements={handleSetAgreements} />
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
