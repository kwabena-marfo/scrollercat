import prisma from "@/config/prisma";

const NOT_FOUND = "We couldn't find an order or request with that code and email.";

// Public lookup for /track. Both the code and the email it was placed with
// are needed, so a guessed code alone reveals nothing. Only what the
// customer should see goes back — never admin notes.
export default async function track({ code, email }: { code?: string; email?: string }) {
  const cleanCode = (code || "").trim().toUpperCase();
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanCode || !cleanEmail) throw new Error("Enter your order code and email");

  if (cleanCode.startsWith("SC-")) {
    const order = await prisma.order.findUnique({ where: { orderNumber: cleanCode } });
    if (!order || order.email.toLowerCase() !== cleanEmail) throw new Error(NOT_FOUND);
    return {
      type: "ORDER" as const,
      code: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      shippingMethod: order.shippingMethod,
      address: order.address,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
    };
  }

  if (cleanCode.startsWith("RQ-")) {
    const request = await prisma.sourcingRequest.findUnique({ where: { code: cleanCode } });
    if (!request || request.email.toLowerCase() !== cleanEmail) throw new Error(NOT_FOUND);
    return {
      type: "REQUEST" as const,
      code: request.code,
      status: request.status,
      createdAt: request.createdAt,
      paidAt: request.paidAt,
      productName: request.productName,
      productUrl: request.productUrl,
      quantity: request.quantity,
      quoteItemCost: request.quoteItemCost,
      quoteShipping: request.quoteShipping,
      quoteServiceFee: request.quoteServiceFee,
      quoteTotal: request.quoteTotal,
      quoteNote: request.quoteNote,
      address: request.address,
      carrier: request.carrier,
      trackingNumber: request.trackingNumber,
    };
  }

  throw new Error(NOT_FOUND);
}
