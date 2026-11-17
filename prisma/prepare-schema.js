// Build-time schema selector:
// - If DATABASE_URL looks like Postgres (Neon), generate the Prisma client from
//   schema.postgres.prisma.
// - Otherwise keep the local SQLite schema.
// Runs automatically before `next build` (see package.json build script).
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const main = path.join(root, "prisma", "schema.prisma");
const postgres = path.join(root, "prisma", "schema.postgres.prisma");

const url = process.env.DATABASE_URL || "";
const isPostgres = url.startsWith("postgres") || url.startsWith("postgresql");

if (isPostgres && fs.existsSync(postgres)) {
  fs.copyFileSync(postgres, main);
  console.log("[prepare-schema] DATABASE_URL is Postgres - prisma/schema.prisma switched to the Neon Postgres schema");
} else {
  console.log("[prepare-schema] keeping the local SQLite schema");
}
