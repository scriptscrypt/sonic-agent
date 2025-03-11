import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/db/repositories/userRepository";

// GET check if username is available
export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }
    
    const user = await userRepository.getUserByUsername(username);
    
    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json({ error: "Failed to check username availability" }, { status: 500 });
  }
} 