"use client";

import { useEffect, useState } from "react";

interface TokenPriceChartProps {
  tokenSymbol: string;
  currentPrice: number;
  priceChange: number;
}

interface PricePoint {
  time: string;
  price: number;
}

export function TokenPriceChart({ tokenSymbol, currentPrice, priceChange }: TokenPriceChartProps) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1W");
  
  // Generate mock chart data based on current price and change percentage
  useEffect(() => {
    const generateMockData = () => {
      const data: PricePoint[] = [];
      const now = new Date();
      const dataPoints = timeRange === "1D" ? 24 : 
                         timeRange === "1W" ? 7 : 
                         timeRange === "1M" ? 30 : 
                         timeRange === "3M" ? 90 : 365;
      
      // Calculate starting price based on current price and change percentage
      const volatility = Math.abs(priceChange) / 100 * currentPrice;
      
      for (let i = dataPoints; i >= 0; i--) {
        const date = new Date(now);
        
        if (timeRange === "1D") {
          date.setHours(now.getHours() - i);
        } else if (timeRange === "1W") {
          date.setDate(now.getDate() - i);
        } else if (timeRange === "1M") {
          date.setDate(now.getDate() - i);
        } else if (timeRange === "3M") {
          date.setDate(now.getDate() - i * 3);
        } else {
          date.setDate(now.getDate() - i);
        }
        
        // Create some random price movement, but ensure it ends at current price
        const randomFactor = Math.sin(i / (dataPoints / Math.PI)) * volatility * 0.5;
        const progressFactor = i / dataPoints;
        const directionFactor = priceChange >= 0 ? 1 : -1;
        
        // Calculate price: start from (current - change), add random movement, and ensure it ends at current price
        const price = currentPrice - (directionFactor * volatility * progressFactor) + randomFactor;
        
        data.push({
          time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: Math.max(0.01, price) // Ensure price doesn't go below 0.01
        });
      }
      
      setChartData(data);
    };
    
    generateMockData();
  }, [currentPrice, priceChange, timeRange]);
  
  // Find min and max prices for scaling
  const minPrice = Math.min(...chartData.map(point => point.price));
  const maxPrice = Math.max(...chartData.map(point => point.price));
  const priceRange = maxPrice - minPrice;
  
  // Calculate chart color based on price change
  const chartColor = priceChange >= 0 ? "#10B981" : "#EF4444";
  
  return (
    <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg">{tokenSymbol} Price Chart</h3>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold">${currentPrice.toLocaleString()}</span>
            <span 
              className={`ml-2 px-2 py-0.5 rounded text-sm ${priceChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {priceChange >= 0 ? '+' : ''}{priceChange}%
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2 text-sm">
          {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 rounded ${timeRange === range ? 'bg-accent text-white' : 'bg-accent/10 hover:bg-accent/20'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mock Chart */}
      <div className="h-64 relative mt-6">
        {/* Chart Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-accent/10" />
          ))}
        </div>
        
        {/* Price Labels */}
        <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between text-xs text-foreground/60">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              ${(maxPrice - (i * (priceRange / 4))).toFixed(2)}
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="absolute left-12 right-0 top-0 bottom-0">
          {/* Line Chart */}
          <svg className="w-full h-full" viewBox={`0 0 ${chartData.length} 100`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Area under the line */}
            <path
              d={`
                M0,${100 - ((chartData[0]?.price || 0) - minPrice) / priceRange * 100}
                ${chartData.map((point, i) => `L${i},${100 - ((point.price - minPrice) / priceRange * 100)}`).join(' ')}
                L${chartData.length - 1},100 L0,100 Z
              `}
              fill="url(#chartGradient)"
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
            />
          </svg>
        </div>
        
        {/* Time Labels */}
        <div className="absolute left-12 right-0 bottom-0 flex justify-between text-xs text-foreground/60 pt-2">
          {chartData.filter((_, i) => i % Math.floor(chartData.length / 5) === 0).map((point, i) => (
            <div key={i}>{point.time}</div>
          ))}
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
        <div>
          <div className="text-foreground/60">24h Volume</div>
          <div className="font-medium">${(currentPrice * 1000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-foreground/60">Market Cap</div>
          <div className="font-medium">${(currentPrice * 1000000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-foreground/60">Circulating Supply</div>
          <div className="font-medium">{(1000000000 * (Math.random() + 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })} {tokenSymbol}</div>
        </div>
      </div>
    </div>
  );
} 