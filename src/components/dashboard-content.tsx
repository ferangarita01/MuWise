
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
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
import { mockAgreements } from '@/lib/data';
import type { Agreement, AgreementStatus } from '@/lib/types';
import { PlusCircle, FileText, Send, CheckCircle, Clock, Archive, PenSquare, Search, Users, BarChart } from 'lucide-react';
import { AgreementActions } from '@/components/agreement-actions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    label: 'Draft',
    icon: PenSquare,
    badgeClass: 'bg-muted text-muted-foreground border-muted hover:bg-muted/80',
    color: 'hsl(var(--muted))'
  },
  Sent: {
    label: 'Sent',
    icon: Send,
    badgeClass: 'bg-primary/20 text-primary border-primary/20 hover:bg-primary/30',
    color: 'hsl(var(--primary))'
  },
  Partial: {
    label: 'Partial',
    icon: Clock,
    badgeClass: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20',
    color: 'hsl(var(--accent))'
  },
  Signed: {
    label: 'Signed',
    icon: CheckCircle,
    badgeClass: 'bg-green-500/20 text-green-600 border-green-500/20',
    color: 'hsl(var(--chart-1))'
  },
  Archived: {
    label: 'Archived',
    icon: Archive,
    badgeClass: 'bg-secondary text-secondary-foreground border-secondary',
    color: 'hsl(var(--secondary))'
  }
};


export function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [agreements, setAgreements] = React.useState<Agreement[]>([]);
  const [signedThisMonth, setSignedThisMonth] = React.useState(0);

  React.useEffect(() => {
    setAgreements(mockAgreements);
  }, []);

  React.useEffect(() => {
    if(agreements.length > 0) {
      setSignedThisMonth(agreements.filter(a => a.status === 'Signed' && new Date(a.createdAt).getMonth() === new Date().getMonth()).length);
    }
  }, [agreements]);


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
  
  const handleArchive = (agreementId: string) => {
    setAgreements(prev => prev.map(a => a.id === agreementId ? {...a, status: 'Archived'} : a));
  };


  const sortedAndFilteredAgreements = React.useMemo(() => {
    let filtered = agreements.filter(agreement => {
      const statusMatch = !statusFilter || agreement.status === statusFilter;
      const searchMatch = !searchQuery || agreement.songTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
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


  const totalAgreements = agreements.length;
  const uniqueComposers = new Set(agreements.flatMap(a => a.composers.map(c => c.email))).size;
  

  const chartData = React.useMemo(() => {
    const statusCounts = (Object.keys(statusConfig) as AgreementStatus[]).reduce((acc, status) => {
        acc[status] = agreements.filter(a => a.status === status).length;
        return acc;
    }, {} as Record<AgreementStatus, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: statusConfig[status as AgreementStatus].color
    }));
  }, [agreements]);
  
  const chartConfig = {
    count: { label: 'Agreements' },
    ...statusConfig
  };


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
            Overview of your songwriter split agreements.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agreements/select-type">
            <PlusCircle />
            Create New Agreement
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Agreements
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgreements}</div>
            <p className="text-xs text-muted-foreground">
              All time agreements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Composers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueComposers}</div>
            <p className="text-xs text-muted-foreground">
              Across all agreements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{signedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
             New fully executed agreements
            </p>
          </CardContent>
        </Card>
        {/* <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                Agreements by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[100px] w-full">
             <ChartContainer config={chartConfig} className="h-full w-full">
                <RechartsBarChart layout="vertical" data={chartData} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="status" type="category" tickLine={false} axisLine={false} tick={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" layout="vertical" stackId="a" radius={5} />
                </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agreements</CardTitle>
          <CardDescription>
            Manage your existing split agreements.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by song title..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => router.push(`${pathname}?${createQueryString('q', e.target.value)}`)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={statusFilter || 'all'} onValueChange={(value) => router.push(`${pathname}?${createQueryString('status', value === 'all' ? '' : value)}`)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {(Object.keys(statusConfig) as AgreementStatus[]).map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={sortBy} onValueChange={(value) => router.push(`${pathname}?${createQueryString('sortBy', value)}`)}>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Composers</TableHead>
                <TableHead className="hidden lg:table-cell">Signature Progress</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredAgreements.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell className="font-medium">
                    {agreement.songTitle}
                  </TableCell>
                   <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[agreement.status].badgeClass}
                    >
                      {React.createElement(statusConfig[agreement.status].icon, {
                        className: 'mr-1 h-3 w-3',
                      })}
                      {statusConfig[agreement.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    <div className="flex items-center space-x-2">
                        {agreement.composers.map(composer => (
                            <Avatar key={composer.id} className="h-6 w-6">
                                <AvatarImage src={`https://i.pravatar.cc/40?u=${composer.email}`} />
                                <AvatarFallback>{composer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        <span className="truncate">{agreement.composers.map((c) => c.name).join(', ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={getSignatureProgress(agreement)} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {agreement.composers.filter(c => c.signature).length}/{agreement.composers.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(agreement.createdAt), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>
                    <AgreementActions agreement={agreement} onArchive={handleArchive} />
                  </TableCell>
                </TableRow>
              ))}
               {sortedAndFilteredAgreements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No agreements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
