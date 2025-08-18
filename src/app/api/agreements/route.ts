import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';

export async function GET(request: NextRequest) {
  console.log('🚀 GET /api/agreements - Starting request');
  
  try {
    // 1. Verificar headers
    const authorization = request.headers.get('authorization');
    console.log('📝 Authorization header:', authorization ? 'Present' : 'Missing');
    
    if (!authorization?.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authorization.split('Bearer ')[1];
    console.log('🔑 Token extracted, length:', token.length);

    // 2. Verificar Firebase Admin - CORREGIDO
    console.log('🔥 Attempting to verify token with Firebase Admin');
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token); // Usar adminAuth directamente
      console.log('✅ Token verified for user:', decodedToken.uid);
    } catch (authError) {
      console.error('❌ Token verification failed:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // 3. Verificar conexión a Firestore - CORREGIDO
    console.log('📊 Attempting to query Firestore for user:', userId);
    let querySnapshot;
    try {
      const agreementsCol = adminDb.collection('agreements'); // Usar adminDb
      querySnapshot = await agreementsCol
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      console.log('✅ Firestore query successful, docs count:', querySnapshot.size);
    } catch (firestoreError) {
      console.error('❌ Firestore query failed:', firestoreError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    // 4. Procesar resultados
    const agreements: Agreement[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const serializedComposers = (data.composers || []).map((composer: any) => ({
            ...composer,
            signedAt: composer.signedAt ? new Date(composer.signedAt._seconds * 1000).toISOString() : undefined,
        }));
        
        agreements.push({ 
            id: doc.id, 
            ...data,
            composers: serializedComposers,
            createdAt: data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : new Date().toISOString(),
            publicationDate: data.publicationDate ? new Date(data.publicationDate._seconds * 1000).toISOString() : new Date().toISOString(),
        } as Agreement);
      } catch (docError) {
        console.error('❌ Error processing document:', doc.id, docError);
      }
    });

    console.log('✅ Successfully processed agreements:', agreements.length);
    return NextResponse.json({ agreements });

  } catch (error) {
    console.error('💥 Unexpected error in GET /api/agreements:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token); // Corregido
    const userId = decodedToken.uid;

    const body = await request.json();
    
    const agreementData = {
      ...body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Draft',
    };

    const docRef = await adminDb.collection('agreements').add(agreementData); // Corregido
    const newAgreement = {
      id: docRef.id,
      ...agreementData,
      createdAt: agreementData.createdAt.toISOString(),
      updatedAt: agreementData.updatedAt.toISOString(),
    };

    return NextResponse.json({ agreement: newAgreement });
  } catch (error) {
    console.error('Error creating agreement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
