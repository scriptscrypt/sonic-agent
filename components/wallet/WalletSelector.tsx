'use client';

import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SolanaIcon } from "../chat/icons/SolanaIcon";
import { useWalletContext } from "@/app/providers/WalletProvider";
import { useState, useEffect } from "react";
import { WalletInfo } from "@/lib/hooks/useWallet";

interface WalletSelectorProps {
  onWalletSelect?: (wallet: WalletInfo) => void;
  className?: string;
}

export function WalletSelector({ onWalletSelect, className }: WalletSelectorProps) {
  const { wallets, isLoading, error, createEmbeddedWallet } = useWalletContext();
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    // Select the first wallet by default if available
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0]);
      if (onWalletSelect) {
        onWalletSelect(wallets[0]);
      }
    }
  }, [wallets, selectedWallet, onWalletSelect]);

  const handleWalletSelect = (wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    if (onWalletSelect) {
      onWalletSelect(wallet);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Loading wallets...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        {error}
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No wallets available
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 py-1.5 px-2.5 -ml-2.5 rounded-lg",
            "text-body-strong text-muted-foreground hover:text-foreground",
            "transition-colors",
            "group",
            className
          )}
        >
          <div className="text-primary transition-transform duration-200 ease-out group-hover:scale-110">
            <SolanaIcon className="w-4 h-4" />
          </div>
          <span className="font-medium">
            {selectedWallet?.name.split(" ")[0] || "Wallet"}
          </span>
          <CaretDown size={14} weight="bold" className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-1 bg-popover border border-border">
        {wallets.map((wallet, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handleWalletSelect(wallet)}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-md",
              "hover:bg-muted",
              selectedWallet?.address === wallet.address ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <div className="text-primary">
              <SolanaIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-body-strong">{wallet.name}</span>
              <span className="wallet-address">{wallet.displayAddress}</span>
            </div>
            {selectedWallet?.address === wallet.address && (
              <div className="ml-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 