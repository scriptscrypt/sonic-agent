import { db } from '../index';
import { chatSessions, chatMessages, NewChatSession, NewChatMessage, ChatSession, ChatMessage } from '../schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Chat Sessions Repository
export const chatSessionsRepository = {
  // Get all chat sessions
  async getAllSessions(): Promise<ChatSession[]> {
    return db.select().from(chatSessions).orderBy(desc(chatSessions.timestamp));
  },

  // Get all chat sessions for a user
  async getSessionsByUserId(userId: number): Promise<ChatSession[]> {
    return db.select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.timestamp));
  },

  // Get a chat session by ID
  async getSessionById(id: number): Promise<ChatSession | undefined> {
    const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return result[0];
  },

  // Create a new chat session
  async createSession(session: NewChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(session).returning();
    return result[0];
  },

  // Update a chat session
  async updateSession(id: number, session: Partial<NewChatSession>): Promise<ChatSession | undefined> {
    // Handle the case where isShared might be passed but not in the schema yet
    const updateData = { ...session };
    
    // If isShared is passed but not in the schema, try to add it
    if ('isShared' in updateData && !('isShared' in chatSessions)) {
      try {
        // Try to add the column if it doesn't exist
        await db.execute(sql`
          DO $$ 
          BEGIN
              IF NOT EXISTS (
                  SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name = 'chat_sessions' 
                  AND column_name = 'is_shared'
              ) THEN
                  ALTER TABLE "chat_sessions" ADD COLUMN "is_shared" boolean DEFAULT false;
              END IF;
          END $$;
        `);
      } catch (error) {
        console.error("Error adding isShared column:", error);
        // Remove isShared from updateData if we couldn't add the column
        delete (updateData as any).isShared;
      }
    }
    
    const result = await db.update(chatSessions).set(updateData).where(eq(chatSessions.id, id)).returning();
    return result[0];
  },

  // Delete a chat session
  async deleteSession(id: number): Promise<void> {
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  }
};

// Chat Messages Repository
export const chatMessagesRepository = {
  // Get all messages for a session
  async getMessagesBySessionId(sessionId: number): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.timestamp);
  },

  // Create a new message
  async createMessage(message: NewChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  },

  // Get a message by ID
  async getMessageById(id: number): Promise<ChatMessage | undefined> {
    const result = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return result[0];
  },

  // Delete all messages for a session
  async deleteMessagesBySessionId(sessionId: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
  }
}; 