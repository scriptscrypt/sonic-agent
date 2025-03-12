import { useQuery } from '@tanstack/react-query';

export interface BirdeyeMarket {
  address: string;
  name: string;
  price: number | null;
  liquidity: number;
  volume24h: number;
  trade24h: number | null;
  trade24hChangePercent: number | null;
  uniqueWallet24h: number | null;
  uniqueWallet24hChangePercent: number | null;
  createdAt: string | null;
  source: string | null;
  base: {
    address: string;
    symbol: string;
    decimals: number;
    icon: string | null;
  };
  quote: {
    address: string;
    symbol: string;
    decimals: number;
    icon: string | null;
  };
}

export interface BirdeyeResponse {
  data: {
    items: BirdeyeMarket[];
    total: number;
  };
  success: boolean;
}

// Fetch markets from Birdeye
export function useBirdeyeMarkets(
  options: {
    limit?: number;
    offset?: number;
    address?: string;
    timeFrame?: string;
    sortBy?: string;
    sortType?: string;
  } = {}
) {
  const {
    limit = 10,
    offset = 0,
    address = 'So11111111111111111111111111111111111111112', // SOL by default
    timeFrame = '24h',
    sortBy = 'liquidity',
    sortType = 'desc'
  } = options;

  return useQuery<BirdeyeResponse>({
    queryKey: ['birdeye-markets', limit, offset, address, timeFrame, sortBy, sortType],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        address,
        time_frame: timeFrame,
        sort_by: sortBy,
        sort_type: sortType
      });
      
      const response = await fetch(`/api/birdeye?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch markets from Birdeye');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 