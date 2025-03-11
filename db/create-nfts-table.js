import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createNFTsTable = `
CREATE TABLE IF NOT EXISTS "nfts" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "image_url" varchar(255) NOT NULL,
  "metadata" jsonb,
  "mint_address" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "nfts" DROP CONSTRAINT IF EXISTS "nfts_user_id_users_id_fk";
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
`;

async function run() {
  try {
    console.log('Creating NFTs table...');
    await pool.query(createNFTsTable);
    console.log('NFTs table created successfully!');
  } catch (error) {
    console.error('Error creating NFTs table:', error);
  } finally {
    await pool.end();
  }
}

run(); 