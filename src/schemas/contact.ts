import { z } from "zod";

// The name / email / phone / address block shared by checkout and sourcing
// requests.

export const addressSchema = z.object({
  line1: z.string().trim().min(3, { message: "Enter your street address or GPS address" }),
  city: z.string().trim().min(2, { message: "Enter your town or city" }),
  region: z.string().trim().min(1, { message: "Choose your region" }),
  landmark: z.string().trim().max(200).optional(),
});

export const contactFields = {
  name: z.string().trim().min(2, { message: "Enter your full name" }),
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{8,15}$/, { message: "Enter a valid phone number" }),
  address: addressSchema,
};

// "" from an empty number field → undefined, anything else → a number.
export const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number({ invalid_type_error: "Enter a number" }).nonnegative().optional(),
);
