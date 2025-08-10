
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';
import { mockAgreements } from '@/lib/data';

export default function ArchivePage() {
    const archivedAgreements = mockAgreements.filter(a => a.status === 'Archived');

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Archive</h1>
                <p className="text-muted-foreground">
                    View your archived agreements.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Archive /> Archived Agreements</CardTitle>
                    <CardDescription>
                        These agreements are fully signed and stored for your records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {archivedAgreements.length > 0 ? (
                         <ul className="space-y-2">
                            {archivedAgreements.map(agreement => (
                                <li key={agreement.id} className="p-3 bg-secondary rounded-md">
                                    <p className="font-semibold">{agreement.songTitle}</p>
                                    <p className="text-sm text-muted-foreground">Archived on: {new Date(agreement.createdAt).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p>No archived agreements yet.</p>
                        </div>
                    )}
                   
                </CardContent>
            </Card>
        </div>
    );
}
