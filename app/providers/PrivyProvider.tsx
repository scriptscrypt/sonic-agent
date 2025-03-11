"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { ReactNode } from "react";
import { AuthHandler } from "../components/AuthHandler";

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  // This is your Privy App ID from the Privy Console
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#3ABAB4",
          logo: "https://your-logo-url.com/logo.png",
          showWalletLoginFirst: true,
          walletChainType: "solana-only",
          walletList: ["detected_solana_wallets"],
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <AuthHandler />
      {children}
    </PrivyAuthProvider>
  );
}
