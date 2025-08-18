
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
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Acuerdos Recientes</CardTitle>
                <CardDescription>
                  Gestiona tus acuerdos de división existentes.
                </CardDescription>
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por título de canción..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => router.push(`${pathname}?${createQueryString('q', e.target.value)}`)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={statusFilter || 'all'} onValueChange={(value) => router.push(`${pathname}?${createQueryString('status', value === 'all' ? '' : value)}`)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            {(Object.keys(statusConfig) as AgreementStatus[]).filter(s => s !== 'Archived').map(status => (
                                <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canción</TableHead>
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead className="hidden md:table-cell">Creado</TableHead>
                    <TableHead><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredAgreements.length > 0 ? sortedAndFilteredAgreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <div className="flex -space-x-2 overflow-hidden">
                                {agreement.composers.slice(0, 3).map(composer => (
                                    <Avatar key={composer.id} className="h-6 w-6 border-2 border-background">
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${composer.email}`} />
                                        <AvatarFallback>{composer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                           <div>
                            <div>{agreement.songTitle}</div>
                            <div className="text-xs text-muted-foreground hidden sm:block">
                                {agreement.composers.map(c => c.name).join(', ')}
                            </div>
                           </div>
                        </div>
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={statusConfig[agreement.status].badgeClass}
                        >
                          <span className="mr-1 h-2 w-2 rounded-full" style={{backgroundColor: statusConfig[agreement.status].color}}></span>
                          {statusConfig[agreement.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <Progress value={getSignatureProgress(agreement)} className="h-1.5" />
                           <span className="text-xs font-mono text-muted-foreground">
                               {agreement.composers.filter(c => c.signature).length}/{agreement.composers.length}
                           </span>
                         </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                         <FormattedDate dateString={agreement.createdAt} />
                      </TableCell>
                      <TableCell>
                        <AgreementActions agreement={agreement} onStatusChange={handleStatusChange} />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron acuerdos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Resumen de Estado</CardTitle>
                <CardDescription>Distribución de todos tus acuerdos activos.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-80">
                     <RechartsBarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 10, right: 10 }}
                     >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tickLine={false} 
                          axisLine={false}
                          className="text-xs" 
                        />
                        <XAxis type="number" hide />
                        <RechartsTooltip
                           cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                           content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="Draft" stackId="a" fill="var(--color-Draft)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Sent" stackId="a" fill="var(--color-Sent)" />
                        <Bar dataKey="Partial" stackId="a" fill="var(--color-Partial)" />
                        <Bar dataKey="Signed" stackId="a" fill="var(--color-Signed)" radius={[4, 0, 0, 4]} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
