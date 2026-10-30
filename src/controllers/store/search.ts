import type { Prisma } from "@prisma/client";

import prisma from "@/config/prisma";
import { productCard } from "./home";

export const SORTS = ["relevance", "newest", "price-asc", "price-desc"] as const;
const PAGE_SIZE = 24;

const ORDER_BY: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  // No text index on MongoDB here, so "relevance" puts featured items first,
  // then the newest.
  relevance: [{ featured: "desc" }, { createdAt: "desc" }],
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
};

export default async function searchProducts({
  q,
  category,
  sort,
  page,
  inStock,
}: {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
  inStock?: string;
}) {
  const query = (q || "").trim().slice(0, 100);
  const pageNumber = Math.max(1, parseInt(page || "1", 10) || 1);

  const where: Prisma.ProductWhereInput = { active: true };

  // Every word has to appear in the name, description or category — so
  // "wireless mouse" doesn't return every mouse and every wireless thing.
  const words = query.split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length) {
    where.AND = words.map((word) => ({
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { description: { contains: word, mode: "insensitive" } },
        { category: { is: { name: { contains: word, mode: "insensitive" } } } },
      ],
    }));
  }

  if (category) where.category = { is: { slug: category } };
  if (inStock === "1") where.stock = { gt: 0 };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCard,
      orderBy: ORDER_BY[sort || ""] || ORDER_BY.relevance,
      skip: (pageNumber - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page: pageNumber,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
