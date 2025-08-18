
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/agreements - Starting request');
  
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
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
    console.log('📊 Attempting to query Firestore for user:', userId);
    
    const querySnapshot = await adminDb.collection('agreements')
        .where('userId', '==', userId)
        .get();
      
    console.log('✅ Firestore query successful, docs count:', querySnapshot.size);

    const agreements: Agreement[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Robust date serialization
        const createdAt = data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : new Date().toISOString();
        const publicationDate = data.publicationDate; // Keep as string
        
        const serializedComposers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt?._seconds ? new Date(composer.signedAt._seconds * 1000).toISOString() : undefined,
        }));
        
        agreements.push({ 
            id: doc.id, 
            ...data,
            composers: serializedComposers,
            createdAt,
            publicationDate,
        } as Agreement);
    });

    // Sort in code
    agreements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('✅ Successfully processed agreements:', agreements.length);
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
