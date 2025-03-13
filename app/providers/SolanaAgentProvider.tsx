"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { getAgent } from "@/lib/solana-agent";

// Create a context for the agent
interface SolanaAgentContextType {
  getAgentWithWallet: (modelName: string, chainType: "solana" | "sonic") => Promise<any>;
}

const SolanaAgentContext = createContext<SolanaAgentContextType | null>(null);

// Provider component
export function SolanaAgentProvider({ children }: { children: ReactNode }) {
  const { ready, wallets } = useSolanaWallets();

  // Function to get the agent with the wallet
  const getAgentWithWallet = async (modelName: string, chainType: "solana" | "sonic") => {
    if (!ready || !wallets || wallets.length === 0) {
      console.warn("No Solana wallets available");
      return getAgent(modelName, chainType);
    }
    
    return getAgent(modelName, chainType, wallets[0]);
  };

  return (
    <SolanaAgentContext.Provider value={{ getAgentWithWallet }}>
      {children}
    </SolanaAgentContext.Provider>
  );
}

// Hook to use the agent
export function useSolanaAgent() {
  const context = useContext(SolanaAgentContext);
  if (!context) {
    throw new Error("useSolanaAgent must be used within a SolanaAgentProvider");
  }
  return context;
} 