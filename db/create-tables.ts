const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Disable SSL verification
  });

  try {
    console.log('Dropping existing tables...');
    
    // Drop all tables
    await pool.query(`
      DROP TABLE IF EXISTS "chat_messages" CASCADE;
      DROP TABLE IF EXISTS "chat_sessions" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "drizzle_migrations" CASCADE;
    `);
    
    console.log('All tables dropped successfully');
    
    // Create tables directly
    console.log('Creating tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "privy_id" VARCHAR(255) NOT NULL UNIQUE,
        "wallet_address" VARCHAR(255),
        "email" VARCHAR(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create chat_sessions table
    await pool.query(`
      CREATE TABLE "chat_sessions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
        "title" VARCHAR(255) NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
        "model_name" VARCHAR(100) NOT NULL,
        "model_sub_text" VARCHAR(100)
      );
    `);
    
    // Create chat_messages table
    await pool.query(`
      CREATE TABLE "chat_messages" (
        "id" SERIAL PRIMARY KEY,
        "session_id" INTEGER NOT NULL REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "role" VARCHAR(20) NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create default user
    console.log('Creating default user...');
    await pool.query(`
      INSERT INTO "users" ("id", "privy_id", "wallet_address", "email", "created_at", "updated_at")
      VALUES (1, 'default-user', 'default-wallet-address', 'default@example.com', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);
    
    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Error setting up database:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Database setup failed:', err);
  process.exit(1);
}); 