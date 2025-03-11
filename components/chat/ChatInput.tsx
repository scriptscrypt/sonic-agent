"use client";

import { Input } from "@/components/ui/input";
import { ArrowRight } from "@phosphor-icons/react";
import * as React from "react";
import { AGENT_MODES } from "./ModeSelector";
import { DropdownComp } from "./WalletSelector";
import { useEffect, useState } from "react";
import { WalletSelector } from "@/components/wallet/WalletSelector";
import { WalletInfo } from "@/lib/hooks/useWallet";

export const MOCK_MODELS = [
  {
    name: "OpenAI",
    subTxt: "GPT-4o-mini",
  },
  {
    name: "Claude",
    subTxt: "Claude 3.5 Sonnet",
  },
  {
    name: "DeepSeek",
    subTxt: "DeepSeek-V3 Base",
  },
];

export const CHAIN_TYPES = [
  {
    name: "Solana",
    subTxt: "Solana Mainnet",
  },
  {
    name: "Sonic",
    subTxt: "Mobius - Sonic SVM Mainnet",
  },
];

type Item = {
  name: string;
  subTxt: string;
};

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent, selectedModel: Item) => void;
  selectedMode: (typeof AGENT_MODES)[0];
  setSelectedMode: (mode: (typeof AGENT_MODES)[0]) => void;
  selectedModel: Item;
  setSelectedModel: (model: Item) => void;
  selectedWallet: Item | null;
  setSelectedWallet: (wallet: Item | null) => void;
  selectedChainType: Item;
  setSelectedChainType: (chainType: Item) => void;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  selectedMode,
  setSelectedMode,
  selectedModel,
  setSelectedModel,
  selectedWallet,
  setSelectedWallet,
  selectedChainType,
  setSelectedChainType,
}: ChatInputProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(e, selectedModel);
    }
  };

  // Convert WalletInfo to Item format
  const handleWalletSelect = (wallet: WalletInfo) => {
    setSelectedWallet({
      name: wallet.name,
      subTxt: wallet.displayAddress,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative rounded-2xl bg-card/90 backdrop-blur-xl shadow-md border border-border/50 transition-all duration-200">
        <div className="flex flex-col">
          <div className="relative flex items-center min-h-[72px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e as any);
                  }
                }
              }}
              placeholder="Ask anything..."
              className="w-full h-[72px] px-6 py-4 outline-none text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
          <div className="flex items-center h-12 px-6 border-t border-border/50">
            <div className="flex items-center overflow-x-auto scrollbar-none">
              {/* <div className="flex items-center min-w-fit">
                <DropdownComp
                  selectedItems={selectedModel}
                  onItemsChange={setSelectedModel}
                  items={MOCK_MODELS}
                />
              </div> */}
            </div>
            <div className="ml-auto flex items-center">
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                disabled={!input.trim()}
              >
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          </div>
          {/* <div className="flex items-center gap-2 mb-2">
            <WalletSelector onWalletSelect={handleWalletSelect} />
          </div> */}
        </div>
      </div>
    </form>
  );
}
