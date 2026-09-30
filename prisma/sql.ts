import "server-only";
import "dotenv/config";
import { Pool } from "pg";

const globalForSql = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function connectPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
  });
}

const pool = globalForSql.pgPool ?? connectPool();

if (process.env.NODE_ENV !== "production") {
  globalForSql.pgPool = pool;
}

export async function query<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) {
  const result = await pool.query<T>(text, values);
  return result.rows;
}
