
import { adminDb, adminStorage } from '@/lib/firebase-server';

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

  // Modified to handle the PDF upload and status update
  async updateStatus(agreementId: string, status: string, pdfBase64?: string): Promise<{ pdfUrl?: string }> {
    const agreementRef = adminDb.collection('agreements').doc(agreementId);
    
    let pdfUrl: string | undefined = undefined;

    if (status === 'Completado' && pdfBase64) {
      // The upload logic is now handled here, on the server
      pdfUrl = await this.uploadPdf(pdfBase64, agreementId);
    }
    
    const updateData: { status: string; lastModified: string; pdfUrl?: string } = {
      status: status,
      lastModified: new Date().toISOString(),
    };

    if (pdfUrl) {
      updateData.pdfUrl = pdfUrl;
    }
    
    await agreementRef.update(updateData);

    return { pdfUrl };
  }

  // This is a private helper method for the service
  private async uploadPdf(pdfBase64: string, agreementId: string): Promise<string> {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      throw new Error("Firebase Storage bucket name is not configured in environment variables.");
    }
    
    const bucket = adminStorage.bucket(bucketName);
    const filePath = `agreements-pdf/${agreementId}-${Date.now()}.pdf`;
    const file = bucket.file(filePath);

    // The base64 string from the client includes the data URL prefix, remove it.
    const base64Data = pdfBase64.split(';base64,').pop();

    if (!base64Data) {
      throw new Error('Invalid base64 string for PDF upload.');
    }
    
    const buffer = Buffer.from(base64Data, 'base64');

    await file.save(buffer, {
      metadata: { contentType: 'application/pdf' },
      public: true, // <-- AÑADIDO: Hacer el archivo público al subirlo
    });
    
    // No es necesario llamar a makePublic() si ya se especifica en save()
    return file.publicUrl();
  }
}
