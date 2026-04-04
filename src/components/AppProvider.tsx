"use client";

import { useEffect } from 'react';
import { useRankingStore } from '@/store/useRankingStore';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const { fetchInitialData, subscribeToChanges } = useRankingStore();

  useEffect(() => {
    // Carregar dados iniciais do Supabase
    fetchInitialData();

    // Ativar modo Realtime
    const unsubscribe = subscribeToChanges();
    
    return () => unsubscribe();
  }, [fetchInitialData, subscribeToChanges]);

  return <>{children}</>;
}
