
import { NextRequest, NextResponse } from 'next/server';
import { db, verifyAuthToken } from '@/lib/firebase-server';
import type { Agreement } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const agreementsCol = db.collection('agreements');
    const querySnapshot = await agreementsCol
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const agreements: Agreement[] = [];
    querySnapshot.forEach((doc) => {
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
    });
    
    return NextResponse.json({ agreements });

  } catch (error) {
    console.error('Error getting agreements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    
    const agreementData = {
      ...body,
      userId,
      createdAt: new Date().toISOString(),
      status: 'Draft',
    };

    const docRef = await db.collection('agreements').add(agreementData);
    const newAgreement = {
      id: docRef.id,
      ...agreementData,
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

    