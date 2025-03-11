import { NextRequest, NextResponse } from 'next/server';

// Mock token price data
const mockTokenPrices: Record<string, {
  price: number;
  change24h: number;
  marketCap: string;
  volume24h: string;
}> = {
  'BTC': {
    price: 60450.25,
    change24h: 2.3,
    marketCap: '$1.15T',
    volume24h: '$28.5B'
  },
  'ETH': {
    price: 3450.75,
    change24h: 1.8,
    marketCap: '$415B',
    volume24h: '$12.7B'
  },
  'SOL': {
    price: 256.35,
    change24h: 5.2,
    marketCap: '$110B',
    volume24h: '$4.2B'
  },
  'USDC': {
    price: 1.00,
    change24h: 0.01,
    marketCap: '$32B',
    volume24h: '$2.1B'
  },
  'USDT': {
    price: 1.00,
    change24h: 0.02,
    marketCap: '$95B',
    volume24h: '$45B'
  },
  'AVAX': {
    price: 32.45,
    change24h: -2.1,
    marketCap: '$12B',
    volume24h: '$850M'
  },
  'DOT': {
    price: 7.85,
    change24h: -1.5,
    marketCap: '$9.8B',
    volume24h: '$320M'
  },
  'ADA': {
    price: 0.45,
    change24h: -0.8,
    marketCap: '$15.7B',
    volume24h: '$410M'
  },
  'MATIC': {
    price: 0.65,
    change24h: 3.2,
    marketCap: '$6.5B',
    volume24h: '$280M'
  },
  'LINK': {
    price: 15.30,
    change24h: 4.5,
    marketCap: '$8.9B',
    volume24h: '$520M'
  }
};

// Generate random price data for unknown tokens
function generateRandomTokenData(symbol: string) {
  const basePrice = Math.random() * 100 + 1; // Random price between 1 and 101
  const change = (Math.random() * 10) - 5; // Random change between -5% and +5%
  const marketCap = `$${(basePrice * (Math.random() * 10 + 1) * 1000000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const volume = `$${(basePrice * (Math.random() * 5 + 0.5) * 10000000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  
  return {
    price: parseFloat(basePrice.toFixed(2)),
    change24h: parseFloat(change.toFixed(2)),
    marketCap,
    volume24h: volume
  };
}

export async function GET(request: NextRequest) {
  // Get token symbol from query params
  const { searchParams } = new URL(request.url);
  let symbol = searchParams.get('symbol') || 'BTC';
  
  // Convert to uppercase for consistency
  symbol = symbol.toUpperCase();
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data for the requested token or generate random data if not found
  const tokenData = mockTokenPrices[symbol] || generateRandomTokenData(symbol);
  
  return NextResponse.json(tokenData);
} 