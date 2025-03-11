'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';

export interface WalletInfo {
  name: string;
  address: string;
  displayAddress: string;
}

// Define types for Privy accounts
interface LinkedAccount {
  type: string;
  chain?: string;
  address?: string;
  [key: string]: any;
}

export function useWallet() {
  const { ready, authenticated, user, createWallet } = usePrivy();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format wallet addresses
  const formatAddress = (address: string): string => {
    if (!address) return '';
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
  };

  const fetchWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!authenticated || !user) {
        setWallets([]);
        return;
      }

      // Get all linked accounts
      const linkedAccounts = user.linkedAccounts || [];
      
      // Filter for wallet accounts
      const walletAccounts = linkedAccounts.filter(
        (account: LinkedAccount) => account.type === 'wallet'
      );
      
      // Format wallet info
      const walletInfo: WalletInfo[] = walletAccounts.map((account: LinkedAccount) => {
        const address = account.address || '';
        return {
          name: account.walletClientType === 'privy' ? 'Embedded Wallet' : 'Connected Wallet',
          address,
          displayAddress: formatAddress(address),
        };
      });
      
      setWallets(walletInfo);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to load wallet information');
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, user]);

  useEffect(() => {
    if (ready) {
      fetchWallets();
    }
  }, [ready, fetchWallets]);

  const createEmbeddedWallet = async () => {
    if (!authenticated) {
      setError('User must be authenticated to create a wallet');
      return null;
    }
    
    try {
      const wallet = await createWallet();
      await fetchWallets(); // Refresh wallet list
      return wallet;
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet');
      return null;
    }
  };

  return {
    wallets,
    isLoading,
    error,
    createEmbeddedWallet,
    refreshWallets: fetchWallets
  };
} 