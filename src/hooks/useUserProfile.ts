
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useAuth } from './use-auth';
import type { User } from '@/lib/types';

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!authUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userDocRef = doc(db, 'users', authUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as User);
        } else {
          // If no profile in Firestore, create a basic one from auth
          const basicProfile: User = {
            uid: authUser.uid,
            displayName: authUser.displayName || 'New User',
            email: authUser.email || '',
            photoURL: authUser.photoURL || '',
            createdAt: authUser.metadata.creationTime || new Date().toISOString(),
          };
          setUserProfile(basicProfile);
        }
      } catch (e) {
        setError(e as Error);
        console.error("Failed to fetch user profile:", e);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [authUser, authLoading]);

  return { userProfile, loading: authLoading || loading, error };
}
