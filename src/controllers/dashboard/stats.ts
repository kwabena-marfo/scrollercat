import { format, startOfDay, subDays } from "date-fns";

import prisma from "@/config/prisma";

const LOW_STOCK = 5;
const DAYS = 30;

export default async function getDashboardStats() {
  const since = startOfDay(subDays(new Date(), DAYS - 1));

  const [payments, toShip, newRequests, lowStock, recentOrders, customerCount] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS", paidAt: { gte: since } },
      select: { amount: true, paidAt: true, kind: true },
    }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.sourcingRequest.count({ where: { status: { in: ["NEW", "PAID"] } } }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: LOW_STOCK } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    prisma.order.findMany({
      where: { status: { not: "PENDING_PAYMENT" } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, orderNumber: true, name: true, total: true, status: true, createdAt: true },
    }),
    prisma.customer.count(),
  ]);

  // One point per day, zero-filled, split by where the money came from.
  const byDay = new Map<string, { date: string; orders: number; requests: number }>();
  for (let i = 0; i < DAYS; i++) {
    const date = format(subDays(new Date(), DAYS - 1 - i), "yyyy-MM-dd");
    byDay.set(date, { date, orders: 0, requests: 0 });
  }
  for (const p of payments) {
    const day = byDay.get(format(p.paidAt!, "yyyy-MM-dd"));
    if (!day) continue;
    if (p.kind === "ORDER") day.orders += p.amount;
    else day.requests += p.amount;
  }

  return {
    revenue: payments.reduce((sum, p) => sum + p.amount, 0),
    paidCount: payments.length,
    toShip,
    newRequests,
    customerCount,
    lowStock,
    recentOrders,
    revenueByDay: Array.from(byDay.values()),
  };
}
