import { Hono } from "hono";
import { handle } from "hono/vercel";

import authoriseAdmin from "../middlewares/auth/authorize";

import { auth } from "@/lib/auth";

import storeRoutes from "../routes/store";
import paymentsRoutes from "../routes/payments";
import adminRoutes from "../routes/admin";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

// Public — the storefront, checkout and the Paystack webhook.
app.route("/store", storeRoutes);
app.route("/payments", paymentsRoutes);

app.use(authoriseAdmin());

app.route("/admin", adminRoutes);

// ------------------------
export const GET = handle(app);
export const POST = handle(app);
