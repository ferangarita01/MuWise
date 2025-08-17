
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    getToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const getToken = async (): Promise<string | null> => {
      if (!user) return null;
      return await user.getIdToken();
  }

  return (
    <AuthContext.Provider value={{ user, loading, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
