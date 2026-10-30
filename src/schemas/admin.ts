import { z } from "zod";

import { ORDER_STATUSES, REQUEST_STATUSES } from "@/data/statuses";
import { PRODUCT_CONDITIONS } from "@/data/conditions";
import { optionalNumber } from "./contact";

// Every admin form's schema, also used by the matching controller to check
// the request body.

const money = z.coerce
  .number({ invalid_type_error: "Enter an amount" })
  .nonnegative({ message: "Can't be negative" });

export const productSchema = z.object({
  name: z.string().trim().min(2, { message: "Required" }),
  description: z.string().trim().max(5000).optional(),
  condition: z.enum(PRODUCT_CONDITIONS).default("NEW"),
  price: money.positive({ message: "Enter a price" }),
  compareAtPrice: optionalNumber,
  stock: z.coerce.number({ invalid_type_error: "Enter a number" }).int().min(0),
  categoryId: z.string().optional(),
  // One image URL per line in the form.
  images: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
export type ProductForm = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, { message: "Required" }),
});

export const shippingMethodSchema = z.object({
  name: z.string().trim().min(2, { message: "Required" }),
  description: z.string().trim().max(300).optional(),
  fee: money,
  eta: z.string().trim().max(60).optional(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});
export type ShippingMethodForm = z.infer<typeof shippingMethodSchema>;

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type OrderUpdateForm = z.infer<typeof orderUpdateSchema>;

export const requestQuoteSchema = z.object({
  quoteItemCost: money,
  quoteShipping: money,
  quoteServiceFee: money,
  quoteNote: z.string().trim().max(1000).optional(),
});
export type RequestQuoteForm = z.infer<typeof requestQuoteSchema>;

export const requestUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  carrier: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});
export type RequestUpdateForm = z.infer<typeof requestUpdateSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Enter your password" }),
});
export type LoginForm = z.infer<typeof loginSchema>;
