import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import prisma from "@/config/prisma";

// Only store admins sign in — shoppers check out as guests. Sign-up is
// closed: the first admin comes from `npm run seed` (scripts/seed.ts).
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mongodb" }),

  trustedOrigins: [
    process.env.NEXT_PUBLIC_HOST || "http://localhost:3000",
    // Any port: `next dev` moves to 3001+ when 3000 is taken.
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:*"] : []),
  ],

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },

  user: {
    additionalFields: {
      // Set by the seed script / database, never by a request.
      role: { type: "string", required: false, input: false },
      active: { type: "boolean", required: false, input: false },
    },
  },
});
