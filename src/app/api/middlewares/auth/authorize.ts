import { auth } from "@/lib/auth";

// Everything registered after this in [[...routes]]/route.ts needs a
// signed-in, active store admin.
export default function requireAuth() {
  return async (c: any, next: () => Promise<void>) => {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });

      if (!session) {
        c.set("admin", null);
        return c.json({ error: "Unauthorized" }, 401);
      }

      if ((session.user as any).active === false) {
        c.set("admin", null);
        return c.json({ error: "This account has been deactivated" }, 401);
      }

      c.set("admin", session.user);
      await next();
    } catch (err) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
}
