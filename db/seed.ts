const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const { users } = require('./schema');

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('Seeding database...');
  
  // Create default user
  try {
    const defaultUser = await db.insert(users).values({
      id: 1,
      privyId: 'default-user',
      walletAddress: 'default-wallet-address',
      email: 'default@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log('Default user created:', defaultUser);
  } catch (error) {
    console.log('Default user already exists or error creating default user:', error.message);
  }
  
  console.log('Seeding completed successfully');
  
  await pool.end();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
}); 