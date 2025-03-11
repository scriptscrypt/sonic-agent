import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Token, NewToken } from '@/db/schema';

// Fetch all tokens
export function useTokens() {
  return useQuery<Token[]>({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await fetch('/api/tokens');
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      return response.json();
    }
  });
}

// Fetch tokens by user ID
export function useUserTokens(userId: number | undefined) {
  return useQuery<Token[]>({
    queryKey: ['tokens', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/tokens?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user tokens');
      }
      return response.json();
    },
    enabled: !!userId
  });
}

// Fetch tokens by wallet address
export function useWalletTokens(walletAddress: string | undefined) {
  return useQuery<Token[]>({
    queryKey: ['tokens', 'wallet', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const response = await fetch(`/api/tokens?walletAddress=${walletAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet tokens');
      }
      return response.json();
    },
    enabled: !!walletAddress
  });
}

// Fetch tokens by username
export function useUsernameTokens(username: string | undefined) {
  return useQuery<Token[]>({
    queryKey: ['tokens', 'username', username],
    queryFn: async () => {
      if (!username) return [];
      const response = await fetch(`/api/tokens?username=${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch username tokens');
      }
      return response.json();
    },
    enabled: !!username
  });
} 