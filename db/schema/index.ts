import { pgTable, serial, text, timestamp, varchar, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  privyId: varchar('privy_id', { length: 255 }).notNull().unique(),
  walletAddress: varchar('wallet_address', { length: 255 }),
  email: varchar('email', { length: 255 }),
  username: varchar('username', { length: 50 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chat sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  modelName: varchar('model_name', { length: 100 }).notNull(),
  modelSubText: varchar('model_sub_text', { length: 100 }),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: serial('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// NFT table
export const nfts = pgTable('nfts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  metadata: jsonb('metadata'), // Store additional NFT metadata as JSON
  mintAddress: varchar('mint_address', { length: 255 }), // Solana mint address if minted
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(chatSessions),
  nfts: many(nfts),
}));

export const chatSessionsRelations = relations(chatSessions, ({ many, one }) => ({
  messages: many(chatMessages),
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const nftsRelations = relations(nfts, ({ one }) => ({
  user: one(users, {
    fields: [nfts.userId],
    references: [users.id],
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type NFT = typeof nfts.$inferSelect;
export type NewNFT = typeof nfts.$inferInsert; 