import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const connectionString = process.env.DATABASE_URL;
const { host, port, database, user, password } = parse(connectionString);

export default {
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: host || 'localhost',
    port: port ? parseInt(port) : 5432,
    database: database || 'sonic_chat',
    user: user || 'postgres',
    password: password || 'postgres',
    ssl: { rejectUnauthorized: false },
  },
} satisfies Config; 