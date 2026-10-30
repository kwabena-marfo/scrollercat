import { PrismaClient } from "@prisma/client";

// One client per process — in dev, Next's hot reload would otherwise open a
// new connection pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
