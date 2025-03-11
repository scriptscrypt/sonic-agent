'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export function UserProfile() {
  const { user, logout, privyUser, createWallet } = useAuth();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

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

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-secondary/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Your Profile</h2>
        <button
          onClick={() => logout()}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
      
      <div className="space-y-2">
        {user.email && (
          <div>
            <span className="text-sm text-muted-foreground">Email:</span>
            <p className="text-sm">{user.email}</p>
          </div>
        )}
        
        {user.walletAddress ? (
          <div>
            <span className="text-sm text-muted-foreground">Wallet:</span>
            <p className="text-sm font-mono truncate">{user.walletAddress}</p>
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