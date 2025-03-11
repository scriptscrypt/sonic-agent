const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
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
    console.log('Resetting database...');
    
    // Drop all tables
    await pool.query(`
      DROP TABLE IF EXISTS "chat_messages" CASCADE;
      DROP TABLE IF EXISTS "chat_sessions" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "drizzle_migrations" CASCADE;
    `);
    
    console.log('All tables dropped successfully');
    
    // Initialize Drizzle ORM
    const db = drizzle(pool);
    
    // Run migrations to recreate tables
    console.log('Running migrations to recreate tables...');
    await migrate(db, { migrationsFolder: './db/migrations' });
    
    // Create default user
    console.log('Creating default user...');
    await pool.query(`
      INSERT INTO "users" ("id", "privy_id", "wallet_address", "email", "created_at", "updated_at")
      VALUES (1, 'default-user', 'default-wallet-address', 'default@example.com', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);
    
    console.log('Database reset completed successfully');
  } catch (err) {
    console.error('Error resetting database:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
}); 