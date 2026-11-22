#!/usr/bin/env node
// Runs a command with DATABASE_URL built from MONGODB_URI (the cluster, no
// database in it) and MONGODB_DB (the database name), so Prisma's CLI and
// one-off scripts reach the right database by changing only MONGODB_DB.
// Reads .env.local, then .env (already-set variables win, as in Next.js).
//
//   node scripts/with-db.mjs prisma db push
//   node scripts/with-db.mjs prisma studio
//   MONGODB_DB=otherDb node scripts/with-db.mjs node scripts/some-script.mjs
//
// Without MONGODB_URI and MONGODB_DB it leaves DATABASE_URL as it is.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { MONGODB_URI: uri, MONGODB_DB: db } = process.env;
if (uri && db) {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(?:\/[^?]*)?(\?.*)?$/);
  if (!m) {
    console.error("MONGODB_URI isn't a MongoDB connection string.");
    process.exit(1);
  }
  process.env.DATABASE_URL = `${m[1]}/${encodeURIComponent(db)}${m[2] || ""}`;
  console.error(`[with-db] database: ${db}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Usage: node scripts/with-db.mjs <command> [args…]");
  process.exit(1);
}

// Let `prisma`, `tsx` and the like run without npx.
const bin = path.resolve("node_modules", ".bin");
const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === "PATH") || "PATH";
process.env[pathKey] = `${bin}${path.delimiter}${process.env[pathKey] || ""}`;

const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", env: process.env });
process.exit(result.status ?? 1);
