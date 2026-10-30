import prisma from "@/config/prisma";
import { productCard } from "./home";

export default async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { ...productCard, description: true, categoryId: true },
  });
  if (!product) throw new Error("We couldn't find that product");

  const related = product.categoryId
    ? await prisma.product.findMany({
        where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
        select: productCard,
        take: 4,
      })
    : [];

  return { product, related };
}
