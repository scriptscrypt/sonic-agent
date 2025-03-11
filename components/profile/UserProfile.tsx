"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, User, Wallet } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  isExpanded?: boolean;
}

export function UserProfile({ isExpanded = true }: UserProfileProps) {
  const { user } = useAuth();
  const { ready, authenticated } = usePrivy();
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = ready && authenticated;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const navigateToProfile = () => {
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
          className="rounded-full h-9 w-9 bg-muted/50"
          onClick={navigateToProfile}
        >
          <span className="sr-only">Profile</span>
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {user.email ? user.email[0].toUpperCase() : "U"}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-secondary/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium">Wallet</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={navigateToProfile}
        >
          <User size={14} className="mr-1" />
          Profile
        </Button>
      </div>

      {user.walletAddress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet size={14} className="mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Address:</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => copyToClipboard(user.walletAddress || "")}
            >
              <Copy size={12} className="mr-1" />
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs font-mono truncate">{user.walletAddress}</p>
          
          <div className="mt-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Balance:</span>
              <span className="text-xs font-medium">0.00 SOL</span>
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
            onClick={navigateToProfile}
          >
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
