import prisma from "@/config/prisma";

const productCard = {
  id: true,
  name: true,
  slug: true,
  condition: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  images: true,
  category: { select: { name: true, slug: true } },
} as const;

export { productCard };

// Everything the landing page needs in one call.
export default async function getHome() {
  const [featured, newArrivals, categories, shippingMethods] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      select: productCard,
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { active: true },
      select: productCard,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getCategories(),
    prisma.shippingMethod.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, description: true, fee: true, eta: true },
    }),
  ]);

  return { featured, newArrivals, categories, shippingMethods };
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: { where: { active: true } } } },
    },
  });
  return categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }));
}
