import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthCallback() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated && user) {
      handleLogin(user);
    }
  }, [ready, authenticated, user]);

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

      // Redirect to home page after successful login
      router.push('/');
    } catch (error) {
      console.error('Error handling login:', error);
    }
  };

  return { handleLogin };
} 