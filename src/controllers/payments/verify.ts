import prisma from "@/config/prisma";
import { verifyTransaction } from "@/lib/paystack";
import fulfillPayment from "./fulfill";

// Hit by /payment/callback right after checkout, in case the webhook hasn't
// landed yet. Public (anyone holding the reference), so only what that page
// needs goes back.
export default async function verifyPayment(reference: string) {
  if (!reference) throw new Error("Missing reference");

  const existing = await prisma.payment.findUnique({ where: { reference } });
  if (!existing) throw new Error("We couldn't find that payment.");

  if (existing.status !== "SUCCESS") {
    const tx = await verifyTransaction(reference);
    await fulfillPayment({
      reference,
      status: tx.status,
      amount: tx.amount,
      channel: tx.channel,
      fees: tx.fees,
    });
  }

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      order: { select: { orderNumber: true } },
      request: { select: { code: true } },
    },
  });

  return {
    reference,
    status: payment!.status,
    kind: payment!.kind,
    amount: payment!.amount,
    email: payment!.email,
    code: payment!.order?.orderNumber || payment!.request?.code || null,
  };
}
