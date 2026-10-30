import { Hono } from "hono";
import publicErrorMessage from "@/helpers/publicErrorMessage";

import initializePayment from "@/controllers/payments/initialize";
import verifyPayment from "@/controllers/payments/verify";
import handlePaystackWebhook from "@/controllers/payments/webhook";

// Public: checkout and the Paystack webhook work without a session.
export const app = new Hono();

app.post("/initialize", async ({ req, json }) => {
  try {
    const result = await initializePayment({
      body: await req.json(),
      origin: process.env.NEXT_PUBLIC_HOST || new URL(req.url).origin,
    });
    return json(result);
  } catch (err: any) {
    return json(publicErrorMessage(err, "We couldn't start the payment. Please try again."), 400);
  }
});

// Safe to call more than once for the same reference — see fulfill.ts.
app.get("/verify/:reference", async ({ req, json }) => {
  try {
    return json(await verifyPayment(req.param("reference")));
  } catch (err: any) {
    return json(
      publicErrorMessage(
        err,
        `We couldn't confirm your payment just yet. Please refresh in a moment, or contact us with reference ${req.param("reference")}.`,
      ),
      500,
    );
  }
});

// Verifies the raw body against Paystack's signature before parsing it.
app.post("/webhook", async (c) => {
  try {
    const rawBody = await c.req.text();
    await handlePaystackWebhook(rawBody, c.req.header("x-paystack-signature"));
    return c.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error", error);
    return c.json({ received: false }, 400);
  }
});

export default app;
