import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
    await migrate(db as any, { migrationsFolder: './db/migrations' });
    
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