import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NFT, NewNFT } from '@/db/schema';

// Fetch all NFTs
export function useNFTs() {
  return useQuery<NFT[]>({
    queryKey: ['nfts'],
    queryFn: async () => {
      const response = await fetch('/api/nfts');
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      return response.json();
    }
  });
}

// Fetch NFTs by user ID
export function useUserNFTs(userId: number | undefined) {
  return useQuery<NFT[]>({
    queryKey: ['nfts', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/nfts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user NFTs');
      }
      return response.json();
    },
    enabled: !!userId
  });
}

// Fetch NFTs by wallet address
export function useWalletNFTs(walletAddress: string | undefined) {
  return useQuery<NFT[]>({
    queryKey: ['nfts', 'wallet', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const response = await fetch(`/api/nfts?walletAddress=${walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet NFTs');
      }
      return response.json();
    },
    enabled: !!walletAddress
  });
}

// Fetch NFTs by username
export function useUsernameNFTs(username: string | undefined) {
  return useQuery<NFT[]>({
    queryKey: ['nfts', 'username', username],
    queryFn: async () => {
      if (!username) return [];
      const response = await fetch(`/api/nfts?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch username NFTs');
      }
      return response.json();
    },
    enabled: !!username
  });
} 