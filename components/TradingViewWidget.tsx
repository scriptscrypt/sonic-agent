'use client';

import { useEffect, useRef, useState, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  timeframe?: string;
  height?: string | number;
}

// Export the memo'd component
export const TradingViewWidget = memo(TradingViewWidgetComponent);

function TradingViewWidgetComponent({ 
  symbol = 'SOL', 
  theme = 'light',
  timeframe = '1D',
  height = '100%'
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  
  // Use SOL as fallback if symbol is empty
  const tokenSymbol = symbol || 'SOL';

  // Map timeframe to interval
  const intervalMap: Record<string, string> = {
    '1D': '60',
    '1W': 'D',
    '1M': 'W',
    '3M': 'M',
    '1Y': '3M'
  };
  
  const interval = intervalMap[timeframe] || '60';
  
  // Format symbol for TradingView
  const formattedSymbol = tokenSymbol.includes(':') ? tokenSymbol : `BINANCE:${tokenSymbol}USDT`;

  // Use direct iframe approach instead of the TradingView widget library
  useEffect(() => {
    if (!container.current) return;
    
    // Clear the container first
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('allowTransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('src', `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${formattedSymbol}&interval=${interval}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=${theme === 'dark' ? '2B2B43' : 'f1f3f6'}&studies=%5B%5D&theme=${theme}&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2322c55e%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23ef4444%22%2C%22mainSeriesProperties.candleStyle.wickUpColor%22%3A%22%2322c55e%22%2C%22mainSeriesProperties.candleStyle.wickDownColor%22%3A%22%23ef4444%22%7D&enabled_features=%5B%22move_logo_to_main_pane%22%5D&disabled_features=%5B%22use_localstorage_for_settings%22%2C%22header_symbol_search%22%2C%22header_screenshot%22%2C%22header_compare%22%5D&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.display = 'block';
    
    container.current.appendChild(iframe);
    
    return () => {
      if (container.current) {
        while (container.current.firstChild) {
          container.current.removeChild(container.current.firstChild);
        }
      }
    };
  }, [formattedSymbol, interval, theme]);

  // Calculate the height style
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      ref={container} 
      style={{ 
        width: '100%',
        height: heightStyle,
        minHeight: '500px',
        position: 'relative',
        display: 'block'
      }} 
    />
  );
}

// Add TypeScript interface for TradingView global
declare global {
  interface Window {
    TradingView: any;
  }
} 