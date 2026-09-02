import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI config. Next.js loads `.env.local` on its own; the Prisma CLI does
 * not, so we load it here (falling back to `.env`) before any command reads
 * DATABASE_URL / DIRECT_URL.
 */
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    // file absent — fine
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
