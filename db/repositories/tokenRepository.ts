import { db } from '../index';
import { tokens, NewToken, Token, users } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const tokenRepository = {
  // Get all tokens
  async getAllTokens(): Promise<Token[]> {
    try {
      return db.select().from(tokens).orderBy(desc(tokens.createdAt));
    } catch (error) {
      console.error('Error in getAllTokens:', error);
      throw error;
    }
  },

  // Get tokens by user ID
  async getTokensByUserId(userId: number): Promise<Token[]> {
    try {
      return db.select().from(tokens).where(eq(tokens.userId, userId)).orderBy(desc(tokens.createdAt));
    } catch (error) {
      console.error('Error in getTokensByUserId:', error);
      throw error;
    }
  },

  // Get tokens by wallet address
  async getTokensByWalletAddress(walletAddress: string): Promise<Token[]> {
    try {
      const user = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      if (!user[0]) return [];
      return this.getTokensByUserId(user[0].id);
    } catch (error) {
      console.error('Error in getTokensByWalletAddress:', error);
      throw error;
    }
  },

  // Get tokens by username
  async getTokensByUsername(username: string): Promise<Token[]> {
    try {
      const user = await db.select().from(users).where(eq(users.username, username));
      if (!user[0]) return [];
      return this.getTokensByUserId(user[0].id);
    } catch (error) {
      console.error('Error in getTokensByUsername:', error);
      throw error;
    }
  },

  // Get token by ID
  async getTokenById(id: number): Promise<Token | undefined> {
    try {
      const result = await db.select().from(tokens).where(eq(tokens.id, id));
      return result[0];
    } catch (error) {
      console.error('Error in getTokenById:', error);
      throw error;
    }
  },

  // Create a new token
  async createToken(token: NewToken): Promise<Token> {
    try {
      const result = await db.insert(tokens).values(token).returning();
      return result[0];
    } catch (error) {
      console.error('Error in createToken:', error);
      throw error;
    }
  },

  // Update a token
  async updateToken(id: number, token: Partial<NewToken>): Promise<Token | undefined> {
    try {
      const result = await db.update(tokens).set({
        ...token,
        updatedAt: new Date(),
      }).where(eq(tokens.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateToken:', error);
      throw error;
    }
  },

  // Delete a token
  async deleteToken(id: number): Promise<void> {
    try {
      await db.delete(tokens).where(eq(tokens.id, id));
    } catch (error) {
      console.error('Error in deleteToken:', error);
      throw error;
    }
  }
}; 