// src/hooks/useAgreements.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth.tsx';
import type { Agreement } from '@/lib/types';
import { db } from '@/lib/firebase-client';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';

// Helper para convertir Timestamps de Firestore a ISO strings de forma segura
function safeSerialize(docData: any): Agreement {
    const data = { ...docData };
    
    // Convierte el timestamp principal a ISO string
    if (data.createdAt instanceof Timestamp) {
        data.createdAt = data.createdAt.toDate().toISOString();
    }
     if (data.publicationDate instanceof Timestamp) {
        data.publicationDate = data.publicationDate.toDate().toISOString();
    }
     if (data.lastModified instanceof Timestamp) {
        data.lastModified = data.lastModified.toDate().toISOString();
    }
    
    // Convierte timestamps anidados en los compositores
    if (data.composers && Array.isArray(data.composers)) {
        data.composers = data.composers.map((composer: any) => {
            const newComposer = { ...composer };
            if (newComposer.signedAt instanceof Timestamp) {
                newComposer.signedAt = newComposer.signedAt.toDate().toISOString();
            }
            return newComposer;
        });
    }

    return data as Agreement;
}


export function useAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAgreements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const agreementsCol = collection(db, 'agreements');
    const q = query(agreementsCol, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedAgreements: Agreement[] = [];
        querySnapshot.forEach((doc) => {
            const serializedData = safeSerialize({ id: doc.id, ...doc.data() });
            fetchedAgreements.push(serializedData);
        });
        setAgreements(fetchedAgreements);
        setError(null);
        setLoading(false);
    }, (err) => {
        console.error('💥 Error fetching agreements from Firestore:', err);
        setError(err.message);
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const createAgreement = async (agreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
      
    try {
        const agreementsCol = collection(db, 'agreements');
        const newAgreementDoc = {
            ...agreementData,
            userId: user.uid,
            status: 'Draft',
            publicationDate: new Date(agreementData.publicationDate), // Convert string back to Date for Firestore
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp(),
        };
        const docRef = await addDoc(agreementsCol, newAgreementDoc);
        
        // No necesitamos actualizar el estado local aquí, onSnapshot se encargará de ello.
        return { id: docRef.id, ...newAgreementDoc };

    } catch (e) {
        console.error("Error creating agreement: ", e);
        throw e;
    }
  };

  return {
    agreements,
    loading,
    error,
    createAgreement,
  };
}
