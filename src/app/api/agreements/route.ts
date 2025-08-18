
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to safely convert Firestore Timestamps
function safeTimestampToString(timestamp: any): string | undefined {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate().toISOString();
    }
    // Handle cases where it might already be a string or other formats if necessary
    if (typeof timestamp === 'string') {
        return timestamp;
    }
    // For Firestore Timestamps from older client SDKs that might be objects
    if (timestamp && typeof timestamp._seconds === 'number') {
        return new Date(timestamp._seconds * 1000).toISOString();
    }
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
            // Safely convert signedAt timestamp
            signedAt: safeTimestampToString(composer.signedAt),
        }));
        
        agreements.push({ 
            id: doc.id, 
            ...data,
            composers: serializedComposers,
            // Safely convert createdAt timestamp
            createdAt: safeTimestampToString(data.createdAt) || new Date().toISOString(),
            // Ensure publicationDate is passed as a string
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
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Draft',
    };

    const docRef = await adminDb.collection('agreements').add(agreementData);
    const newAgreement = {
      id: docRef.id,
      ...agreementData,
      createdAt: agreementData.createdAt.toISOString(),
      updatedAt: agreementData.updatedAt.toISOString(),
      publicationDate: body.publicationDate,
    };

    return NextResponse.json({ agreement: newAgreement }, { status: 201 });
  } catch (error) {
    console.error('Error creating agreement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown internal server error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
