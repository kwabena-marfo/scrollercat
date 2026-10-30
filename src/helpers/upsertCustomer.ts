import prisma from "@/config/prisma";

type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  address: { line1: string; city: string; region: string; landmark?: string };
};

// Shoppers don't have accounts — they're matched by email. The latest
// checkout or request updates the name, phone and address on file.
export default async function upsertCustomer({ name, email, phone, address }: CustomerDetails) {
  const data = { name, phone, address: { ...address, country: "Ghana" } };
  return prisma.customer.upsert({
    where: { email: email.toLowerCase() },
    update: data,
    create: { ...data, email: email.toLowerCase() },
  });
}
