import prisma from "@/config/prisma";

const PAID_ORDER = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

// Every customer with what they've ordered, requested and spent.
export default async function listCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true, status: true } },
      requests: { select: { quoteTotal: true, paidAt: true } },
    },
  });

  return customers.map(({ orders, requests, ...customer }) => {
    const paidOrders = orders.filter((o) => (PAID_ORDER as readonly string[]).includes(o.status));
    const paidRequests = requests.filter((r) => r.paidAt);
    return {
      ...customer,
      orderCount: paidOrders.length,
      requestCount: requests.length,
      totalSpent:
        paidOrders.reduce((sum, o) => sum + o.total, 0) +
        paidRequests.reduce((sum, r) => sum + (r.quoteTotal || 0), 0),
    };
  });
}
