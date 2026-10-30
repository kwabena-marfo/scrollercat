import prisma from "@/config/prisma";

// Admin: every product, hidden ones included.
export default async function listProducts() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { products, categories };
}
