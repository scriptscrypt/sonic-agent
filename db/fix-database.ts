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

  try {
    console.log('Checking if default user exists...');
    
    // Check if default user exists
    const userResult = await pool.query(`
      SELECT * FROM "users" WHERE "id" = 1;
    `);
    
    if (userResult.rows.length === 0) {
      console.log('Default user does not exist, creating...');
      
      // Create default user
      await pool.query(`
        INSERT INTO "users" ("id", "privy_id", "wallet_address", "email", "created_at", "updated_at")
        VALUES (1, 'default-user', 'default-wallet-address', 'default@example.com', NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
      `);
      
      console.log('Default user created');
    } else {
      console.log('Default user already exists');
    }
    
    // Update any chat sessions with null user_id to reference the default user
    console.log('Updating chat sessions with null user_id...');
    
    const updateResult = await pool.query(`
      UPDATE "chat_sessions" SET "user_id" = 1 WHERE "user_id" IS NULL;
    `);
    
    console.log(`Updated ${updateResult.rowCount} chat sessions`);
    
    console.log('Database fix completed successfully');
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