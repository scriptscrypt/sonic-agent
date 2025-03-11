// Simple script to add the username column to the users table
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking if username column exists...');
    
    // Check if username column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Username column does not exist. Adding it...');
      
      // Add username column
      await pool.query(`ALTER TABLE "users" ADD COLUMN "username" varchar(50)`);
      console.log('Added username column');
      
      // Add unique constraint
      await pool.query(`ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username")`);
      console.log('Added unique constraint on username');
    } else {
      console.log('Username column already exists');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 