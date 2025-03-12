import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "@phosphor-icons/react";
import { useState } from "react";

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  sonicAddress: string;
}

export function FundWalletModal({ isOpen, onClose, sonicAddress }: FundWalletModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBridgeClick = () => {
    window.open("https://bridge.sonic.game", "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] p-6">
        <DialogHeader>
          <DialogTitle>Fund your Sonic SVM Wallet</DialogTitle>
          <DialogDescription>
            Bridge your assets from Solana to start using Sonic.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">My Sonic SVM Address</label>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="flex-1 p-2 rounded bg-muted text-sm font-mono break-all min-w-[200px]">
                {sonicAddress}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(sonicAddress)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4 mr-1" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use this address as the Destination Address in the Sonic Bridge
            </p>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleBridgeClick}>
              Go to Sonic Bridge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 