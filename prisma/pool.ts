import "dotenv/config";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

const globalForPool = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
    // attachDatabasePool keeps the function alive this long after each query.
    idleTimeoutMillis: 5_000,
  });
  // The pooler can drop idle connections. pg emits "error" for them, and an
  // unhandled "error" event exits the process. The pool replaces the client.
  pool.on("error", () => {});
  attachDatabasePool(pool);
  return pool;
}

/** The only Postgres pool. Shared by the Prisma client and raw SQL queries. */
export const pool = (globalForPool.pgPool ??= createPool());
