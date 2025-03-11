'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet, WalletInfo } from '@/lib/hooks/useWallet';

interface WalletContextType {
  wallets: WalletInfo[];
  isLoading: boolean;
  error: string | null;
  createEmbeddedWallet: () => Promise<any | null>;
  refreshWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const walletData = useWallet();
  
  return (
    <WalletContext.Provider value={walletData}>
      {children}
    </WalletContext.Provider>
  );
} 