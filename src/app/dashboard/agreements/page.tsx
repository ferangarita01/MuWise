
import { adminDb, adminAuth } from '@/lib/firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import type { Contract, Signer } from '@/types/legacy';
import AgreementsClientPage from './AgreementsClientPage';
import { cookies } from 'next/headers';

// Helper function to recursively serialize Timestamps
const serializeTimestamps = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => serializeTimestamps(item));
    }

    const serializedData: any = {};
    for (const key in data) {
        serializedData[key] = serializeTimestamps(data[key]);
    }
    return serializedData;
};

// This is now a Server Component to fetch data from Firestore
export default async function AgreementsPage() {
    const sessionCookie = (await cookies()).get('session')?.value;
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (sessionCookie) {
        try {
            const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
            userId = decodedClaims.uid;
            userEmail = decodedClaims.email;
        } catch (error) {
            console.error("Error verifying session cookie:", error);
            // In case of error, ensure both are undefined to prevent partial queries
            userId = undefined;
            userEmail = undefined;
        }
    }
    
    // Fallback for local development or if cookie fails
    if (!userId) {
        userId = "DlmjCU2RtJZ6pmbRNwDCTwkD3Dn1";
        userEmail = "ferangaritam@gmail.com";
    }

    const agreementsMap = new Map<string, Contract>();

    // Proceed only if we have a valid user identity
    if (userId) {
        // Query 1: Agreements where the user is the creator
        try {
            const creatorAgreementsSnapshot = await adminDb.collection('agreements')
                .where('userId', '==', userId)
                .get();

            creatorAgreementsSnapshot.forEach(doc => {
                const rawData = doc.data();
                const serializedData = serializeTimestamps(rawData);
                agreementsMap.set(doc.id, {
                    ...serializedData,
                    id: doc.id,
                } as Contract);
            });
        } catch (error) {
            console.error("Failed to fetch agreements as creator from Firestore:", error);
        }

        // Query 2: Agreements where the user is a signer (using the new `signerEmails` field)
        if (userEmail) {
            try {
                const signerAgreementsSnapshot = await adminDb.collection('agreements')
                    .where('signerEmails', 'array-contains', userEmail)
                    .get();

                signerAgreementsSnapshot.forEach(doc => {
                    // The map automatically handles duplicates
                    if (!agreementsMap.has(doc.id)) {
                        const rawData = doc.data();
                        const serializedData = serializeTimestamps(rawData);
                        agreementsMap.set(doc.id, {
                            ...serializedData,
                            id: doc.id,
                        } as Contract);
                    }
                });
            } catch (error) {
                console.error("Failed to fetch agreements as signer from Firestore:", error);
            }
        }
    }


    const allAgreements = Array.from(agreementsMap.values());

    return (
        <AgreementsClientPage initialContracts={allAgreements} />
    );
}
