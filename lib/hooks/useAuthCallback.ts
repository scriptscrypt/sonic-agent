import { usePrivy } from '@privy-io/react-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import { generateRandomUsername } from '@/lib/utils';

export function useAuthCallback() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const handledLoginRef = useRef(false);
  const redirectingRef = useRef(false);

  const handleLogin = useCallback(async (user: any) => {
    try {
      // Get the user's wallet address if available
      let walletAddress = '';
      if (user.wallet) {
        walletAddress = user.wallet.address;
      }

      // Get the user's email if available
      let email = '';
      if (user.email?.address) {
        email = user.email.address;
      }

      // First, check if the user already exists
      const checkResponse = await fetch(`/api/auth/user?privyId=${user.id}`);
      const userExists = checkResponse.status !== 404;
      
      // Generate a random username for new users
      let username;
      if (!userExists) {
        username = generateRandomUsername();
        
        // Ensure the username is unique
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 5) {
          const availabilityResponse = await fetch(`/api/auth/username?username=${encodeURIComponent(username)}`);
          const availabilityData = await availabilityResponse.json();
          
          if (availabilityData.available) {
            isUnique = true;
          } else {
            username = generateRandomUsername();
            attempts++;
          }
        }
      }

      // Create or update user in our database
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privyId: user.id,
          walletAddress,
          email,
          username, // Only included for new users
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      // Redirect to home page if on login page
      if (pathname === '/login') {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (ready && authenticated && user && !handledLoginRef.current) {
      handledLoginRef.current = true;
      handleLogin(user);
    } else if (ready && !authenticated) {
      handledLoginRef.current = false;
      
      // If not authenticated and on a protected route, redirect to login
      // But only do this once to prevent loops
      const isProtectedRoute = 
        pathname?.startsWith('/profile') ||
        pathname?.startsWith('/chat/') ||
        pathname === '/chat';
        
      if (isProtectedRoute && !redirectingRef.current && pathname !== '/login') {
        redirectingRef.current = true;
        router.push('/login');
      } else if (pathname === '/login') {
        // Reset the redirecting flag when on login page
        redirectingRef.current = false;
      }
    }
  }, [ready, authenticated, user, pathname, handleLogin, router]);

  return { handleLogin };
} 