
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { Agreement, AgreementStatus } from '@/lib/types';
import { PlusCircle, FileText, Send, CheckCircle, Clock, Archive, PenSquare, Search, Users, BarChart, MoreVertical, FileDown } from 'lucide-react';
import { AgreementActions } from '@/components/agreement-actions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { es } from 'date-fns/locale';

const statusConfig: Record<
  AgreementStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    color: string;
  }
> = {
  Draft: {
    label: 'Borrador',
    icon: PenSquare,
    badgeClass: 'bg-muted text-muted-foreground border-muted hover:bg-muted/80',
    color: 'hsl(var(--muted))'
  },
  Sent: {
    label: 'Enviado',
    icon: Send,
    badgeClass: 'bg-primary/20 text-primary border-primary/20 hover:bg-primary/30',
    color: 'hsl(var(--primary))'
  },
  Partial: {
    label: 'Parcial',
    icon: Clock,
    badgeClass: 'bg-yellow-400/20 text-yellow-500 border-yellow-400/20 dark:text-yellow-400',
    color: '#facc15' // yellow-400
  },
  Signed: {
    label: 'Firmado',
    icon: CheckCircle,
    badgeClass: 'bg-green-500/20 text-green-600 border-green-500/20 dark:text-green-400',
    color: '#22c55e' // green-500
  },
  Archived: {
    label: 'Archivado',
    icon: Archive,
    badgeClass: 'bg-secondary text-secondary-foreground border-secondary',
    color: 'hsl(var(--secondary))'
  }
};

const chartConfig = {
  count: { label: 'Acuerdos' },
  Draft: { label: 'Borrador', color: 'hsl(var(--muted))' },
  Sent: { label: 'Enviado', color: 'hsl(var(--primary))' },
  Partial: { label: 'Parcial', color: '#facc15' },
  Signed: { label: 'Firmado', color: '#22c55e' },
  Archived: { label: 'Archivado', color: 'hsl(var(--secondary))' },
} satisfies ChartConfig;


function FormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = React.useState('');

  React.useEffect(() => {
    const date = new Date(dateString);
    setFormattedDate(formatDistanceToNow(date, { addSuffix: true, locale: es }));
  }, [dateString]);

  return <>{formattedDate || <span className="text-transparent">...</span>}</>;
}


export function DashboardContent({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [agreements, setAgreements] = React.useState(initialAgreements);
  
  React.useEffect(() => {
    setAgreements(initialAgreements);
  }, [initialAgreements]);

  const statusFilter = searchParams.get('status') as AgreementStatus | null;
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )
  
  const handleStatusChange = (agreementId: string, status: AgreementStatus) => {
    setAgreements(prev => prev.map(a => a.id === agreementId ? {...a, status: status} : a));
  };


  const sortedAndFilteredAgreements = React.useMemo(() => {
    let filtered = agreements.filter(agreement => {
      const statusMatch = !statusFilter || agreement.status === statusFilter;
      const searchMatch = !searchQuery || agreement.songTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch && agreement.status !== 'Archived';
    });

    return filtered.sort((a, b) => {
        const [key, order] = sortBy.split('_');
        const valA = a[key as keyof Agreement];
        const valB = b[key as keyof Agreement];

        let comparison = 0;
        if (valA! > valB!) {
            comparison = 1;
        } else if (valA! < valB!) {
            comparison = -1;
        }
        
        return order === 'desc' ? comparison * -1 : comparison;
    });
  }, [agreements, statusFilter, searchQuery, sortBy]);


  const totalAgreements = agreements.filter(a => a.status !== 'Archived').length;
  const awaitingSignature = agreements.filter(a => ['Sent', 'Partial'].includes(a.status)).length;
  const signedThisMonth = agreements.filter(a => a.status === 'Signed' && new Date(a.createdAt).getMonth() === new Date().getMonth()).length;

  const chartData = React.useMemo(() => {
    const statusCounts = (Object.keys(statusConfig) as AgreementStatus[]).reduce((acc, status) => {
      if (status !== 'Archived') {
        acc[status] = agreements.filter(a => a.status === status).length;
      }
      return acc;
    }, {} as Record<string, number>);

    return [{
      name: 'Acuerdos',
      ...statusCounts,
    }];
  }, [agreements]);
  
  const getSignatureProgress = (agreement: Agreement) => {
    const signedCount = agreement.composers.filter(c => c.signature).length;
    const totalCount = agreement.composers.length;
    return (signedCount / totalCount) * 100;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tus acuerdos, estado y actividad reciente.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agreements/select-type">
            <PlusCircle />
            Crear Nuevo Acuerdo
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acuerdos Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgreements}</div>
            <p className="text-xs text-muted-foreground">
              Total de acuerdos en progreso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Firma</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awaitingSignature}</div>
            <p className="text-xs text-muted-foreground">
              Acuerdos esperando por una o más firmas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firmados este Mes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{signedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
             Nuevos acuerdos completados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
