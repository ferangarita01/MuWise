
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Agreement, Composer } from '@/lib/types';
import { headers } from 'next/headers';

function safeTimestampToString(timestamp: any): string | undefined {
    if (!timestamp) return undefined;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
         return new Date(timestamp._seconds * 1000).toISOString();
    }
    return undefined;
}

function safeSerializeAgreement(doc: FirebaseFirestore.DocumentSnapshot): Agreement {
    const data = doc.data()!;

    const composers = (data.composers || []).map((composer: any) => ({
        ...composer,
        signedAt: safeTimestampToString(composer.signedAt),
    }));

    return {
        id: doc.id,
        userId: data.userId,
        songTitle: data.songTitle,
        performerArtists: data.performerArtists,
        duration: data.duration,
        publicationDate: safeTimestampToString(data.publicationDate)!,
        language: data.language,
        composers,
        status: data.status,
        createdAt: safeTimestampToString(data.createdAt)!,
        lastModified: safeTimestampToString(data.lastModified),
    };
}


// GET /api/agreements - Obtener todos los acuerdos del usuario
export async function GET(req: NextRequest) {
    try {
        const headersList = headers();
        const authorization = headersList.get('authorization');

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        
        const agreementsSnapshot = await adminDb.collection('agreements')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const agreements = agreementsSnapshot.docs.map(safeSerializeAgreement);
        
        return NextResponse.json({ agreements });

    } catch (error) {
        console.error('❌ GET /api/agreements error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}

// POST /api/agreements - Crear un nuevo acuerdo
export async function POST(req: NextRequest) {
    try {
        const headersList = headers();
        const authorization = headersList.get('authorization');
        
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }

        const token = authorization.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;
        
        const agreementData = await req.json();

        // Convert publicationDate string back to a Date object for Firestore
        const publicationDate = agreementData.publicationDate ? new Date(agreementData.publicationDate) : new Date();

        const newAgreement: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'publicationDate'> & { publicationDate: Date } = {
            ...agreementData,
            userId: userId,
            status: 'Draft',
            publicationDate: publicationDate,
        };
        
        // Remove id if it exists from the composers to let firestore handle it
        const composersWithoutId = newAgreement.composers.map(({ id, ...rest }) => rest);


        const docRef = await adminDb.collection('agreements').add({
            ...newAgreement,
            composers: composersWithoutId,
            createdAt: FieldValue.serverTimestamp(),
            lastModified: FieldValue.serverTimestamp(),
        });

        const newDoc = await docRef.get();
        const serializedAgreement = safeSerializeAgreement(newDoc);
        
        return NextResponse.json({ agreement: serializedAgreement }, { status: 201 });

    } catch (error) {
        console.error('❌ POST /api/agreements error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}
