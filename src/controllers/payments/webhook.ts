import crypto from "crypto";

import fulfillPayment from "./fulfill";

// The source of truth for payment confirmation. Set the webhook URL in the
// Paystack dashboard to <host>/api/payments/webhook.
export default async function handlePaystackWebhook(
  rawBody: string,
  signature: string | undefined,
) {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
    .update(rawBody)
    .digest("hex");

  if (!signature || hash !== signature) {
    throw new Error("Invalid signature");
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const { reference, amount, status, channel, fees } = event.data;
    await fulfillPayment({ reference, status, amount, channel, fees });
  }

  return { received: true };
}
