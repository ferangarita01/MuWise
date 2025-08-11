
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { generatePdfAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Edit, VenetianMask, Download, MoreHorizontal, Send, Archive } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import type { Agreement } from '@/lib/types';


export function AgreementActions({ agreement, onArchive }: { agreement: Agreement; onArchive: (id: string) => void; }) {
    const { toast } = useToast();

    const handleDownload = async () => {
        const result = await generatePdfAction(agreement.id);
        if ('data' in result) {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${result.data}`;
            link.download = `agreement-${agreement.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "PDF Generated", description: "Your download has started." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
    };
    
    const handleSend = () => {
        // Here you would call a server action to send for signature
        console.log("Sending agreement:", agreement.id);
        toast({ title: "Agreement Sent", description: `Invitations sent for ${agreement.songTitle}.`});
    }

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
                        <DropdownMenuItem>
                            <Link href={`/dashboard/agreements/${agreement.id}/edit`} className="flex items-center w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={handleSend}>
                            <Send className="mr-2 h-4 w-4" />
                            <span>Send for Signature</span>
                        </DropdownMenuItem>
                    </>
                )}
                {agreement.status === 'Partial' && (
                     <DropdownMenuItem onClick={handleSend}>
                        <Send className="mr-2 h-4 w-4" />
                        <span>Resend Invitations</span>
                    </DropdownMenuItem>
                )}
                
                {(agreement.status === 'Sent' || agreement.status === 'Partial' || agreement.status === 'Signed') && (
                    <DropdownMenuItem>
                        <Link href={`/dashboard/agreements/${agreement.id}/sign`} className="flex items-center w-full">
                            <VenetianMask className="mr-2 h-4 w-4" />
                            <span>Sign / View</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download PDF</span>
                </DropdownMenuItem>
                 {agreement.status === 'Signed' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onArchive(agreement.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Archive</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
