import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/db/repositories/userRepository';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const { username } = params;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    const user = await userRepository.getUserByUsername(username);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 