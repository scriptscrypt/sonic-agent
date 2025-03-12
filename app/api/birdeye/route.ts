import { NextRequest, NextResponse } from 'next/server';

// Birdeye API endpoint for markets
const BIRDEYE_API_URL = 'https://public-api.birdeye.so/defi/v2/markets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const address = searchParams.get('address') || 'So11111111111111111111111111111111111111112'; // SOL by default
    const timeFrame = searchParams.get('time_frame') || '24h';
    const sortBy = searchParams.get('sort_by') || 'liquidity';
    const sortType = searchParams.get('sort_type') || 'desc';
    
    // Fetch markets from Birdeye API
    const response = await fetch(
      `${BIRDEYE_API_URL}?address=${address}&time_frame=${timeFrame}&sort_type=${sortType}&sort_by=${sortBy}&offset=${offset}&limit=${limit}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.BIRDEYE_API_KEY || '', // Add your Birdeye API key to .env
          'accept': 'application/json',
          'x-chain': 'solana'
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Birdeye API error: ${response.status} - ${response.statusText}`);
      return NextResponse.json(
        { 
          success: false,
          data: { items: [], total: 0 }
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Validate the response structure
    if (!data || !data.data || !Array.isArray(data.data.items)) {
      console.error('Invalid response structure from Birdeye API:', data);
      return NextResponse.json(
        { 
          success: false,
          data: { items: [], total: 0 }
        },
        { status: 500 }
      );
    }
    
    // Return the data as is
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching markets from Birdeye:', error);
    return NextResponse.json(
      { 
        success: false,
        data: { items: [], total: 0 }
      },
      { status: 500 }
    );
  }
} 