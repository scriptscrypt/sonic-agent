"use client";

import { SolanaAgentKit } from "solana-agent-kit";
import { ConnectedSolanaWallet, useSolanaWallets } from "@privy-io/react-auth";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import BlinksPlugin from "@solana-agent-kit/plugin-blinks";
import MiscPlugin from "@solana-agent-kit/plugin-misc";

export const getAgent = () => {
  const { wallets } = useSolanaWallets();
  
  const wallet = wallets[0];
  const baseWallet = {
    publicKey: new PublicKey(wallet.address),

    sendTransaction: async <T extends Transaction | VersionedTransaction>(
      transaction: T
    ) => {
      return "dummy_transaction_signature";
    },
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  };

  // @ts-ignore
  const agent = new SolanaAgentKit(
    baseWallet as any,
    "https://api.mainnet-beta.solana.com",
    {
      signOnly: true,
    }
  )
    .use(TokenPlugin)
    .use(NFTPlugin)
    .use(DefiPlugin)
    .use(MiscPlugin)
    .use(BlinksPlugin);

  return agent;
};

export default getAgent;
