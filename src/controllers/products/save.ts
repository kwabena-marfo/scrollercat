import prisma from "@/config/prisma";
import slugify from "@/helpers/slugify";
import { productSchema } from "@/schemas/admin";

// Create (no id) or update (id) a product.
export default async function saveProduct({ id, body }: { id?: string; body: unknown }) {
  const data = productSchema.parse(body);

  const images = (data.images || "")
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

  const fields = {
    name: data.name,
    description: data.description || "",
    condition: data.condition,
    price: data.price,
    compareAtPrice: data.compareAtPrice ?? null,
    stock: data.stock,
    categoryId: data.categoryId || null,
    images,
    featured: data.featured,
    active: data.active,
  };

  if (id) {
    return prisma.product.update({ where: { id }, data: fields });
  }

  return prisma.product.create({
    data: { ...fields, slug: await uniqueSlug(data.name) },
  });
}

// "usb-c-cable", then "usb-c-cable-2"… The slug stays put on later edits so
// shared product links keep working.
async function uniqueSlug(name: string) {
  const base = slugify(name) || "product";
  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug } }); n++) {
    slug = `${base}-${n}`;
  }
  return slug;
}
