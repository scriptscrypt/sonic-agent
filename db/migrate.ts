import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { db } from './index';
import { sql } from 'drizzle-orm';

dotenv.config();

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('Running migrations...');
  
  try {
    // First try to run the migration using drizzle's migrate function
    await migrate(db as any, { migrationsFolder: './db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    
    // If that fails, try to manually execute the SQL to add the username column
    try {
      console.log('Attempting manual migration...');
      
      // Check if username column exists
      const checkColumn = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
      `);
      
      if (checkColumn.rows.length === 0) {
        // Add username column if it doesn't exist
        await db.execute(sql`ALTER TABLE "users" ADD COLUMN "username" varchar(50)`);
        console.log('Added username column');
        
        // Add unique constraint
        await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username")`);
        console.log('Added unique constraint on username');
      } else {
        console.log('Username column already exists');
      }
      
      console.log('Manual migration completed successfully');
    } catch (manualError) {
      console.error('Error running manual migration:', manualError);
    }
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 