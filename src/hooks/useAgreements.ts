
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { Agreement } from '@/lib/types';

export function useAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAgreements = useCallback(async () => {
    console.log('🔄 fetchAgreements called, user:', user?.uid);
    
    if (!user) {
      console.log('👤 No user, clearing agreements');
      setAgreements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Getting user token...');
      const token = await user.getIdToken();
      console.log('✅ Token obtained, length:', token.length);
      
      console.log('📡 Making API request to /api/agreements');
      const response = await fetch('/api/agreements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
          errorMessage = errorData.error || `HTTP ${response.status}`;
        } catch (jsonError) {
          console.error('❌ Failed to parse error response:', jsonError);
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      setAgreements(data.agreements);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('💥 Error in fetchAgreements:', errorMessage);
      setError(`Error fetching agreements: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAgreement = async (agreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();

    const response = await fetch('/api/agreements', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(agreementData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agreement');
    }

    const data = await response.json();
    setAgreements(prev => [data.agreement, ...prev]);
    return data.agreement;
  };

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  return {
    agreements,
    loading,
    error,
    refetch: fetchAgreements,
    createAgreement,
  };
}
