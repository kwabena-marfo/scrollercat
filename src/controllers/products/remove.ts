import prisma from "@/config/prisma";

// Orders keep their own copy of each item (OrderItem), so deleting a
// product never changes past orders. Hiding it (active: false) is usually
// the better choice — this is for mistakes.
export default async function removeProduct(id?: string) {
  if (!id) throw new Error("Missing product id");
  await prisma.product.delete({ where: { id } });
}
