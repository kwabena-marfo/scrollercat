"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BsCheckCircleFill, BsClock, BsXCircleFill } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import { confirmPayment } from "@/lib/paystackCheckout";
import useCart from "@/hooks/useCart";
import { clearCart } from "@/store/cartSlice";
import { formatMoney } from "@/helpers/money";
import { Button } from "@/components/ui/button";

// Where checkout lands after the popup succeeds — and where Paystack's own
// hosted page redirects back to (?reference=…&trxref=…).
function Callback() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get("reference") || searchParams?.get("trxref") || "";
  const { dispatch } = useCart();
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!reference) return;
    confirmPayment(reference)
      .then((data) => {
        setResult(data);
        if (data?.status === "SUCCESS" && data.kind === "ORDER") dispatch(clearCart());
      })
      .catch((err) => setErrorMsg(err?.response?.data || "We couldn't confirm your payment."));
  }, [reference, dispatch]);

  if (!reference) {
    return <Message icon={<BsXCircleFill className="text-red-500" />} title="No payment to confirm" />;
  }

  if (errorMsg) {
    return (
      <Message icon={<BsXCircleFill className="text-red-500" />} title="Something went wrong" text={errorMsg}>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </Message>
    );
  }

  if (!result) {
    return <Message icon={<LuLoader2 className="animate-spin text-muted-foreground" />} title="Confirming your payment…" />;
  }

  const trackHref = result.code
    ? `/track?code=${result.code}&email=${encodeURIComponent(result.email || "")}`
    : "/track";

  if (result.status === "SUCCESS") {
    return (
      <Message
        icon={<BsCheckCircleFill className="text-green-500" />}
        title={result.kind === "ORDER" ? "Thank you! Your order is confirmed" : "Paid! We're sourcing your item"}
        text={`We received ${formatMoney(result.amount)}. Your ${result.kind === "ORDER" ? "order" : "request"} code is ${result.code}. Keep it to track your delivery.`}
      >
        <Button asChild>
          <Link href={trackHref}>Track it</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </Message>
    );
  }

  if (result.status === "PROCESSING" || result.status === "PENDING") {
    return (
      <Message
        icon={<BsClock className="text-amber-500" />}
        title="Payment still processing"
        text="Mobile money approvals can take a minute. Refresh this page shortly. You won't be charged twice."
      >
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </Message>
    );
  }

  return (
    <Message
      icon={<BsXCircleFill className="text-red-500" />}
      title="Payment didn't go through"
      text="No money was taken. You can try again."
    >
      <Button asChild>
        <Link href={result.kind === "ORDER" ? "/checkout" : trackHref}>Try again</Link>
      </Button>
    </Message>
  );
}

function Message({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="container flex max-w-lg flex-col items-center py-24 text-center">
      <div className="text-5xl">{icon}</div>
      <h1 className="mt-5 text-2xl font-black">{title}</h1>
      {text && <p className="mt-2 text-muted-foreground">{text}</p>}
      {children && <div className="mt-8 flex gap-3">{children}</div>}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
