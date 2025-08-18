
'use client';

import * as React from 'react';
import { DashboardContent } from '@/components/dashboard-content';
import { useAgreements } from '@/hooks/useAgreements';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';


export default function DashboardPage() {
  const { agreements, loading, error } = useAgreements();

  if (loading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
      return (
          <div className="flex items-center justify-center h-full">
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  <p>Error al cargar los acuerdos: {error}</p>
              </div>
          </div>
      )
  }

  return (
    <DashboardContent initialAgreements={agreements} />
  );
}

    
