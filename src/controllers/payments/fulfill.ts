import prisma from "@/config/prisma";
import { toPesewas } from "@/helpers/money";

// Marks a Paystack payment as paid and does what that means: an order turns
// PAID and its stock is taken off; a sourcing request turns PAID.
//
// Called by both the webhook and the verify endpoint, often at the same
// moment, so it's safe to run more than once: the PENDING → PROCESSING
// claim below lets exactly one caller do the work. The other sees
// PROCESSING and the client waits it out (lib/paystackCheckout.ts).
export default async function fulfillPayment({
  reference,
  status,
  amount,
  channel,
  fees,
}: {
  reference: string;
  status: string;
  amount: number; // pesewas, as Paystack reports it
  channel?: string;
  fees?: number | null; // pesewas
}) {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) throw new Error("Unknown payment reference");
  if (payment.status === "SUCCESS" || payment.status === "PROCESSING") return payment;

  // "abandoned"/"ongoing": the customer hasn't finished paying yet — leave
  // it PENDING so a later attempt on the same reference still counts.
  if (status !== "success") {
    if (status === "failed") {
      return prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    }
    return payment;
  }

  if (amount < toPesewas(payment.amount)) {
    console.error("Paystack amount lower than expected", { reference, amount, expected: payment.amount });
    return prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
  }

  const claimed = await prisma.payment.updateMany({
    where: { reference, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "PROCESSING" },
  });
  if (claimed.count === 0) return prisma.payment.findUnique({ where: { reference } });

  try {
    const paidAt = new Date();

    if (payment.kind === "ORDER" && payment.orderId) {
      const order = await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID", paidAt },
      });
      // Stock was checked when checkout started; a sale in between can
      // still take it below zero — the admin sees that on the products page.
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    if (payment.kind === "REQUEST" && payment.requestId) {
      await prisma.sourcingRequest.update({
        where: { id: payment.requestId },
        data: { status: "PAID", paidAt },
      });
    }

    return prisma.payment.update({
      where: { reference },
      data: {
        status: "SUCCESS",
        paidAt,
        channel: channel || null,
        fees: fees != null ? fees / 100 : null,
      },
    });
  } catch (err) {
    // Hand it back so the webhook's retry (or a refresh) can finish it.
    await prisma.payment.update({ where: { reference }, data: { status: "PENDING" } });
    throw err;
  }
}
