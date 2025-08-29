
import { adminDb } from '@/lib/firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import type { Contract } from '@/types/legacy';
import AgreementsClientPage from './AgreementsClientPage';

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
    
    const agreements: Contract[] = [];

    try {
        // Fetch all agreements from Firestore. In a real-world app, you'd filter by userId.
        const agreementsSnapshot = await adminDb.collection('agreements').get();

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
        // We can render the page with an empty list or show an error message.
        // For now, we'll proceed with an empty list.
    }

    return (
        <AgreementsClientPage initialContracts={agreements} />
    );
}
