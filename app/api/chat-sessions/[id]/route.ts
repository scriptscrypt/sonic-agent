import { NextRequest, NextResponse } from "next/server";
import { chatSessionsRepository } from "@/db/repositories/chatRepository";

// GET a specific chat session
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
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
  }
}

// PUT update a chat session
export async function PUT(
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
    
    const data = await req.json();
    
    // Validate required fields
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }
    
    // Update the session
    const updatedSession = await chatSessionsRepository.updateSession(sessionId, data);
    
    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 });
  }
}

// DELETE a chat session
export async function DELETE(
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
    
    const success = await chatSessionsRepository.deleteSession(sessionId);
    
    if (!success) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
  }
} 