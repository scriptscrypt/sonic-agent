"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, User, Wallet } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWalletContext } from "@/app/providers/WalletProvider";

interface UserProfileProps {
  isExpanded?: boolean;
}

export function UserProfile({ isExpanded = true }: UserProfileProps) {
  const { user } = useAuth();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWalletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [balances, setBalances] = useState({
    solana: null as number | null,
    sonic: null as number | null
  });
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = ready && authenticated;

  const walletAddress = user?.walletAddress || null;

  useEffect(() => {
    const fetchBalances = async () => {
      if (!walletAddress) return;

      try {
        const response = await fetch(`/api/wallet/balance?address=${walletAddress}`);
        if (!response.ok) throw new Error('Failed to fetch balances');
        
        const data = await response.json();
        setBalances({
          solana: data.solana,
          sonic: data.sonic
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
        setBalances({ solana: 0, sonic: 0 });
      }
    };

    fetchBalances();
  }, [walletAddress]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const navigateToSettings = () => {
    router.push("/profile");
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
          className="rounded-full h-9 w-9 bg-muted/50 hover:bg-muted"
          onClick={navigateToSettings}
        >
          <span className="sr-only">Settings</span>
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {user.email ? user.email[0].toUpperCase() : "U"}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-secondary/40 dark:bg-secondary/80 rounded-lg border border-border/90">
      {walletAddress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet size={14} className="mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Address:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-muted"
              onClick={() => copyToClipboard(walletAddress)}
            >
              <Copy size={12} className="mr-1" />
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs font-mono truncate">{walletAddress}</p>
          
          <div className="mt-2 pt-2 border-t border-border/40 space-y-2">
            {/* Solana Balance */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Solana Balance:</span>
              <span className="text-xs font-medium">
                {balances.solana === null ? 'Loading...' : `${balances.solana.toFixed(4)} SOL`}
              </span>
            </div>
            
            {/* Sonic Balance */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sonic Balance:</span>
              <span className="text-xs font-medium">
                {balances.sonic === null ? 'Loading...' : `${balances.sonic.toFixed(4)} SVM`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-3">
          <p className="text-xs text-muted-foreground mb-2">No wallet connected</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={navigateToSettings}
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
