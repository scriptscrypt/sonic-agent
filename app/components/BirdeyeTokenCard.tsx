import { BirdeyeMarket } from '@/lib/hooks/useBirdeyeTokens';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from '@phosphor-icons/react';
import { useState } from 'react';

interface BirdeyeTokenCardProps {
  market: BirdeyeMarket;
  onClick?: () => void;
}

export function BirdeyeTokenCard({ market, onClick }: BirdeyeTokenCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLargeNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Format date to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {market.base.icon && (
              <img 
                src={market.base.icon} 
                alt={market.base.symbol} 
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {market.name}
              <Badge variant="outline" className="ml-2">
                {market.base.symbol}/{market.quote.symbol}
              </Badge>
            </CardTitle>
          </div>
          <div className={`text-sm font-medium ${market.trade24hChangePercent !== null && market.trade24hChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {market.trade24hChangePercent !== null ? (
              <>
                {market.trade24hChangePercent >= 0 ? '+' : ''}
                {market.trade24hChangePercent.toFixed(2)}%
              </>
            ) : (
              'N/A'
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {market.price !== null 
              ? `$${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}` 
              : 'Price N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            <div>Liquidity: {formatLargeNumber(market.liquidity)}</div>
            <div>Volume 24h: {formatLargeNumber(market.volume24h)}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Trades 24h: {market.trade24h || 'N/A'}</span>
            <span>Unique wallets: {market.uniqueWallet24h || 'N/A'}</span>
          </div>
          <div className="mt-1">
            Source: {market.source || 'Unknown'} • Created: {market.createdAt ? formatDate(market.createdAt) : 'N/A'}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-2">
        <div className="text-xs font-mono text-muted-foreground">
          {truncateAddress(market.address)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            copyToClipboard(market.address);
          }}
        >
          <Copy size={12} className="mr-1" />
          {isCopied ? 'Copied!' : 'Copy'}
        </Button>
      </CardFooter>
    </Card>
  );
} 