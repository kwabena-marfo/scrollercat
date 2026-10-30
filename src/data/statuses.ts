// Mirrors the OrderStatus / RequestStatus enums in prisma/schema.prisma,
// with the labels and badge colours the store and admin show.

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const REQUEST_STATUSES = [
  "NEW",
  "QUOTED",
  "PAID",
  "SOURCING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type RequestStatusValue = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  NEW: "New",
  QUOTED: "Quoted",
  SOURCING: "Sourcing",
  // Payments
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  NEW: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  QUOTED: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  SOURCING: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  CANCELLED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
};

// The steps a customer sees on the tracking page, in order.
export const ORDER_TIMELINE: OrderStatusValue[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
export const REQUEST_TIMELINE: RequestStatusValue[] = [
  "NEW",
  "QUOTED",
  "PAID",
  "SOURCING",
  "SHIPPED",
  "DELIVERED",
];
