// The database address from MONGODB_URI (the cluster, no database in it) and
// MONGODB_DB (the database name), so switching databases means changing only
// MONGODB_DB. Without them, Prisma uses DATABASE_URL as before (hosts that
// still set only DATABASE_URL keep working). Prisma's CLI: scripts/with-db.mjs.
export function databaseUrl(): string | undefined {
  const uri = process.env.MONGODB_URI;
  const db = process.env.MONGODB_DB;
  if (!uri || !db) return undefined;
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(?:\/[^?]*)?(\?.*)?$/);
  if (!m) throw new Error("MONGODB_URI isn't a MongoDB connection string");
  return `${m[1]}/${encodeURIComponent(db)}${m[2] || ""}`;
}

export function prismaOptions() {
  const url = databaseUrl();
  return url ? { datasourceUrl: url } : undefined;
}
