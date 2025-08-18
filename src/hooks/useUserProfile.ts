
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useAuth } from './use-auth.tsx';
import type { User as UserProfile } from '@/lib/types';

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', authUser.uid);

    const unsubscribe = onSnapshot(userDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // If no profile in Firestore, create a basic one from auth
          const basicProfile: UserProfile = {
            uid: authUser.uid,
            displayName: authUser.displayName || 'New User',
            email: authUser.email || '',
            photoURL: authUser.photoURL || '',
            createdAt: authUser.metadata.creationTime || new Date().toISOString(),
          };
          setUserProfile(basicProfile);
        }
        setLoading(false);
      },
      (e) => {
        setError(e as Error);
        console.error("Failed to fetch user profile:", e);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, [authUser, authLoading]);

  return { userProfile, loading, error };
}
