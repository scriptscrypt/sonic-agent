import { NextRequest, NextResponse } from 'next/server';
import { nftRepository } from '@/db/repositories/nftRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');
    const username = searchParams.get('username');
    
    let nfts;
    
    if (userId) {
      nfts = await nftRepository.getNFTsByUserId(parseInt(userId));
    } else if (walletAddress) {
      nfts = await nftRepository.getNFTsByWalletAddress(walletAddress);
    } else if (username) {
      nfts = await nftRepository.getNFTsByUsername(username);
    } else {
      nfts = await nftRepository.getAllNFTs();
    }
    
    return NextResponse.json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
} 