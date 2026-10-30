import prisma from "@/config/prisma";
import checkoutSchema, { checkoutItemsSchema } from "@/schemas/checkout";
import upsertCustomer from "@/helpers/upsertCustomer";
import withUniqueCode from "@/helpers/withUniqueCode";
import { newOrderNumber, newPaymentReference } from "@/helpers/codes";
import { roundMoney, toPesewas } from "@/helpers/money";
import { initializeTransaction, paystackErrorMessage } from "@/lib/paystack";

type Started = {
  reference: string;
  accessCode: string;
  authorizationUrl: string;
  code: string;
};

// Two things can be paid for:
//   { kind: "ORDER", items, ...checkout form }  — a cart from the catalogue
//   { kind: "REQUEST", code, email }            — a quoted sourcing request
// The amount always comes from the database, never from the browser.
export default async function initializePayment({
  body,
  origin,
}: {
  body: any;
  origin: string;
}): Promise<Started> {
  const callbackUrl = `${origin}/payment/callback`;

  if (body?.kind === "REQUEST") return payForRequest(body, callbackUrl);
  return payForOrder(body, callbackUrl);
}

async function payForOrder(body: any, callbackUrl: string): Promise<Started> {
  const form = checkoutSchema.parse(body);
  const items = checkoutItemsSchema.parse(body?.items);

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });

  const lines = items.map(({ productId, quantity }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("An item in your cart is no longer available. Please remove it and try again.");
    if (product.stock < quantity) {
      throw new Error(
        product.stock > 0
          ? `Only ${product.stock} of "${product.name}" left — please lower the quantity.`
          : `"${product.name}" just sold out — please remove it from your cart.`,
      );
    }
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || null,
      price: product.price,
      quantity,
    };
  });

  const shipping = await prisma.shippingMethod.findFirst({
    where: { id: form.shippingMethodId, active: true },
  });
  if (!shipping) throw new Error("That delivery option isn't available any more. Please choose another.");

  const subtotal = roundMoney(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const total = roundMoney(subtotal + shipping.fee);

  const customer = await upsertCustomer(form);

  const order = await withUniqueCode(newOrderNumber, (orderNumber) =>
    prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: { ...form.address, country: "Ghana" },
        items: lines,
        subtotal,
        shippingFee: shipping.fee,
        total,
        shippingMethod: shipping.name,
      },
    }),
  );

  return startTransaction({
    kind: "ORDER",
    code: order.orderNumber,
    email: order.email,
    amount: total,
    link: { orderId: order.id },
    callbackUrl,
  });
}

async function payForRequest(body: any, callbackUrl: string): Promise<Started> {
  const code = String(body?.code || "").trim().toUpperCase();
  const email = String(body?.email || "").trim().toLowerCase();

  const request = await prisma.sourcingRequest.findUnique({ where: { code } });
  if (!request || request.email.toLowerCase() !== email) {
    throw new Error("We couldn't find that request.");
  }
  if (request.status !== "QUOTED" || !request.quoteTotal) {
    throw new Error(
      request.status === "NEW"
        ? "We're still preparing your quote — we'll email you when it's ready."
        : "This request has already been paid for.",
    );
  }

  return startTransaction({
    kind: "REQUEST",
    code: request.code,
    email: request.email,
    amount: request.quoteTotal,
    link: { requestId: request.id },
    callbackUrl,
  });
}

async function startTransaction({
  kind,
  code,
  email,
  amount,
  link,
  callbackUrl,
}: {
  kind: "ORDER" | "REQUEST";
  code: string;
  email: string;
  amount: number;
  link: { orderId: string } | { requestId: string };
  callbackUrl: string;
}): Promise<Started> {
  const reference = newPaymentReference(code);

  await prisma.payment.create({
    data: { reference, kind, email, amount, ...link },
  });

  try {
    const tx = await initializeTransaction({
      email,
      amount: toPesewas(amount),
      reference,
      callback_url: callbackUrl,
      metadata: { kind, code },
    });
    return {
      reference,
      accessCode: tx.access_code,
      authorizationUrl: tx.authorization_url,
      code,
    };
  } catch (err) {
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    throw new Error(paystackErrorMessage(err, "We couldn't start the payment. Please try again."));
  }
}
