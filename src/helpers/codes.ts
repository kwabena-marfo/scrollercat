import crypto from "crypto";

// No 0/O, 1/I/L — customers read these codes out over the phone.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length: number) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

// SC-7KX2QM: an order. RQ-…: a sourcing request. Collisions are caught by the
// unique index; 31^6 ≈ 887M makes them vanishingly rare.
export const newOrderNumber = () => `SC-${randomCode(6)}`;
export const newRequestCode = () => `RQ-${randomCode(6)}`;

// Paystack references must be unique per transaction — a request or order
// paid on a second attempt gets a fresh one.
export const newPaymentReference = (code: string) => `${code}-${randomCode(4)}`;
