'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (ready) {
      fetchWallets();
    }
  }, [ready, authenticated, user]);

  const fetchWallets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!authenticated || !user) {
        setWallets([]);
        return;
      }
      
      // Get wallets from Privy user object
      const userWallets: WalletInfo[] = [];
      
      // Add linked wallets if available
      if (user.linkedAccounts) {
        // Cast to our interface to avoid TypeScript errors
        (user.linkedAccounts as LinkedAccount[])
          .filter(account => account.type === 'wallet' && account.chain === 'solana')
          .forEach(account => {
            if (account.address) {
              userWallets.push({
                name: 'Linked Solana Wallet',
                address: account.address,
                displayAddress: formatAddress(account.address)
              });
            }
          });
      }
      
      // Add embedded wallet if available
      if (user.wallet && user.wallet.address) {
        const address = user.wallet.address;
        userWallets.push({
          name: 'Default Agent Wallet',
          address,
          displayAddress: formatAddress(address)
        });
      }
      
      setWallets(userWallets);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to fetch wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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