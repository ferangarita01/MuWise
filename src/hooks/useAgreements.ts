
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

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await fetch('/api/agreements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agreements');
      }

      const data = await response.json();
      setAgreements(data.agreements);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching agreements:', err);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  const createAgreement = async (agreementData: Omit<Agreement, 'id' | 'createdAt' | 'status' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    const token = await getToken();
    if (!token) {
        throw new Error('Authentication token not available');
    }

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

    