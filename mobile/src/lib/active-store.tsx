import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { fetchStores } from '@/api/stores';
import type { Store } from '@/api/types';
import { useSession } from './session';

const STORAGE_KEY = 'active_store_id';

interface ActiveStoreContextValue {
  stores: Store[];
  activeStore: Store | null;
  isLoading: boolean;
  setActiveStoreId: (id: number) => void;
  refresh: () => Promise<void>;
}

const ActiveStoreContext = createContext<ActiveStoreContextValue | null>(null);

export function useActiveStore() {
  const value = useContext(ActiveStoreContext);
  if (!value) {
    throw new Error('useActiveStore must be used within an <ActiveStoreProvider />');
  }
  return value;
}

export function ActiveStoreProvider({ children }: PropsWithChildren) {
  const { user } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const fetchedStores = await fetchStores();
      setStores(fetchedStores);

      const savedId = await AsyncStorage.getItem(STORAGE_KEY);
      const savedIdNum = savedId ? Number(savedId) : null;
      const stillOwned = fetchedStores.some((s) => s.id === savedIdNum);

      setActiveStoreIdState(stillOwned ? savedIdNum : (fetchedStores[0]?.id ?? null));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
    } else {
      setStores([]);
      setActiveStoreIdState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const setActiveStoreId = (id: number) => {
    setActiveStoreIdState(id);
    AsyncStorage.setItem(STORAGE_KEY, String(id));
  };

  const activeStore = stores.find((s) => s.id === activeStoreId) ?? null;

  return (
    <ActiveStoreContext.Provider value={{ stores, activeStore, isLoading, setActiveStoreId, refresh: load }}>
      {children}
    </ActiveStoreContext.Provider>
  );
}
