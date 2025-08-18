
'use client';

import { DashboardContent } from '@/components/dashboard-content';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { useAgreements } from '@/hooks/useAgreements';

export default function AgreementsPage() {
    const { agreements, loading } = useAgreements();

    if (loading) {
        return <DashboardSkeleton />;
    }

    return <DashboardContent initialAgreements={agreements} />;
}
