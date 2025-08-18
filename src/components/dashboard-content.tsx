
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
      return statusMatch && agreement.status !== 'Archived';
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

  
  const getSignatureProgress = (agreement: Agreement) => {
    const signedCount = agreement.composers.filter(c => c.signature).length;
    const totalCount = agreement.composers.length;
    return (signedCount / totalCount) * 100;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-5">
            <CardHeader>
                <CardTitle>Recent Agreements</CardTitle>
                <CardDescription>
                  Your most recently created or updated agreements.
                </CardDescription>
                <div className="flex items-center gap-4 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by song title..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => router.push(`${pathname}?${createQueryString('q', e.target.value)}`)}
                        />
                    </div>
                     <Select value={statusFilter || 'all'} onValueChange={val => router.push(`${pathname}?${createQueryString('status', val === 'all' ? '' : val)}`)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.entries(statusConfig).filter(([key]) => key !== 'Archived').map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={sortBy} onValueChange={val => router.push(`${pathname}?${createQueryString('sortBy', val)}`)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt_desc">Newest First</SelectItem>
                            <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                             <SelectItem value="songTitle_asc">Title (A-Z)</SelectItem>
                             <SelectItem value="songTitle_desc">Title (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Song Title</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Composers</TableHead>
                        <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
                        <TableHead className="hidden lg:table-cell w-[150px]">Signature Progress</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {sortedAndFilteredAgreements.map(agreement => (
                        <TableRow key={agreement.id}>
                            <TableCell className="font-medium">
                                {agreement.songTitle}
                                <div className="text-muted-foreground text-xs md:hidden">
                                   <FormattedDate dateString={agreement.createdAt} />
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge className={statusConfig[agreement.status]?.badgeClass}>
                                    {React.createElement(statusConfig[agreement.status]?.icon, { className: 'mr-1' })}
                                    {statusConfig[agreement.status]?.label}
                                </Badge>
                            </TableCell>
                             <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center -space-x-2">
                                    {agreement.composers.slice(0, 3).map(c => (
                                        <Avatar key={c.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {agreement.composers.length > 3 && (
                                        <Avatar className="h-6 w-6 border-2 border-background">
                                            <AvatarFallback>+{agreement.composers.length - 3}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                               <FormattedDate dateString={agreement.createdAt} />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <Progress value={getSignatureProgress(agreement)} />
                            </TableCell>
                            <TableCell>
                               <AgreementActions agreement={agreement} onStatusChange={handleStatusChange} />
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
