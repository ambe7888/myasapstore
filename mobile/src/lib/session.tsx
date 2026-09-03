import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { fetchMe } from '@/api/auth';
import { setApiToken } from '@/api/client';
import type { User } from '@/api/types';
import { useStorageState } from './storage';

interface SessionContextValue {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isTokenLoading, token], setToken] = useStorageState('session_token');
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Keep the axios client's in-memory token in sync with persisted storage.
  useEffect(() => {
    setApiToken(token ?? null);
  }, [token]);

  // Once we know whether a token exists, fetch the current user so we don't
  // trust a stale/expired token forever.
  useEffect(() => {
    if (isTokenLoading) return;

    if (!token) {
      setUser(null);
      setIsUserLoading(false);
      return;
    }

    setIsUserLoading(true);
    fetchMe()
      .then(setUser)
      .catch(() => {
        // Token is invalid/expired server-side — drop it.
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsUserLoading(false));
  }, [isTokenLoading, token]);

  const signIn = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    setUser(await fetchMe());
  };

  return (
    <SessionContext.Provider
      value={{
        token,
        user,
        isLoading: isTokenLoading || isUserLoading,
        signIn,
        signOut,
        refreshUser,
      }}>
      {children}
    </SessionContext.Provider>
  );
}
