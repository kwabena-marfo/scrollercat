// Mirrors the ProductCondition enum in prisma/schema.prisma, with the labels
// and badge colours the store and admin show.

export const PRODUCT_CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;
export type ProductConditionValue = (typeof PRODUCT_CONDITIONS)[number];

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  USED: "Used",
  REFURBISHED: "Refurbished",
};

export const CONDITION_COLORS: Record<string, string> = {
  NEW: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  USED: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  REFURBISHED: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
};
