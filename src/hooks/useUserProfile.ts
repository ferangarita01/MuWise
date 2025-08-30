
'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useAuth } from './use-auth';
import type { User as AuthUser } from 'firebase/auth'; // Renamed to avoid conflict

// Defining a more complete UserProfile type based on application needs
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string;
  photoURL?: string;
  artistName?: string;
  primaryRole?: string;
  genres?: string[] | string;
  publisher?: string;
  proSociety?: 'none' | 'ascap' | 'bmi' | 'sesac' | 'other';
  ipiNumber?: string;
  phone?: string;
  locationCountry?: string;
  locationState?: string;
  locationCity?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'professional';
  bio?: string;
  website?: string;
  planId?: 'free' | 'creator' | 'pro' | 'enterprise';
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled';
  stripeCustomerId?: string; // For Stripe integration
  defaultPaymentMethod?: string; // Stripe PaymentMethod ID
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
};


export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    if (authLoading) {
      if (mounted.current) setLoading(true);
      return;
    }

    if (!authUser) {
      if (mounted.current) {
        setUserProfile(null);
        setLoading(false);
      }
      return;
    }

    if (mounted.current) setLoading(true);
    const userDocRef = doc(db, 'users', authUser.uid);

    const unsubscribe = onSnapshot(userDocRef, 
      (docSnap) => {
        if (!mounted.current) return;
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
        if (!mounted.current) return;
        setError(e as Error);
        console.error("Failed to fetch user profile:", e);
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      mounted.current = false;
      unsubscribe();
    };

  }, [authUser, authLoading]);

  return { user: authUser, userProfile, loading, error };
}
