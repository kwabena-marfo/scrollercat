import prisma from "@/config/prisma";
import { roundMoney } from "@/helpers/money";
import { requestQuoteSchema, requestUpdateSchema } from "@/schemas/admin";

export async function listRequests() {
  return prisma.sourcingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
}

// Prices the request. The customer sees the quote on /track and pays it
// there (controllers/payments/initialize.ts → payForRequest).
export async function quoteRequest({ id, body }: { id?: string; body: unknown }) {
  if (!id) throw new Error("Missing request id");
  const data = requestQuoteSchema.parse(body);

  const request = await prisma.sourcingRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Request not found");
  if (!["NEW", "QUOTED"].includes(request.status)) {
    throw new Error("This request has already been paid for, so its quote can't change.");
  }

  const quoteTotal = roundMoney(data.quoteItemCost + data.quoteShipping + data.quoteServiceFee);
  if (quoteTotal <= 0) throw new Error("The quote total must be more than zero");

  return prisma.sourcingRequest.update({
    where: { id },
    data: {
      ...data,
      quoteNote: data.quoteNote || null,
      quoteTotal,
      quotedAt: new Date(),
      status: "QUOTED",
    },
  });
}

export async function updateRequest({ id, body }: { id?: string; body: unknown }) {
  if (!id) throw new Error("Missing request id");
  const data = requestUpdateSchema.parse(body);

  const request = await prisma.sourcingRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Request not found");

  // PAID only comes from Paystack; QUOTED only from sending a quote.
  const unpaid = ["NEW", "QUOTED"].includes(request.status);
  if (unpaid && !["NEW", "QUOTED", "CANCELLED"].includes(data.status)) {
    throw new Error("This request hasn't been paid yet. Send a quote, or cancel it.");
  }
  if (data.status === "QUOTED" && !request.quoteTotal) {
    throw new Error("Send a quote first.");
  }

  return prisma.sourcingRequest.update({
    where: { id },
    data: {
      status: data.status,
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      adminNotes: data.adminNotes || null,
    },
  });
}
