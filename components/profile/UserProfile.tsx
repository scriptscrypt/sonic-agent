'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePrivy, type WalletWithMetadata } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, User } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  isExpanded?: boolean;
}

export function UserProfile({ isExpanded = true }: UserProfileProps) {
  const { user, logout, privyUser, createWallet } = useAuth();
  const { ready, authenticated } = usePrivy();
  const { exportWallet } = useSolanaWallets();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = ready && authenticated;
  
  // Check if user has an embedded Solana wallet
  const hasEmbeddedWallet = privyUser?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.chainType === 'solana'
  );

  const handleCreateWallet = async () => {
    if (!createWallet) return;
    
    setIsCreatingWallet(true);
    try {
      await createWallet();
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleExportWallet = () => {
    if (user?.walletAddress) {
      exportWallet({ address: user.walletAddress });
    } else {
      exportWallet();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  if (!user) {
    return null;
  }

  // Simplified view when sidebar is collapsed
  if (!isExpanded) {
    return (
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 bg-muted/50"
          onClick={navigateToProfile}
        >
          <span className="sr-only">Profile</span>
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {user.email ? user.email[0].toUpperCase() : 'U'}
          </div>
        </Button>
      </div>
    );
  }

  // Get profile URL based on username or wallet address
  const profileUrl = user.username ? `/${user.username}` : user.walletAddress ? `/${user.walletAddress}` : null;

  return (
    <div className="p-4 bg-secondary/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Your Profile</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={navigateToProfile}
          >
            <User size={16} className="mr-1" />
            Settings
          </Button>
          <button
            onClick={() => logout()}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {user.username && (
          <div>
            <span className="text-sm text-muted-foreground">Username:</span>
            <div className="flex items-center">
              <p className="text-sm">{user.username}</p>
              {profileUrl && (
                <Link href={profileUrl} className="ml-2 text-xs text-primary hover:underline">
                  View Profile
                </Link>
              )}
            </div>
          </div>
        )}
        
        {user.email && (
          <div>
            <span className="text-sm text-muted-foreground">Email:</span>
            <p className="text-sm">{user.email}</p>
          </div>
        )}
        
        {user.walletAddress ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet:</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => copyToClipboard(user.walletAddress || '')}
              >
                <Copy size={14} className="mr-1" />
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm font-mono truncate">{user.walletAddress}</p>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs"
              onClick={handleExportWallet}
              disabled={!isAuthenticated || !hasEmbeddedWallet}
            >
              Export Private Key
            </Button>
          </div>
        ) : (
          <button
            onClick={handleCreateWallet}
            disabled={isCreatingWallet}
            className="text-sm text-primary hover:text-primary/90 disabled:opacity-50"
          >
            {isCreatingWallet ? 'Creating Wallet...' : 'Create Wallet'}
          </button>
        )}
      </div>
    </div>
  );
} 