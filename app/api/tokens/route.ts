import { NextRequest, NextResponse } from 'next/server';
import { tokenRepository } from '@/db/repositories/tokenRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');
    const username = searchParams.get('username');
    
    let tokens;
    
    if (userId) {
      tokens = await tokenRepository.getTokensByUserId(parseInt(userId));
    } else if (walletAddress) {
      tokens = await tokenRepository.getTokensByWalletAddress(walletAddress);
    } else if (username) {
      tokens = await tokenRepository.getTokensByUsername(username);
    } else {
      tokens = await tokenRepository.getAllTokens();
    }
    
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
} 