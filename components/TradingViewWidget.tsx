'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  timeframe?: string;
}

// Export the memo'd component
export const TradingViewWidget = memo(TradingViewWidgetComponent);

function TradingViewWidgetComponent({ 
  symbol = 'SOL', 
  theme = 'light',
  timeframe = '1D'
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const widgetRef = useRef<any>(null);

  // Use SOL as fallback if symbol is empty
  const tokenSymbol = symbol || 'SOL';

  useEffect(() => {
    // Generate a unique container ID
    const containerId = `tradingview_${tokenSymbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.floor(Math.random() * 1000000)}`;
    
    if (container.current) {
      container.current.id = containerId;
    }

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

    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      scriptRef.current = document.createElement('script');
      scriptRef.current.src = 'https://s3.tradingview.com/tv.js';
      scriptRef.current.async = true;
      scriptRef.current.onload = () => createWidget(containerId, formattedSymbol, interval);
      document.head.appendChild(scriptRef.current);
    } else {
      createWidget(containerId, formattedSymbol, interval);
    }

    function createWidget(containerId: string, symbol: string, interval: string) {
      if (!window.TradingView || !container.current) return;
      
      // Clean up previous widget if it exists
      if (widgetRef.current) {
        try {
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up widget:', e);
        }
      }

      // Create new widget
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        toolbar_bg: theme === 'dark' ? '#2B2B43' : '#f1f3f6',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: containerId,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        studies: ['RSI@tv-basicstudies'],
        show_popup_button: false,
        width: '100%',
        height: '100%',
        disabled_features: [
          "use_localstorage_for_settings",
          "header_symbol_search",
          "header_screenshot",
          "header_compare",
          "header_undo_redo",
          "header_saveload"
        ],
        enabled_features: [
          "move_logo_to_main_pane",
          "same_data_requery",
          "side_toolbar_in_fullscreen_mode"
        ],
        loading_screen: { backgroundColor: theme === 'dark' ? '#131722' : '#ffffff' },
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#22c55e",
          "mainSeriesProperties.candleStyle.downColor": "#ef4444",
          "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444"
        }
      });
    }

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, [tokenSymbol, theme, timeframe]);

  return <div ref={container} className="w-full h-full min-h-[400px]" />;
}

// Add TypeScript interface for TradingView global
declare global {
  interface Window {
    TradingView: any;
  }
} 