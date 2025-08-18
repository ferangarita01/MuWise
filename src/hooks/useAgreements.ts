
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import type { Agreement } from '@/lib/types';

export function useAgreements() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getToken } = useAuth();

  const fetchAgreements = useCallback(async () => {
    if (!user) {
      setAgreements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
      
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available.");
      }
      
      const response = await fetch('/api/agreements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
          errorDetails = errorData.error || errorData.details || errorDetails;
        } catch (jsonError) {
          console.error('❌ Failed to parse error response:', jsonError);
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      setAgreements(data.agreements);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('💥 Error in fetchAgreements:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  const createAgreement = async (agreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const token = await getToken();
    if (!token) throw new Error("Authentication token not available.");

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
    setAgreements(prev => [data.agreement, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
