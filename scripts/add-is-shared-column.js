// This script adds the isShared column to the chat_sessions table
// Run with: node scripts/add-is-shared-column.js

import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function addIsSharedColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding isShared column to chat_sessions table...');
    
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chat_sessions' 
      AND column_name = 'is_shared'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('Column already exists. No changes needed.');
      return;
    }
    
    // Add the column
    await pool.query(`
      ALTER TABLE "chat_sessions" 
      ADD COLUMN "is_shared" boolean DEFAULT false
    `);
    
    console.log('Column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await pool.end();
  }
}

addIsSharedColumn(); 