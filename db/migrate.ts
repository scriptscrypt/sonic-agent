const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

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
    await migrate(db, { migrationsFolder: './db/migrations' });
    
    // Execute our custom fix migration manually if needed
    const fixMigrationPath = path.join(__dirname, 'migrations', '0004_fix_user_reference.sql');
    if (fs.existsSync(fixMigrationPath)) {
      console.log('Running fix migration...');
      const fixMigrationSql = fs.readFileSync(fixMigrationPath, 'utf8');
      await pool.query(fixMigrationSql);
      console.log('Fix migration completed successfully');
    }
    
    console.log('Migrations completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 