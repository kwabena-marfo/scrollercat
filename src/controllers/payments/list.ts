import prisma from "@/config/prisma";

// Admin: every Paystack transaction, newest first.
export default async function listPayments() {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      order: { select: { orderNumber: true, name: true } },
      request: { select: { code: true, name: true } },
    },
  });
}
