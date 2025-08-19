
import { https, setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { PDFDocument, rgb } from 'pdf-lib';
import type { Agreement, AgreementStatus, Composer } from '../types';

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();
const auth = getAuth();

setGlobalOptions({ region: 'us-central1' });

// Middleware to check for authentication
const withAuth = (handler: (req: https.Request, res: https.Response, uid: string) => Promise<void>) => 
  async (req: https.Request, res: https.Response) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        res.status(401).send({ error: 'Unauthorized: No token provided.' });
        return;
    }
    try {
        // Here we just verify the token is valid, we don't need to check the UID for server-to-server calls
        await auth.verifyIdToken(idToken);
        await handler(req, res, "server-next-js");
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).send({ error: 'Forbidden: Invalid token.' });
    }
};

// Helper to send successful responses
const sendSuccess = (res: https.Response, data: any, message = 'Operation successful') => {
    res.status(200).send({ status: 'success', message, data });
};

// Helper to send error responses
const sendError = (res: https.Response, error: any, defaultMessage = 'An internal error occurred', statusCode = 500) => {
    console.error(defaultMessage, error);
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(statusCode).send({ status: 'error', error: message });
};

// API Endpoints
const handlers: { [key: string]: (body: any, uid: string) => Promise<any> } = {
    getAgreement: async ({ agreementId }) => {
        const doc = await db.collection('agreements').doc(agreementId).get();
        if (!doc.exists) throw new Error('Agreement not found');

        const data = doc.data()!;
        const toISO = (timestamp: any) => timestamp?._seconds ? new Date(timestamp._seconds * 1000).toISOString() : new Date().toISOString();

        const composers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?._seconds ? new Date(composer.signedAt._seconds * 1000).toISOString() : undefined,
        }));
        
        return {
            id: doc.id,
            ...data,
            composers,
            createdAt: toISO(data.createdAt),
            publicationDate: toISO(data.publicationDate),
            lastModified: data.lastModified ? toISO(data.lastModified) : toISO(data.createdAt),
        } as Agreement;
    },
    updateAgreementStatus: async ({ agreementId, status }) => {
        await db.collection('agreements').doc(agreementId).update({ status, lastModified: new Date() });
        return { id: agreementId, status };
    },
    generatePdf: async ({ agreementId }) => {
        const agreementSnapshot = await db.collection('agreements').doc(agreementId).get();
        if (!agreementSnapshot.exists) throw new Error('Agreement not found');
        const agreement = agreementSnapshot.data() as Agreement;

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const font = await pdfDoc.embedFont('Helvetica');
        let y = page.getHeight() - 50;
        
        page.drawText(`Agreement: ${agreement.songTitle}`, { x: 50, y, size: 18, font });
        y -= 50;

        agreement.composers.forEach(c => {
            page.drawText(`Composer: ${c.name} (${c.share}%)`, { x: 50, y, size: 12, font });
            y -= 20;
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes).toString('base64');
    },
    // Add other handlers from actions.ts here...
};

export const muwiseApi = https.onRequest(withAuth(async (req, res, uid) => {
    const { endpoint } = req.params; // Expecting endpoint in URL path, e.g., /muwiseApi/getAgreement
    const handler = handlers[endpoint];

    if (req.method !== 'POST' || !handler) {
        return sendError(res, null, `Endpoint ${req.method} /${endpoint} not found.`, 404);
    }

    try {
        const result = await handler(req.body, uid);
        sendSuccess(res, result);
    } catch (error) {
        sendError(res, error);
    }
}));
