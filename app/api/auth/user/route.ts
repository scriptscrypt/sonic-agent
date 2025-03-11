import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/db/repositories/userRepository";

// GET user by Privy ID
export async function GET(req: NextRequest) {
  try {
    const privyId = req.nextUrl.searchParams.get('privyId');
    
    if (!privyId) {
      return NextResponse.json({ error: "Privy ID is required" }, { status: 400 });
    }
    
    const user = await userRepository.getUserByPrivyId(privyId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// POST create or update user
export async function POST(req: NextRequest) {
  try {
    const { privyId, walletAddress, email } = await req.json();
    
    if (!privyId) {
      return NextResponse.json({ error: "Privy ID is required" }, { status: 400 });
    }
    
    const user = await userRepository.getOrCreateUserByPrivyId(privyId, walletAddress, email);
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json({ error: "Failed to create/update user" }, { status: 500 });
  }
} 