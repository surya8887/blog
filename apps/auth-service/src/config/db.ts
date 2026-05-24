import "dotenv/config";
import { env } from "./env.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js"; //#ignore
import pg from "pg";
const { Pool } = pg;

/**
 * PostgreSQL connection string loaded from environment variables.
 */
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined in the environment variables."
  );
}

const pool = new Pool({ connectionString });

/**
 * Prisma PostgreSQL adapter configuration.
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma Client instance.
 */
const prisma = new PrismaClient({
  adapter,
});

export { prisma };