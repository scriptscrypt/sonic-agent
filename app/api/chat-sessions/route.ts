import { NextRequest, NextResponse } from "next/server";
import { chatSessionsRepository } from "@/db/repositories/chatRepository";
import { userRepository } from "@/db/repositories/userRepository";

// GET all chat sessions for a user
export async function GET(req: NextRequest) {
  try {
    const privyId = req.nextUrl.searchParams.get("privyId");

    if (!privyId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user by Privy ID
    const user = await userRepository.getUserByPrivyId(privyId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get sessions for user
    const sessions = await chatSessionsRepository.getSessionsByUserId(user.id);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}

// POST create a new chat session
export async function POST(req: NextRequest) {
  try {
    const { title, modelName, modelSubText, privyId } = await req.json();
    console.log(title, modelName, modelSubText, privyId);

    if (!title || !modelName || !privyId) {
      return NextResponse.json(
        { error: "Title, model name, and user ID are required" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await userRepository.getUserByPrivyId(privyId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newSession = await chatSessionsRepository.createSession({
      userId: user.id,
      title,
      modelName,
      modelSubText,
      timestamp: new Date(),
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}
