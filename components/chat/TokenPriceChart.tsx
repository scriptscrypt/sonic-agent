"use client";

import { useEffect, useState, useRef } from "react";

interface TokenPriceChartProps {
  tokenSymbol: string;
  currentPrice: number;
  priceChange: number;
  timeRange?: "1D" | "1W" | "1M" | "3M" | "1Y";
}

interface PricePoint {
  time: string;
  price: number;
  timestamp: number; // For sorting
}

export function TokenPriceChart({ tokenSymbol, currentPrice, priceChange, timeRange = "1W" }: TokenPriceChartProps) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [localTimeRange, setLocalTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">(timeRange);
  const [hoverPoint, setHoverPoint] = useState<PricePoint | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Update local time range when prop changes
  useEffect(() => {
    setLocalTimeRange(timeRange);
  }, [timeRange]);
  
  // Generate more realistic chart data based on current price and change percentage
  useEffect(() => {
    const generateMockData = () => {
      const data: PricePoint[] = [];
      const now = new Date();
      
      // Determine number of data points and time interval based on selected range
      const config = {
        "1D": { points: 24, interval: 60 * 60 * 1000, format: { hour: '2-digit', minute: '2-digit' } },
        "1W": { points: 7 * 24, interval: 60 * 60 * 1000, format: { month: 'short', day: 'numeric', hour: '2-digit' } },
        "1M": { points: 30, interval: 24 * 60 * 60 * 1000, format: { month: 'short', day: 'numeric' } },
        "3M": { points: 90, interval: 24 * 60 * 60 * 1000, format: { month: 'short', day: 'numeric' } },
        "1Y": { points: 365, interval: 24 * 60 * 60 * 1000, format: { month: 'short', day: 'numeric' } }
      };
      
      const { points, interval, format } = config[localTimeRange];
      
      // Calculate volatility based on price change
      const volatility = Math.max(0.5, Math.abs(priceChange) / 100) * currentPrice * 0.1;
      
      // Generate starting price (price from the beginning of the time period)
      const startingPrice = currentPrice * (1 - priceChange / 100);
      
      // Generate price points with realistic movement
      let lastPrice = startingPrice;
      
      for (let i = points; i >= 0; i--) {
        const timestamp = now.getTime() - (i * interval);
        const date = new Date(timestamp);
        
        // Create realistic price movement with some randomness
        // Use a combination of random walk and trend towards current price
        const randomWalk = (Math.random() - 0.5) * volatility;
        const trendFactor = (points - i) / points; // Increases as we approach current time
        const targetPrice = startingPrice + (currentPrice - startingPrice) * trendFactor;
        
        // Blend random walk with trend, with trend becoming stronger as we approach current time
        const blendFactor = Math.min(0.8, trendFactor * 2); // Max 80% trend influence
        lastPrice = lastPrice * (1 - blendFactor) + targetPrice * blendFactor + randomWalk;
        
        // Ensure price is positive
        lastPrice = Math.max(0.01, lastPrice);
        
        // Format time based on selected range
        const timeStr = date.toLocaleString(undefined, format as Intl.DateTimeFormatOptions);
        
        data.push({
          time: timeStr,
          price: lastPrice,
          timestamp: timestamp
        });
      }
      
      // Ensure the last point matches the current price exactly
      if (data.length > 0) {
        data[data.length - 1].price = currentPrice;
      }
      
      // Sort by timestamp to ensure correct order
      data.sort((a, b) => a.timestamp - b.timestamp);
      
      setChartData(data);
    };
    
    generateMockData();
  }, [currentPrice, priceChange, localTimeRange]);
  
  // Handle mouse movement for price tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || chartData.length === 0) return;
    
    const chartRect = chartRef.current.getBoundingClientRect();
    const relativeX = e.clientX - chartRect.left;
    const chartWidth = chartRect.width;
    
    // Calculate which data point we're hovering over
    const index = Math.min(
      Math.floor((relativeX / chartWidth) * chartData.length),
      chartData.length - 1
    );
    
    if (index >= 0 && index < chartData.length) {
      setHoverPoint(chartData[index]);
    }
  };
  
  const handleMouseLeave = () => {
    setHoverPoint(null);
  };
  
  // Find min and max prices for scaling, with some padding
  const minPrice = Math.min(...chartData.map(point => point.price)) * 0.99;
  const maxPrice = Math.max(...chartData.map(point => point.price)) * 1.01;
  const priceRange = maxPrice - minPrice;
  
  // Calculate chart color based on price change
  const chartColor = priceChange >= 0 ? "#10B981" : "#EF4444";
  
  // Calculate position for hover tooltip
  const getHoverPosition = () => {
    if (!hoverPoint || !chartRef.current || chartData.length === 0) return { left: 0 };
    
    const index = chartData.findIndex(p => p.timestamp === hoverPoint.timestamp);
    if (index === -1) return { left: 0 };
    
    const chartWidth = chartRef.current.getBoundingClientRect().width;
    const position = (index / (chartData.length - 1)) * chartWidth;
    
    // Adjust position to keep tooltip on screen
    const tooltipWidth = 120;
    const leftPosition = Math.max(0, Math.min(position - tooltipWidth / 2, chartWidth - tooltipWidth));
    
    return { left: leftPosition };
  };
  
  return (
    <div className="bg-background rounded-xl border border-border my-4">
      <div className="flex justify-between items-center p-4">
        <div>
          <h3 className="font-semibold text-lg">{tokenSymbol} Price Chart</h3>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold">
              ${hoverPoint ? hoverPoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            <span 
              className={`ml-2 px-2 py-0.5 rounded text-sm ${priceChange >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
            >
              {priceChange >= 0 ? '+' : ''}{priceChange}%
            </span>
          </div>
          {hoverPoint && (
            <div className="text-sm text-muted-foreground mt-1">
              {hoverPoint.time}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 text-sm">
          {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setLocalTimeRange(range)}
              className={`px-2 py-1 rounded ${localTimeRange === range ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div 
        className="h-72 relative px-4 pb-6 pt-2"
        ref={chartRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Chart Lines */}
        <div className="absolute inset-x-4 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-border" />
          ))}
        </div>
        
        {/* Price Labels */}
        <div className="absolute top-2 bottom-6 left-4 flex flex-col justify-between text-xs text-muted-foreground pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="pr-2">
              ${(maxPrice - (i * (priceRange / 4))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="absolute left-16 right-4 top-2 bottom-6">
          {/* Line Chart */}
          <svg className="w-full h-full" viewBox={`0 0 ${chartData.length - 1} 100`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Area under the line */}
            <path
              d={`
                M0,${100 - ((chartData[0]?.price || 0) - minPrice) / priceRange * 100}
                ${chartData.map((point, i) => `L${i},${100 - ((point.price - minPrice) / priceRange * 100)}`).join(' ')}
                L${chartData.length - 1},100 L0,100 Z
              `}
              fill="url(#chartGradient)"
              className="transition-opacity duration-300"
            />
            
            {/* Line */}
            <path
              d={`
                M0,${100 - ((chartData[0]?.price || 0) - minPrice) / priceRange * 100}
                ${chartData.map((point, i) => `L${i},${100 - ((point.price - minPrice) / priceRange * 100)}`).join(' ')}
              `}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-opacity duration-300"
            />
            
            {/* Hover point */}
            {hoverPoint && (
              <circle
                cx={chartData.findIndex(p => p.timestamp === hoverPoint.timestamp)}
                cy={100 - ((hoverPoint.price - minPrice) / priceRange * 100)}
                r="4"
                fill={chartColor}
                stroke="white"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>
        
        {/* Time Labels */}
        <div className="absolute left-16 right-4 bottom-0 flex justify-between text-xs text-muted-foreground pt-1 pointer-events-none">
          {chartData
            .filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0)
            .map((point, i) => (
              <div key={i} className="truncate" style={{ maxWidth: '60px' }}>{point.time}</div>
            ))
          }
        </div>
        
        {/* Hover line */}
        {hoverPoint && (
          <div 
            className="absolute top-2 bottom-6 w-px bg-foreground/20 pointer-events-none"
            style={{ 
              left: `${16 + (chartData.findIndex(p => p.timestamp === hoverPoint.timestamp) / (chartData.length - 1)) * ((chartRef.current?.getBoundingClientRect().width ?? 0) - 20)}px` 
            }}
          />
        )}
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 border-t border-border text-sm">
        <div>
          <div className="text-muted-foreground">24h Volume</div>
          <div className="font-medium">${(currentPrice * 1000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Market Cap</div>
          <div className="font-medium">${(currentPrice * 1000000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Circulating Supply</div>
          <div className="font-medium">{(1000000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })} {tokenSymbol}</div>
        </div>
      </div>
    </div>
  );
} 