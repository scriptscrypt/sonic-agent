'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Plus } from '@phosphor-icons/react';
import { useWalletContext } from '@/app/providers/WalletProvider';
import { FundWalletModal } from '@/components/modals/FundWalletModal';

export function SonicWallet() {
  const { user } = useAuth();
  const { wallets, isLoading: isWalletsLoading, createEmbeddedWallet } = useWalletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [balance, setBalance] = useState(0); // We'll simulate 0 balance for now

  // Find the Solana wallet from the wallets list
  const solanaWallet = wallets.find(wallet => wallet.name === 'Default Agent Wallet');
  const hasWallet = !!solanaWallet;
  const walletAddress = solanaWallet?.address || null;

  // Show fund modal if balance is 0 and wallet exists
  useEffect(() => {
    if (hasWallet && balance === 0) {
      setShowFundModal(true);
    }
  }, [hasWallet, balance]);

  const generateWallet = async () => {
    if (!user?.privyId) return;
    
    try {
      setIsCreating(true);
      await createEmbeddedWallet();
    } catch (error) {
      console.error('Error generating wallet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isWalletsLoading) {
    return <div className="p-4 bg-secondary/20 rounded-lg">Loading wallet information...</div>;
  }

  return (
    <>
      <div className="p-4 bg-secondary/20 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Sonic Wallet</h2>
        
        {hasWallet ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet Address:</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => walletAddress && copyToClipboard(walletAddress)}
              >
                <Copy size={14} className="mr-1" />
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm font-mono truncate">{walletAddress}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="text-sm font-medium">{balance} SVM</span>
            </div>
            {balance === 0 && (
              <Button
                onClick={() => setShowFundModal(true)}
                className="w-full mt-2"
                variant="outline"
              >
                Fund Wallet
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              Generate a Sonic wallet to interact with the Solana blockchain
            </p>
            <Button
              onClick={generateWallet}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Wallet'}
              {!isCreating && <Plus size={16} className="ml-2" />}
            </Button>
          </div>
        )}
      </div>

      {/* Fund Wallet Modal */}
      {hasWallet && (
        <FundWalletModal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          sonicAddress={walletAddress || ''}
        />
      )}
    </>
  );
} 