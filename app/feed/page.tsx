'use client';

import { useNFTs } from '@/lib/hooks/useNFTs';
import { useTokens } from '@/lib/hooks/useTokens';
import { useBirdeyeMarkets, BirdeyeMarket } from '@/lib/hooks/useBirdeyeTokens';
import { NFTGrid } from '@/components/ui/NFTGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/db/schema';
import { TokenDetailSheet } from '@/components/TokenDetailSheet';
import { BirdeyeTokenCard } from '@/app/components/BirdeyeTokenCard';

export default function FeedPage() {
  const { data: nfts, isLoading: nftsLoading, error: nftsError } = useNFTs();
  const { data: tokens, isLoading: tokensLoading, error: tokensError } = useTokens();
  const { data: birdeyeData, isLoading: birdeyeLoading, error: birdeyeError } = useBirdeyeMarkets();
  const [isCopied, setIsCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedBirdeyeMarket, setSelectedBirdeyeMarket] = useState<BirdeyeMarket | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsDetailSheetOpen(true);
  };

  const handleBirdeyeMarketClick = (market: BirdeyeMarket) => {
    // Open in a new tab to Birdeye explorer for the base token
    if (market.base && market.base.address) {
      window.open(`https://birdeye.so/token/${market.base.address}?chain=solana`, '_blank');
    } else {
      // Fallback to the market address if base address is not available
      window.open(`https://birdeye.so/market/${market.address}?chain=solana`, '_blank');
    }
  };

  return (
    <div className="container py-8 mt-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          <p className="text-muted-foreground mt-2">
            Discover the latest tokens and NFTs from the community
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="birdeye">Birdeye</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 space-y-8">
            {/* Tokens Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Tokens</h2>
              {tokensLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : tokensError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Error loading tokens</p>
                </div>
              ) : tokens && tokens.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {tokens.map(token => (
                    <TokenCard 
                      key={token.id} 
                      token={token} 
                      copyToClipboard={copyToClipboard}
                      truncateAddress={truncateAddress}
                      isCopied={isCopied}
                      onClick={() => handleTokenClick(token)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tokens found</p>
                </div>
              )}
            </div>
            
            {/* Birdeye Tokens Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Trending on Birdeye</h2>
              {birdeyeLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : birdeyeError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Error loading Birdeye markets</p>
                </div>
              ) : birdeyeData && birdeyeData.data && birdeyeData.data.items && birdeyeData.data.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {birdeyeData.data.items.slice(0, 3).map(market => (
                    <BirdeyeTokenCard 
                      key={market.address} 
                      market={market} 
                      onClick={() => handleBirdeyeMarketClick(market)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No Birdeye markets found</p>
                </div>
              )}
            </div>
            
            {/* NFTs Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">NFTs</h2>
              {nftsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : nftsError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Error loading NFTs</p>
                </div>
              ) : nfts && nfts.length > 0 ? (
                <NFTGrid nfts={nfts} showOwner={true} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No NFTs found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tokens" className="mt-0">
            {tokensLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : tokensError ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading tokens</p>
              </div>
            ) : tokens && tokens.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {tokens.map(token => (
                  <TokenCard 
                    key={token.id} 
                    token={token} 
                    copyToClipboard={copyToClipboard}
                    truncateAddress={truncateAddress}
                    isCopied={isCopied}
                    onClick={() => handleTokenClick(token)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tokens found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="birdeye" className="mt-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Trending Markets on Birdeye</h2>
              <p className="text-sm text-muted-foreground">Sorted by liquidity</p>
            </div>
            {birdeyeLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : birdeyeError ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading Birdeye markets</p>
              </div>
            ) : birdeyeData && birdeyeData.data && birdeyeData.data.items && birdeyeData.data.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {birdeyeData.data.items.map(market => (
                  <BirdeyeTokenCard 
                    key={market.address} 
                    market={market} 
                    onClick={() => handleBirdeyeMarketClick(market)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No Birdeye markets found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nfts" className="mt-0">
            {nftsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : nftsError ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading NFTs</p>
              </div>
            ) : nfts && nfts.length > 0 ? (
              <NFTGrid nfts={nfts} showOwner={true} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No NFTs found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Token Detail Sheet */}
      <TokenDetailSheet 
        token={selectedToken} 
        isOpen={isDetailSheetOpen} 
        onOpenChange={setIsDetailSheetOpen} 
        tokens={tokens || []}
        onNavigate={(token) => setSelectedToken(token)}
      />
    </div>
  );
}

// Token Card Component
interface TokenCardProps {
  token: Token;
  copyToClipboard: (text: string) => void;
  truncateAddress: (address: string) => string;
  isCopied: boolean;
  onClick: () => void;
}

function TokenCard({ token, copyToClipboard, truncateAddress, isCopied, onClick }: TokenCardProps) {
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {token.name}
              <Badge variant="outline" className="ml-2">
                {token.symbol}
              </Badge>
            </CardTitle>
          </div>
          <div className={`text-sm font-medium ${Number(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Number(token.change24h) >= 0 ? '+' : ''}{Number(token.change24h).toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">${Number(token.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</div>
          <div className="text-sm text-muted-foreground">
            <div>Market Cap: ${Number(token.marketCap).toLocaleString()}</div>
            <div>Volume: ${Number(token.volume24h).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
      {token.mintAddress && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-2">
          <div className="text-xs font-mono text-muted-foreground">
            {truncateAddress(token.mintAddress)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              copyToClipboard(token.mintAddress || '');
            }}
          >
            <Copy size={12} className="mr-1" />
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 