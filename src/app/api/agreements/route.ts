
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to safely convert Firestore Timestamps to ISO strings
function safeTimestampToString(timestamp: any): string | undefined {
    if (!timestamp) {
        return undefined;
    }

    // For Firebase Admin SDK v9+ Timestamps
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toISOString();
    }
    
    // For older Firebase client Timestamps that might be plain objects
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }
    
    // For Timestamps that might have been partially serialized
    if (timestamp && typeof timestamp._seconds === 'number' && typeof timestamp._nanoseconds === 'number') {
        return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000).toISOString();
    }
    
    // If it's already a string, try to parse it to ensure it's a valid date, then format to ISO
    if (typeof timestamp === 'string') {
        try {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) {
                return d.toISOString();
            }
        } catch (e) {
             // Ignore invalid date strings
        }
    }
    
    // Return undefined if no valid format is found
    return undefined;
}


export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('❌ Token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    
    const querySnapshot = await adminDb.collection('agreements')
        .where('userId', '==', userId)
        .get();

    const agreements: Agreement[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        const serializedComposers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: safeTimestampToString(composer.signedAt),
        }));
        
        agreements.push({ 
            id: doc.id, 
            ...data,
            composers: serializedComposers,
            createdAt: safeTimestampToString(data.createdAt) || new Date().toISOString(),
            publicationDate: data.publicationDate,
        } as Agreement);
    });

    agreements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ agreements });

  } catch (error) {
    console.error('💥 Unexpected error in GET /api/agreements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    
    const agreementData = {
      ...body,
      userId,
      createdAt: Timestamp.now(), // Use Admin SDK Timestamp
      updatedAt: Timestamp.now(),
      status: 'Draft',
    };

    const docRef = await adminDb.collection('agreements').add(agreementData);
    
    const newDocSnap = await docRef.get();
    const newDocData = newDocSnap.data();

    if (!newDocData) {
        throw new Error("Failed to retrieve the newly created agreement.");
    }

    const newAgreement = {
      id: docRef.id,
      ...newDocData,
      createdAt: safeTimestampToString(newDocData.createdAt) || new Date().toISOString(),
      updatedAt: safeTimestampToString(newDocData.updatedAt) || new Date().toISOString(),
      publicationDate: newDocData.publicationDate,
       composers: (newDocData.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: safeTimestampToString(composer.signedAt),
        })),
    };

    return NextResponse.json({ agreement: newAgreement }, { status: 201 });
  } catch (error) {
    console.error('Error creating agreement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
