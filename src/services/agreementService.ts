import { adminDb, adminStorage } from '@/lib/firebase-server';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';

export class AgreementService {
  async updateSignerSignature({
    agreementId,
    signerId,
    signatureDataUrl
  }: {
    agreementId: string;
    signerId: string;
    signatureDataUrl: string;
  }): Promise<{ signedAt: string }> {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const agreementDoc = await agreementRef.get();

    if (!agreementDoc.exists) {
      throw new Error('Agreement not found.');
    }

    const agreementData = agreementDoc.data();
    const signers = agreementData?.signers || [];
    
    const signerIndex = signers.findIndex((s: any) => s.id === signerId);

    if (signerIndex === -1) {
      throw new Error('Signer not found in this agreement.');
    }

    const signedAt = new Date().toISOString();
    signers[signerIndex].signed = true;
    signers[signerIndex].signedAt = signedAt;
    signers[signerIndex].signature = signatureDataUrl;

    await agreementRef.update({ 
      signers,
      lastModified: new Date().toISOString(),
    });

    return { signedAt };
  }

  async updateStatus(agreementId: string, status: string): Promise<{ pdfUrl?: string }> {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    const agreementDoc = await agreementRef.get();

    if (!agreementDoc.exists) {
      throw new Error('Agreement not found.');
    }

    let pdfUrl = null;
    if (status === 'Completado') {
      pdfUrl = await this.generatePDF(agreementId);
    }
    
    await agreementRef.update({
      status: status,
      pdfUrl: pdfUrl,
      lastModified: new Date().toISOString(),
    });

    return { pdfUrl };
  }

  private async generatePDF(agreementId: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set session cookie for authentication
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      await page.setCookie({
        name: 'session',
        value: sessionCookie.value,
        domain: new URL(process.env.NEXT_PUBLIC_BASE_URL!).hostname,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    } else {
      throw new Error('Authentication session not found for PDF generation.');
    }

    const documentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}/document`;
    await page.goto(documentUrl, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const bucket = adminStorage.bucket();
    const filePath = `agreements-pdf/${agreementId}-${Date.now()}.pdf`;
    const file = bucket.file(filePath);

    await file.save(pdfBuffer, {
      metadata: { contentType: 'application/pdf' },
    });
    await file.makePublic();
    
    return file.publicUrl();
  }
}