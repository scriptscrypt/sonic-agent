'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { PrivyProvider } from './providers/PrivyProvider';
import { WalletProvider } from './providers/WalletProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <PrivyProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </PrivyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
} 