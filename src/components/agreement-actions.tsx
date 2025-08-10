
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generatePdfAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { mockAgreements } from '@/lib/data';
import { Edit, VenetianMask, Download, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export function AgreementActions({ agreementId }: { agreementId: string }) {
    const { toast } = useToast();

    const handleDownload = async () => {
        const result = await generatePdfAction(agreementId);
        if ('data' in result) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${result.data}`;
            link.download = `agreement-${agreementId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "PDF Generated", description: "Your download has started." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
    };

    const agreement = mockAgreements.find(a => a.id === agreementId);
    if (!agreement) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {agreement.status === 'Draft' && (
                    <DropdownMenuItem>
                        <Link href="#" className="flex items-center w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Agreement</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                {agreement.status !== 'Signed' && (
                    <DropdownMenuItem>
                        <Link href={`/dashboard/agreements/${agreement.id}/sign`} className="flex items-center w-full">
                            <VenetianMask className="mr-2 h-4 w-4" />
                            <span>Sign Agreement</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
