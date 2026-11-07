import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };
import { pool } from "./pool";

const globalForDb = globalThis as typeof globalThis & {
  prisma?: ReturnType<typeof connect>;
  prismaProfile?: string;
};

function connect() {
  return postgres<Contract>({ contractJson, pg: pool });
}

const profileHash = contractJson.profileHash;

if (process.env.NODE_ENV !== "production" && globalForDb.prismaProfile !== profileHash) {
  globalForDb.prisma = connect();
  globalForDb.prismaProfile = profileHash;
}

export const db = globalForDb.prisma ?? connect();
