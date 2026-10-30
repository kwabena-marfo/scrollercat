import { z } from "zod";

import { contactFields, optionalNumber } from "./contact";

// The "we'll source it for you" form on /request.
const sourcingRequestSchema = z.object({
  productName: z.string().trim().min(2, { message: "Tell us what you're looking for" }),
  productUrl: z
    .string()
    .trim()
    .url({ message: "Paste a full link, starting with https://" })
    .optional()
    .or(z.literal("")),
  details: z.string().trim().max(2000).optional(),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .int()
    .min(1, { message: "At least 1" })
    .max(999),
  budget: optionalNumber,
  ...contactFields,
});

export type SourcingRequestForm = z.infer<typeof sourcingRequestSchema>;
export default sourcingRequestSchema;
