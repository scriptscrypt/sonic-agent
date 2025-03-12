'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  Sheet, 
  SheetContent as OriginalSheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetPortal
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenPriceChart } from '@/components/chat/TokenPriceChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ArrowUp, ArrowDown, Wallet, X, ArrowLeft, ArrowRight, Link } from '@phosphor-icons/react';
import { Token } from '@/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { TradingViewWidget } from '@/components/TradingViewWidget';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import React from 'react';

// Custom SheetContent that doesn't include the SheetOverlay
const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left"
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
        {
          "inset-y-0 right-0 h-full w-3/4 sm:w-1/2 md:w-1/3 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right":
            side === "right",
          "inset-y-0 left-0 h-full w-3/4 sm:w-1/2 md:w-1/3 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left":
            side === "left",
          "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top":
            side === "top",
          "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom":
            side === "bottom",
        },
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

interface TokenDetailSheetProps {
  token: Token | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tokens?: Token[]; // Optional array of all tokens for navigation
  onNavigate?: (token: Token) => void; // Optional callback for navigation
}

export function TokenDetailSheet({ 
  token, 
  isOpen, 
  onOpenChange,
  tokens = [],
  onNavigate
}: TokenDetailSheetProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1W");
  const [activeTab, setActiveTab] = useState('overview');
  const { theme } = useTheme();
  const [chartHeight, setChartHeight] = useState(600); // Increased default height
  const resizeRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const [chartKey, setChartKey] = useState(0); // Add a key to force re-render
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Effect to set initial chart height when tab changes to tradingview
  useEffect(() => {
    if (activeTab === 'tradingview') {
      // Reset to default height when switching to tradingview tab
      setChartHeight(600);
      // Force re-render of the chart
      setChartKey(prev => prev + 1);
    }
  }, [activeTab]);

  // Use layout effect to ensure the chart container is properly sized
  useLayoutEffect(() => {
    if (activeTab === 'tradingview' && chartContainerRef.current) {
      // Force a reflow
      const height = chartContainerRef.current.offsetHeight;
      if (height < 10) {
        // If container height is too small, force a minimum height
        chartContainerRef.current.style.height = `${chartHeight}px`;
      }
    }
  }, [activeTab, chartHeight]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = chartHeight;
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(200, startHeightRef.current + deltaY);
      setChartHeight(newHeight);
    };
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
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

  // Find current token index for navigation
  const currentTokenIndex = tokens.findIndex(t => t.id === token.id);
  const hasPrevious = currentTokenIndex > 0;
  const hasNext = currentTokenIndex < tokens.length - 1 && currentTokenIndex !== -1;

  // Navigation handlers
  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(tokens[currentTokenIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(tokens[currentTokenIndex + 1]);
    }
  };

  // Open DexScreener
  const openDexScreener = () => {
    if (token.mintAddress) {
      window.open(`https://dexscreener.com/solana/${token.mintAddress}`, '_blank');
    }
  };

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      {/* Custom overlay with blur effect */}
      <div 
        className={`fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => onOpenChange(false)}
      />
      
      <SheetContent className="overflow-hidden w-full sm:max-w-md md:max-w-lg lg:max-w-xl border rounded-lg m-2 p-0 z-50 shadow-lg flex flex-col">
        {/* Only top navigation bar - sticky */}
        <div className="sticky top-0 z-10 bg-background pt-1 pb-1 px-3 border-b">
          <div className="flex justify-between items-center">
            {/* Left side buttons */}
            <div className="flex items-center gap-1">
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X size={16} weight="bold" />
                </Button>
              </SheetClose>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => token.mintAddress && copyToClipboard(token.mintAddress)}
              >
                <Copy size={12} className="mr-1" />
                {isCopied ? 'Copied' : 'Copy'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs"
                onClick={openDexScreener}
              >
                <Link size={12} className="mr-1" />
                DexScreener
              </Button>
            </div>
            
            {/* Right side navigation */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                disabled={!hasPrevious}
                onClick={handlePrevious}
              >
                <ArrowLeft size={16} weight="bold" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                disabled={!hasNext}
                onClick={handleNext}
              >
                <ArrowRight size={16} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SheetHeader className="my-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl">{token.name}</SheetTitle>
                <Badge variant="outline" className="text-xs">{tokenSymbol}</Badge>
              </div>
              <div className={`text-sm font-medium ${Number(token.change24h) >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {Number(token.change24h) >= 0 ? <ArrowUp className="mr-1" weight="bold" /> : <ArrowDown className="mr-1" weight="bold" />}
                {Number(token.change24h) >= 0 ? '+' : ''}{Number(token.change24h).toFixed(2)}%
              </div>
            </div>
            <SheetDescription className="text-lg font-semibold mt-1">
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
            <TabsList className="w-full mb-3">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="tradingview" className="flex-1">TradingView</TabsTrigger>
              <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-3">
              {/* Price Chart */}
              <Card>
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="text-base">Price Chart</CardTitle>
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
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="text-base">Key Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Market Cap</div>
                      <div className="font-medium">${Number(token.marketCap).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">24h Volume</div>
                      <div className="font-medium">${Number(token.volume24h).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">All-time High</div>
                      <div className="font-medium">${allTimeHigh}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">All-time Low</div>
                      <div className="font-medium">${allTimeLow}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Token Address */}
              {token.mintAddress && (
                <Card>
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-base">Token Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-mono text-xs">{token.mintAddress}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => copyToClipboard(token.mintAddress || '')}
                      >
                        <Copy size={14} className="mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="tradingview" className="space-y-3">
              {/* TradingView with expandable functionality */}
              <Card className="overflow-visible">
                <CardHeader className="pb-1 pt-2 px-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">TradingView Chart</CardTitle>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
                        <Button 
                          key={range}
                          variant={timeRange === range ? 'default' : 'outline'} 
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => {
                            setTimeRange(range);
                            // Force re-render of chart when timeframe changes
                            setChartKey(prev => prev + 1);
                          }}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-visible">
                  {/* Chart container with fixed dimensions */}
                  <div className="relative w-full bg-background rounded-lg overflow-hidden">
                    {/* Fixed height container */}
                    <div 
                      ref={chartContainerRef}
                      style={{ height: `${chartHeight}px` }}
                      className="w-full"
                    >
                      {/* TradingView widget with explicit key for re-rendering */}
                      {activeTab === 'tradingview' && (
                        <TradingViewWidget 
                          key={`tv-widget-${chartKey}-${timeRange}`}
                          symbol={tokenSymbol} 
                          theme={theme === 'dark' ? 'dark' : 'light'} 
                          timeframe={timeRange}
                          height="100%"
                        />
                      )}
                    </div>
                    
                    {/* Resize handle */}
                    <div 
                      ref={resizeRef}
                      className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent cursor-ns-resize flex items-center justify-center z-10"
                      onMouseDown={handleResizeStart}
                    >
                      <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-3">
              <Card>
                <CardHeader className="pb-1 pt-2 px-3">
                  <CardTitle className="text-base">Market Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Market Cap</div>
                        <div className="font-medium">${Number(token.marketCap).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Fully Diluted Valuation</div>
                        <div className="font-medium">${fullyDilutedValuation}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">24h Volume</div>
                        <div className="font-medium">${Number(token.volume24h).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Volume / Market Cap</div>
                        <div className="font-medium">
                          {(Number(token.volume24h) / Number(token.marketCap) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">All-time High</div>
                        <div className="font-medium">${allTimeHigh}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">All-time Low</div>
                        <div className="font-medium">${allTimeLow}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">From ATH</div>
                        <div className="font-medium text-red-500">
                          {((Number(token.price) / Number(allTimeHigh) - 1) * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">From ATL</div>
                        <div className="font-medium text-green-500">
                          {((Number(token.price) / Number(allTimeLow) - 1) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Circulating Supply</div>
                        <div className="font-medium">{circulatingSupply} {tokenSymbol}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Total Supply</div>
                        <div className="font-medium">{totalSupply} {tokenSymbol}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Max Supply</div>
                        <div className="font-medium">{totalSupply} {tokenSymbol}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Circulating / Total</div>
                        <div className="font-medium">
                          {(Number(circulatingSupply.replace(/,/g, '')) / Number(totalSupply.replace(/,/g, '')) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Token Information */}
              {token.mintAddress && (
                <Card>
                  <CardHeader className="pb-1 pt-2 px-3">
                    <CardTitle className="text-base">Token Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Token Address</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="font-mono text-xs">{token.mintAddress}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => copyToClipboard(token.mintAddress || '')}
                          >
                            <Copy size={14} className="mr-1" />
                            {isCopied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      
                      {token.description && (
                        <div>
                          <div className="text-xs text-muted-foreground">Description</div>
                          <div className="text-xs mt-1">{token.description}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" className="w-full h-8">
                          <Wallet size={14} className="mr-2" />
                          Add to Watchlist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
} 