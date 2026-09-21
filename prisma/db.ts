import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

const globalForDb = globalThis as typeof globalThis & {
  prisma?: ReturnType<typeof connect>;
};

function connect() {
  return postgres<Contract>({
    contractJson,
    url: process.env.DATABASE_URL!,
    poolOptions: {
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
    },
  });
}

export const db = globalForDb.prisma ?? connect();
if (process.env.NODE_ENV !== "production") {
  globalForDb.prisma = db;
}
