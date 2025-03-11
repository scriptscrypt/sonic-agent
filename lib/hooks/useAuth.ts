'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useRef } from 'react';

interface User {
  id: number;
  privyId: string;
  walletAddress?: string;
  email?: string;
  username?: string;
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
  const fetchedRef = useRef(false);
  const privyIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch user data if we haven't already fetched it for this privyUser
    // and if the user is authenticated and ready
    const fetchUser = async () => {
      // Skip if not ready or not authenticated
      if (!ready || !authenticated) {
        fetchedRef.current = false;
        privyIdRef.current = null;
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Skip if no privyUser
      if (!privyUser) {
        setLoading(false);
        return;
      }
      
      // Skip if we've already fetched for this privyId
      if (fetchedRef.current && privyIdRef.current === privyUser.id) {
        return;
      }
      
      // Set the current privyId we're fetching for
      privyIdRef.current = privyUser.id;
      fetchedRef.current = true;
      setLoading(true);
      
      try {
        const response = await fetch(`/api/auth/user?privyId=${privyUser.id}`);
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 404) {
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