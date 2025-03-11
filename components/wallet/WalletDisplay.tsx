'use client';

import { useWalletContext } from "@/app/providers/WalletProvider";
import { Button } from "@/components/ui/button";
import { Copy, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WalletDisplayProps {
  className?: string;
}

export function WalletDisplay({ className }: WalletDisplayProps) {
  const { wallets, isLoading, error, createEmbeddedWallet } = useWalletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      await createEmbeddedWallet();
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 bg-secondary/20 rounded-lg", className)}>
        Loading wallet information...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 bg-destructive/10 text-destructive rounded-lg", className)}>
        {error}
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className={cn("p-4 bg-secondary/20 rounded-lg space-y-4", className)}>
        <p className="text-sm">
          You don't have any Solana wallets. Create one to interact with the Solana blockchain.
        </p>
        <Button
          onClick={handleCreateWallet}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Wallet"}
          {!isCreating && <Plus size={16} className="ml-2" />}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-secondary/20 rounded-lg", className)}>
      <h2 className="text-lg font-medium mb-4">Your Wallets</h2>
      
      <div className="space-y-4">
        {wallets.map((wallet, index) => (
          <div key={index} className="space-y-2 border-b border-border/50 pb-3 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{wallet.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => copyToClipboard(wallet.address)}
              >
                <Copy size={14} className="mr-1" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-sm font-mono truncate text-muted-foreground">{wallet.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 