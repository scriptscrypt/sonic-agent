import { NextRequest, NextResponse } from "next/server";
import { chatSessionsRepository, chatMessagesRepository } from "@/db/repositories/chatRepository";

// GET a shared chat session
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await the params object
    const params = await Promise.resolve(context.params);
    
    if (!params || !params.id) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    
    const sessionId = parseInt(params.id);
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    
    const session = await chatSessionsRepository.getSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }
    
    // Check if the session is shared
    if (session.isShared === undefined) {
      // If isShared doesn't exist in the schema yet, assume it's not shared
      return NextResponse.json({ error: "This chat session is not shared" }, { status: 403 });
    }
    
    if (!session.isShared) {
      return NextResponse.json({ error: "This chat session is not shared" }, { status: 403 });
    }
    
    // Get messages for the session
    const messages = await chatMessagesRepository.getMessagesBySessionId(sessionId);
    
    // Return both session and messages
    return NextResponse.json({
      session,
      messages
    });
  } catch (error) {
    console.error("Error fetching shared chat session:", error);
    return NextResponse.json({ error: "Failed to fetch shared chat session" }, { status: 500 });
  }
} 