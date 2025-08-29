
import { adminDb, adminAuth } from '@/lib/firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import type { Contract } from '@/types/legacy';
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

    if (sessionCookie) {
        try {
            const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
            userId = decodedClaims.uid;
        } catch (error) {
            console.error("Error verifying session cookie:", error);
            // If cookie verification fails, treat as no user logged in.
            userId = undefined;
        }
    }

    const agreements: Contract[] = [];

    if (userId) {
        try {
            const agreementsSnapshot = await adminDb.collection('agreements')
                .where('userId', '==', userId)
                .get();

            if (!agreementsSnapshot.empty) {
                agreementsSnapshot.forEach(doc => {
                    const rawData = doc.data();
                    const serializedData = serializeTimestamps(rawData);
                    agreements.push({
                        ...serializedData,
                        id: doc.id,
                    } as Contract);
                });
            }
        } catch (error) {
            console.error("Failed to fetch agreements from Firestore:", error);
        }
    }

    return (
        <AgreementsClientPage initialContracts={agreements} />
    );
}
