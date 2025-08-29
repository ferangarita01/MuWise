
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
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

// Función para sincronizar la sesión con el backend
async function syncSession(user: User | null) {
  if (user) {
    try {
      const idToken = await user.getIdToken(true);
      // Enviar el token al backend para crear la cookie de sesión
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Failed to sync session cookie:', error);
    }
  } else {
    // Si no hay usuario, eliminar la cookie de sesión
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (mounted.current) {
        setUser(user);
        setLoading(false);
        // Sincronizar la sesión cada vez que el estado de auth cambie
        await syncSession(user);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      mounted.current = false;
      unsubscribe();
    };
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
