import { NextRequest, NextResponse } from "next/server";
import { chatSessionsRepository } from "@/db/repositories/chatRepository";

interface Params {
  params: {
    id: string;
  };
}

// GET a specific chat session
export async function GET(req: NextRequest,params: any ) {
  try {
    // Use await to ensure params is fully resolved
    const id = await params.id;
    const sessionId = parseInt(id);
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    
    const session = await chatSessionsRepository.getSessionById(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
  }
}

// PUT update a chat session
export async function PUT(req: NextRequest,params: any ) {
  try {
    // Use await to ensure params is fully resolved
    const id = await params.id;
    const sessionId = parseInt(id);
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    
    const { title, modelName, modelSubText } = await req.json();
    
    const updatedSession = await chatSessionsRepository.updateSession(sessionId, {
      title,
      modelName,
      modelSubText,
    });
    
    if (!updatedSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 });
  }
}

// DELETE a chat session
export async function DELETE(req: NextRequest,params: any ) {
  try {
    // Use await to ensure params is fully resolved
    const id = await params.id;
    const sessionId = parseInt(id);
    
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    
    await chatSessionsRepository.deleteSession(sessionId);
    
    return NextResponse.json({ message: "Chat session deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
  }
} 