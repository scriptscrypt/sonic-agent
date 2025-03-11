'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  privyId: string;
  walletAddress?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { 
    ready, 
    authenticated, 
    user: privyUser, 
    login, 
    logout, 
    createWallet 
  } = usePrivy();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (ready && authenticated && privyUser) {
        try {
          const response = await fetch(`/api/auth/user?privyId=${privyUser.id}`);
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // If user doesn't exist in our database yet, create them
            const createResponse = await fetch('/api/auth/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                privyId: privyUser.id,
                walletAddress: privyUser.wallet?.address,
                email: privyUser.email?.address,
              }),
            });
            
            if (createResponse.ok) {
              const newUserData = await createResponse.json();
              setUser(newUserData);
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      } else if (ready && !authenticated) {
        setUser(null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [ready, authenticated, privyUser]);

  return {
    user,
    loading,
    isAuthenticated: authenticated,
    login,
    logout,
    createWallet,
    privyUser,
  };
} 