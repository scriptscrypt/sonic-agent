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
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#4C6EF5",
          logo: "https://espio.fun/logo.png",
          showWalletLoginFirst: true,
          walletChainType: "ethereum-and-solana",
          walletList: ["detected_solana_wallets"],
        },
        embeddedWallets: {
          showWalletUIs: true,
          priceDisplay: {
            primary: "native-token",
            secondary: null
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <AuthHandler />
      {children}
    </PrivyAuthProvider>
  );
}
