'use client';

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const router = useRouter();

  // This is your Privy App ID from the Privy Console
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  // Handle user login
  const handleLogin = async (user: any) => {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/update user');
      }
    } catch (error) {
      console.error('Error handling login:', error);
    }
  };

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      onSuccess={(user) => {
        handleLogin(user);
        router.push('/');
      }}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#3ABAB4',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
} 