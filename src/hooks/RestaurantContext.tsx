import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import * as restaurantsApi from '../api/restaurants';
import type { Restaurant } from '../types';
import { useAuth } from './AuthContext';

interface RestaurantContextValue {
  restaurant: Restaurant | null;
  setRestaurant: Dispatch<SetStateAction<Restaurant | null>>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<Restaurant | null>;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setRestaurant(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await restaurantsApi.getMyRestaurant();
      setRestaurant(data);
      return data;
    } catch {
      setError('Não foi possível carregar o restaurante');
      setRestaurant(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ restaurant, setRestaurant, loading, error, refresh }),
    [restaurant, loading, error, refresh],
  );

  return (
    <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
  );
}

export function useRestaurant(): RestaurantContextValue {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant deve ser usado dentro de RestaurantProvider');
  }
  return ctx;
}
