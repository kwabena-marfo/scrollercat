import prisma from "@/config/prisma";
import sourcingRequestSchema from "@/schemas/sourcingRequest";
import upsertCustomer from "@/helpers/upsertCustomer";
import withUniqueCode from "@/helpers/withUniqueCode";
import { newRequestCode } from "@/helpers/codes";

// A visitor asks us to find something we don't stock. An admin then quotes
// it (controllers/requests/quote.ts) and the visitor pays from /track.
export default async function createRequest(body: unknown) {
  const data = sourcingRequestSchema.parse(body);
  const customer = await upsertCustomer(data);

  const request = await withUniqueCode(newRequestCode, (code) =>
    prisma.sourcingRequest.create({
      data: {
        code,
        customerId: customer.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: { ...data.address, country: "Ghana" },
        productName: data.productName,
        productUrl: data.productUrl || null,
        details: data.details || null,
        quantity: data.quantity,
        budget: data.budget ?? null,
      },
    }),
  );

  return { code: request.code, email: request.email };
}
