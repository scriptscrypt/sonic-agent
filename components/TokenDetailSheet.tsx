'use client';

import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenPriceChart } from '@/components/chat/TokenPriceChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ArrowUp, ArrowDown, Wallet } from '@phosphor-icons/react';
import { Token } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { TradingViewWidget } from '@/components/TradingViewWidget';

interface TokenDetailSheetProps {
  token: Token | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenDetailSheet({ token, isOpen, onOpenChange }: TokenDetailSheetProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1W");
  const [activeTab, setActiveTab] = useState('overview');
  const { theme } = useTheme();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!token) return null;

  // Get token symbol, defaulting to SOL if not available
  const tokenSymbol = token.symbol || 'SOL';

  // Calculate additional stats
  const allTimeHigh = (Number(token.price) * (1 + Math.random() * 2)).toFixed(2);
  const allTimeLow = (Number(token.price) * (0.1 + Math.random() * 0.5)).toFixed(2);
  const circulatingSupply = (1000000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const totalSupply = (Number(circulatingSupply.replace(/,/g, '')) * 1.2).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fullyDilutedValuation = (Number(token.price) * Number(totalSupply.replace(/,/g, ''))).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <SheetContent className="overflow-y-auto w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-2xl">{token.name}</SheetTitle>
              <Badge variant="outline" className="text-sm">{tokenSymbol}</Badge>
            </div>
            <div className={`text-sm font-medium ${Number(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {Number(token.change24h) >= 0 ? <ArrowUp className="mr-1" weight="bold" /> : <ArrowDown className="mr-1" weight="bold" />}
              {Number(token.change24h) >= 0 ? '+' : ''}{Number(token.change24h).toFixed(2)}%
            </div>
          </div>
          <SheetDescription className="text-xl font-semibold mt-2">
            ${Number(token.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
          </SheetDescription>
        </SheetHeader>

        <Tabs 
          defaultValue="overview" 
          className="w-full"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
          }}
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="tradingview" className="flex-1">TradingView</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Price Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Price Chart</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TokenPriceChart 
                  tokenSymbol={tokenSymbol} 
                  currentPrice={Number(token.price)} 
                  priceChange={Number(token.change24h)}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>
            
            {/* Key Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-medium">${Number(token.marketCap).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">24h Volume</div>
                    <div className="font-medium">${Number(token.volume24h).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">All-time High</div>
                    <div className="font-medium">${allTimeHigh}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">All-time Low</div>
                    <div className="font-medium">${allTimeLow}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Token Address */}
            {token.mintAddress && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Token Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="font-mono text-sm">{token.mintAddress}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(token.mintAddress || '')}
                    >
                      <Copy size={16} className="mr-1" />
                      {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="tradingview" className="space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">TradingView Chart</CardTitle>
                <div className="flex space-x-2">
                  {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
                    <Button 
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-background rounded-lg overflow-hidden">
                  <TradingViewWidget 
                    symbol={tokenSymbol} 
                    theme={theme === 'dark' ? 'dark' : 'light'} 
                    timeframe={timeRange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Market Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Market Cap</div>
                      <div className="font-medium">${Number(token.marketCap).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fully Diluted Valuation</div>
                      <div className="font-medium">${fullyDilutedValuation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">24h Volume</div>
                      <div className="font-medium">${Number(token.volume24h).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Volume / Market Cap</div>
                      <div className="font-medium">
                        {(Number(token.volume24h) / Number(token.marketCap) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">All-time High</div>
                      <div className="font-medium">${allTimeHigh}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">All-time Low</div>
                      <div className="font-medium">${allTimeLow}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">From ATH</div>
                      <div className="font-medium text-red-500">
                        {((Number(token.price) / Number(allTimeHigh) - 1) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">From ATL</div>
                      <div className="font-medium text-green-500">
                        {((Number(token.price) / Number(allTimeLow) - 1) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Circulating Supply</div>
                      <div className="font-medium">{circulatingSupply} {tokenSymbol}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Supply</div>
                      <div className="font-medium">{totalSupply} {tokenSymbol}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Max Supply</div>
                      <div className="font-medium">{totalSupply} {tokenSymbol}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Circulating / Total</div>
                      <div className="font-medium">
                        {(Number(circulatingSupply.replace(/,/g, '')) / Number(totalSupply.replace(/,/g, '')) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Token Address */}
            {token.mintAddress && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Token Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Token Address</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="font-mono text-sm">{token.mintAddress}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.mintAddress || '')}
                        >
                          <Copy size={16} className="mr-1" />
                          {isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    
                    {token.description && (
                      <div>
                        <div className="text-sm text-muted-foreground">Description</div>
                        <div className="text-sm mt-1">{token.description}</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" className="w-full">
                        <Wallet size={16} className="mr-2" />
                        Add to Wallet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 