
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Download, Send, VenetianMask } from 'lucide-react';
import Link from 'next/link';

// Dummy data for signatories
const signatories = [
  // { name: 'John Doe', status: 'Signed', date: '2023-10-27' },
  // { name: 'Jane Smith', status: 'Pending', date: null },
];

function ContractDocument() {
  const placeholders = {
    Date: '_______________',
    Client_Name: '_______________',
    DJ_Name: '_______________',
    Event_Type: '_______________',
    Event_Date: '_______________',
    Event_Time: '_______________',
    Event_Location: '_______________',
    Total_Fee: '_______________',
    Deposit_Amount: '_______________',
  };

  const text = `This DJ Service Contract (the "Agreement") is made effective as of {{Date}}, by and between {{Client_Name}} ("Client") and {{DJ_Name}} ("DJ").

1. **Services.** The DJ will provide music and entertainment services for the event detailed below:
   Event: {{Event_Type}}
   Date: {{Event_Date}}
   Time: {{Event_Time}}
   Location: {{Event_Location}}

2. **Payment.** The Client agrees to pay the DJ a total fee of {{Total_Fee}}. A non-refundable deposit of {{Deposit_Amount}} is due upon signing this Agreement. The remaining balance is due on the day of the event.

3. **Cancellation.** If the Client cancels the event less than 30 days prior, the full amount will be due. If the DJ cancels, the deposit will be fully refunded.

4. **Equipment.** The DJ will provide all necessary equipment to perform the services. The Client must provide a safe location with adequate power.

5. **Indemnification.** The Client agrees to indemnify and hold the DJ harmless from any liability, claims, or damages arising from the event, except for those caused by the DJ's gross negligence.`;

  // Use a regex to replace placeholders while preserving structure
  const formattedText = text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return placeholders[key as keyof typeof placeholders] || match;
  });

  return (
    <Card>
      <CardContent className="p-8">
        <p className="whitespace-pre-line leading-relaxed">{formattedText}</p>
      </CardContent>
    </Card>
  );
}

export default function TemplatePage({ params }: { params: { templateId: string } }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
         <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard"><ArrowLeft /> Back to Templates</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Service Contract for DJs</h1>
        <p className="text-muted-foreground">
          A standard agreement for hiring a DJ for an event or performance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Document */}
        <div className="lg:col-span-2">
            <ContractDocument />
        </div>

        {/* Right Side: Actions Sidebar */}
        <div className="space-y-6 sticky top-8">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                <VenetianMask className="mr-2" />
                Sign Document
              </Button>
              <Button variant="secondary" className="w-full" size="lg">
                <Download className="mr-2" />
                Download as PDF
              </Button>
               <Button variant="outline" className="w-full" size="lg" disabled>
                <Clock className="mr-2" />
                Digital Certificate (soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <Input type="email" placeholder="recipient@example.com" />
                <Button variant="accent" className="w-full text-accent-foreground">
                  <Send className="mr-2" />
                  Send Request
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signatories</CardTitle>
            </CardHeader>
            <CardContent>
              {signatories.length > 0 ? (
                <ul className="space-y-3">
                  {signatories.map((s, i) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span>{s.name}</span>
                      <span className={s.status === 'Signed' ? 'text-green-500' : 'text-yellow-500'}>{s.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No signatures yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
