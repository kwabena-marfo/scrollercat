import prisma from "@/config/prisma";
import { orderUpdateSchema } from "@/schemas/admin";

export async function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
}

// Status, courier and tracking number — what the customer sees on /track.
export async function updateOrder({ id, body }: { id?: string; body: unknown }) {
  if (!id) throw new Error("Missing order id");
  const data = orderUpdateSchema.parse(body);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found");

  // Only Paystack (controllers/payments/fulfill.ts) moves an order out of
  // "awaiting payment" into a paid state — an admin can only cancel it.
  if (
    order.status === "PENDING_PAYMENT" &&
    !["PENDING_PAYMENT", "CANCELLED"].includes(data.status)
  ) {
    throw new Error("This order hasn't been paid yet. It can only be cancelled.");
  }

  return prisma.order.update({
    where: { id },
    data: {
      status: data.status,
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      notes: data.notes || null,
    },
  });
}
