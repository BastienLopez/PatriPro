import React, { createContext, useContext, ReactNode } from 'react';
import { useDataStore, DataStore } from '@/hooks/useDataStore';

const DataContext = createContext<DataStore | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const store = useDataStore();
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useData(): DataStore {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
