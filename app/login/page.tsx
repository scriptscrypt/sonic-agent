'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 sm:py-32">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Espio</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to accelerate with Espio
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => login()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {loading ? 'Loading...' : 'Sign in with Privy'}
          </button>
        </div>
      </div>
    </div>
  );
} 