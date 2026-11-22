import { PrismaClient } from "@prisma/client";
import { prismaOptions } from "./databaseUrl";

// One client per process — in dev, Next's hot reload would otherwise open a
// new connection pool on every edit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
