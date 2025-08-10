
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
import { PlusCircle, FileText, Send, CheckCircle, Clock, Archive, PenSquare, Search } from 'lucide-react';
import { AgreementActions } from '@/components/agreement-actions';

const statusConfig: Record<
  AgreementStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  Draft: {
    label: 'Draft',
    icon: PenSquare,
    badgeClass: 'bg-muted text-muted-foreground border-muted hover:bg-muted/80',
  },
  Sent: {
    label: 'Sent',
    icon: Send,
    badgeClass: 'bg-primary/20 text-primary border-primary/20 hover:bg-primary/30',
  },
  Partial: {
    label: 'Partial',
    icon: Clock,
    badgeClass: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20',
  },
  Signed: {
    label: 'Signed',
    icon: CheckCircle,
    badgeClass: 'bg-green-500/20 text-green-600 border-green-500/20',
  },
  Archived: {
    label: 'Archived',
    icon: Archive,
    badgeClass: 'bg-secondary text-secondary-foreground border-secondary',
  }
};


export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [agreements, setAgreements] = React.useState<Agreement[]>(mockAgreements);

  const statusFilter = searchParams.get('status') as AgreementStatus | null;
  const searchQuery = searchParams.get('q') || '';

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

  const filteredAgreements = React.useMemo(() => {
    return agreements.filter(agreement => {
      const statusMatch = !statusFilter || agreement.status === statusFilter;
      const searchMatch = !searchQuery || agreement.songTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [agreements, statusFilter, searchQuery]);


  const totalAgreements = agreements.length;
  const pendingAgreements = agreements.filter(
    (a) => a.status === 'Sent' || a.status === 'Partial'
  ).length;
  const drafts = agreements.filter((a) => a.status === 'Draft').length;
  
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
          <Link href="/dashboard/agreements/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Agreement
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              All agreements ever created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Signatures
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAgreements}</div>
            <p className="text-xs text-muted-foreground">
              Agreements awaiting signatures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <PenSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts}</div>
            <p className="text-xs text-muted-foreground">
              Unsent agreements
            </p>
          </CardContent>
        </Card>
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
              <div className="flex gap-2">
                {(Object.keys(statusConfig) as AgreementStatus[]).map(status => (
                  <Button 
                    key={status}
                    variant={statusFilter === status ? "secondary" : "ghost"}
                    onClick={() => router.push(`${pathname}?${createQueryString('status', statusFilter === status ? '' : status)}`)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
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
              {filteredAgreements.map((agreement) => (
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
                    {agreement.composers.map((c) => c.name).join(', ')}
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
                    <AgreementActions agreement={agreement} />
                  </TableCell>
                </TableRow>
              ))}
               {filteredAgreements.length === 0 && (
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
