import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTokensTable = `
CREATE TABLE IF NOT EXISTS "tokens" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "symbol" varchar(50) NOT NULL,
  "description" text,
  "logo_url" varchar(255),
  "price" decimal(18,8) DEFAULT '0',
  "market_cap" decimal(24,2) DEFAULT '0',
  "volume_24h" decimal(24,2) DEFAULT '0',
  "change_24h" decimal(10,2) DEFAULT '0',
  "mint_address" varchar(255),
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS "tokens_user_id_users_id_fk";
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
`;

async function run() {
  try {
    console.log('Creating tokens table...');
    await pool.query(createTokensTable);
    console.log('Tokens table created successfully!');
  } catch (error) {
    console.error('Error creating tokens table:', error);
  } finally {
    await pool.end();
  }
}

run(); 