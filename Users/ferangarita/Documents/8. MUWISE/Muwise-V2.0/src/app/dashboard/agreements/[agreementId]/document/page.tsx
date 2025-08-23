
// src/app/dashboard/agreements/[agreementId]/document/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { LegalTerms } from '@/components/legal-terms';
import { adminAuth, adminDb } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';


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


    // Fetch agreement data
    const agreementDoc = await adminDb.collection('agreements').doc(agreementId).get();

    if (!agreementDoc.exists) {
        notFound();
    }
    const agreement = agreementDoc.data() as Agreement;


    // A simplified version of your document, styled for print.
    return (
        <html lang="en">
            <head>
                <title>Agreement: {agreement.songTitle}</title>
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
                        <h1>{agreement.songTitle}</h1>
                        <p>{agreement.description}</p>
                    </header>
                    <main>
                         <p>
                            A continuación se detallan los términos y las firmas del presente acuerdo.
                         </p>
                         <LegalTerms/>
                    </main>
                    <section className="signatures">
                         {agreement.composers?.map((signer, index) => (
                            <div key={index} className="sig-box">
                                <p>Firma: {signer.name}</p>
                                {signer.signature && <img src={signer.signature} alt={`Signature of ${signer.name}`} style={{maxHeight: '60px', width: 'auto'}} />}
                                <p>Fecha: {signer.signedAt ? new Date(signer.signedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </body>
        </html>
    );
}
