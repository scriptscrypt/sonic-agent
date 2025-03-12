import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/db/repositories/userRepository';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await the params object
    const params = await Promise.resolve(context.params);
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const user = await userRepository.getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
} 