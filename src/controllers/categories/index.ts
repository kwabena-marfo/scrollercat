import prisma from "@/config/prisma";
import slugify from "@/helpers/slugify";
import { categorySchema } from "@/schemas/admin";

export async function saveCategory({ id, body }: { id?: string; body: unknown }) {
  const { name } = categorySchema.parse(body);
  const slug = slugify(name);

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash && clash.id !== id) throw new Error(`There's already a "${clash.name}" category`);

  if (id) return prisma.category.update({ where: { id }, data: { name, slug } });
  return prisma.category.create({ data: { name, slug } });
}

// Its products stay, just uncategorised.
export async function removeCategory(id?: string) {
  if (!id) throw new Error("Missing category id");
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });
}
