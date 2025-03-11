const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log('Creating default user...');
    
    // First, try to create the users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "privy_id" VARCHAR(255) NOT NULL UNIQUE,
        "wallet_address" VARCHAR(255),
        "email" VARCHAR(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Then insert the default user
    await pool.query(`
      INSERT INTO "users" ("id", "privy_id", "wallet_address", "email", "created_at", "updated_at")
      VALUES (1, 'default-user', 'default-wallet-address', 'default@example.com', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `);
    
    console.log('Default user created or already exists');
    
    // Now run the migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './db/migrations' });
    
    console.log('Migrations completed successfully');
  } catch (err) {
    console.error('Error:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Process failed:', err);
  process.exit(1);
}); 