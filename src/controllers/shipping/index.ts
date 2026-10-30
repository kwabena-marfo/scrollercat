import prisma from "@/config/prisma";
import { shippingMethodSchema } from "@/schemas/admin";

export async function listShippingMethods() {
  return prisma.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function saveShippingMethod({ id, body }: { id?: string; body: unknown }) {
  const data = shippingMethodSchema.parse(body);
  const fields = {
    ...data,
    description: data.description || "",
    eta: data.eta || "",
  };
  if (id) return prisma.shippingMethod.update({ where: { id }, data: fields });
  return prisma.shippingMethod.create({ data: fields });
}

// Past orders store the method's name, not a link, so this is always safe.
export async function removeShippingMethod(id?: string) {
  if (!id) throw new Error("Missing shipping method id");
  await prisma.shippingMethod.delete({ where: { id } });
}
