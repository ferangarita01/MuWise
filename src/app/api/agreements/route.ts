
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Agreement, Composer } from '@/lib/types';
import { headers } from 'next/headers';

// Función robusta para serializar un acuerdo, manejando timestamps de forma segura.
function safeSerializeAgreement(doc: FirebaseFirestore.DocumentSnapshot): Agreement {
    const data = doc.data()!;

    // Función auxiliar para convertir Timestamps a ISO strings de forma segura
    const safeTimestampToString = (timestamp: any): string | undefined => {
        if (!timestamp) {
            return undefined;
        }
        // Admin SDK Timestamp
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        // Ya es un string (desde el cliente)
        if (typeof timestamp === 'string') {
            return timestamp;
        }
        // Objeto con _seconds (a veces ocurre en serializaciones parciales)
        if (timestamp._seconds !== undefined && timestamp._nanoseconds !== undefined) {
             return new Date(timestamp._seconds * 1000).toISOString();
        }
        // Devuelve undefined si el formato es desconocido para evitar errores
        return undefined;
    };
    
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

        const newAgreement: Omit<Agreement, 'id'> = {
            ...agreementData,
            userId: userId,
            status: 'Draft',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            publicationDate: agreementData.publicationDate ? new Date(agreementData.publicationDate).toISOString() : new Date().toISOString(),
        };

        const docRef = await adminDb.collection('agreements').add({
            ...newAgreement,
            createdAt: FieldValue.serverTimestamp(), // Usar timestamp del servidor para la creación
            lastModified: FieldValue.serverTimestamp(),
            publicationDate: new Date(newAgreement.publicationDate)
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
