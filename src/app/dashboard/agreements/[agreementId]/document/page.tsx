// src/app/dashboard/agreements/[agreementId]/document/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { initialContractData } from '@/app/dashboard/page';
import { DocumentHeader } from '@/components/document-header';
import { LegalTerms } from '@/components/legal-terms';
import { SignersTable } from '@/components/agreement/signers-table';
import { adminAuth } from '@/lib/firebase-server';
import type { Contract } from '@/lib/types';
import { useUserProfile } from '@/hooks/useUserProfile';


// This is a server component that renders the document for PDF generation.
// It will be accessed by Puppeteer.
export default async function DocumentPage({ params }: { params: { agreementId: string } }) {
    const { agreementId } = params;
    
    // Basic auth check using cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        return new Response('Unauthorized', { status: 401 });
    }


    // Fetch agreement data (replace with your actual data fetching logic)
    const agreement = initialContractData.find(c => c.id === agreementId);

    if (!agreement) {
        notFound();
    }

    // A simplified version of your document, styled for print.
    return (
        <html lang="en">
            <head>
                <title>Agreement: {agreement.title}</title>
                <style>{`
                    body { font-family: sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
                    .container { max-width: 800px; margin: auto; padding: 40px; }
                    h1 { font-size: 24px; }
                    p { font-size: 12px; line-height: 1.5; }
                    .header { padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 20px; }
                    .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                    .sig-box { border-top: 1px solid #000; padding-top: 8px; }
                `}</style>
            </head>
            <body>
                <div className="container">
                    <header className="header">
                        <h1>{agreement.title}</h1>
                        <p>{agreement.desc}</p>
                    </header>
                    <main>
                         <p>
                            A continuación se detallan los términos y las firmas del presente acuerdo.
                         </p>
                         <LegalTerms/>
                    </main>
                    <section className="signatures">
                        <div className="sig-box">
                            <p>Firma Cliente</p>
                        </div>
                        <div className="sig-box">
                             <p>Firma Proveedor</p>
                        </div>
                    </section>
                </div>
            </body>
        </html>
    );
}
