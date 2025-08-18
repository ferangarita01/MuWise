
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from './ui/card';

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-48" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-7 w-12" /><Skeleton className="h-4 w-32 mt-2" /></CardContent></Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                     <CardContent>
                        <Skeleton className="h-80 w-full" />
                     </CardContent>
                </Card>
            </div>
        </div>
    )
}

    
