import { z } from "zod";

import { contactFields } from "./contact";

// The form on /checkout.
const checkoutSchema = z.object({
  ...contactFields,
  shippingMethodId: z.string().min(1, { message: "Choose a delivery option" }),
});

export const checkoutItemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1, { message: "Your cart is empty" });

export type CheckoutForm = z.infer<typeof checkoutSchema>;
export default checkoutSchema;
