import axios from "axios";

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function initializeTransaction(data: {
  email: string;
  amount: number; // pesewas
  reference: string;
  currency?: string;
  callback_url: string;
  metadata?: Record<string, any>;
}) {
  const res = await paystack.post("/transaction/initialize", {
    currency: "GHS",
    ...data,
  });

  return res.data?.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function verifyTransaction(reference: string) {
  const res = await paystack.get(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );

  return res.data?.data as {
    status: "success" | "failed" | "abandoned" | "ongoing" | "pending";
    reference: string;
    amount: number; // pesewas
    fees?: number | null; // pesewas
    channel?: string;
    customer: { email: string };
    metadata: Record<string, any>;
  };
}

// Paystack's own error text ("Invalid key", "Duplicate Transaction
// Reference"…) is far more useful than axios's "Request failed with status
// code 400".
export function paystackErrorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.message || fallback;
}

export default paystack;
