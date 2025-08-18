
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { generatePdfAction, updateAgreementStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Edit, VenetianMask, Download, MoreHorizontal, Send, Archive } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import type { Agreement, AgreementStatus } from '@/lib/types';

export function AgreementActions({ 
    agreement, 
    onStatusChange 
}: { 
    agreement: Agreement; 
    onStatusChange: (id: string, status: AgreementStatus) => void; 
}) {
    const { toast } = useToast();
    const router = useRouter();

    const handleAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string) => {
        try {
            await action();
            toast({ title: successMessage });
        } catch (error) {
            console.error(errorMessage, error);
            toast({ variant: 'destructive', title: "Error", description: errorMessage });
        }
    };

    const handleDownload = () => handleAction(
        async () => {
            const result = await generatePdfAction(agreement.id);
            if ('data' in result) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${result.data}`;
                link.download = `agreement-${agreement.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(result.error);
            }
        },
        "PDF Generated",
        "Failed to download PDF."
    );

    const handleStatusUpdate = (status: AgreementStatus, successMessage: string, errorMessage: string) => handleAction(
        async () => {
            await updateAgreementStatus(agreement.id, status);
            onStatusChange(agreement.id, status);
        },
        successMessage,
        errorMessage
    );
    
    const handleSend = () => handleStatusUpdate(
        'Sent',
        `Invitations sent for ${agreement.songTitle}.`,
        'Failed to send agreement.'
    );

    const handleArchive = () => handleStatusUpdate(
        'Archived',
        'Agreement has been archived.',
        'Failed to archive agreement.'
    );
    
    const navigateTo = (path: string) => () => router.push(path);

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
                    <>
                        <DropdownMenuItem onSelect={navigateTo(`/dashboard/agreements/${agreement.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={handleSend}>
                            <Send className="mr-2 h-4 w-4" />
                            <span>Send for Signature</span>
                        </DropdownMenuItem>
                    </>
                )}
                {agreement.status === 'Partial' && (
                     <DropdownMenuItem onSelect={handleSend}>
                        <Send className="mr-2 h-4 w-4" />
                        <span>Resend Invitations</span>
                    </DropdownMenuItem>
                )}
                
                {(['Draft', 'Sent', 'Partial', 'Signed'].includes(agreement.status)) && (
                    <DropdownMenuItem onSelect={navigateTo(`/dashboard/agreements/${agreement.id}/sign`)}>
                        <VenetianMask className="mr-2 h-4 w-4" />
                        <span>Sign / View</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download PDF</span>
                </DropdownMenuItem>
                 {agreement.status === 'Signed' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleArchive}>
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Archive</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
