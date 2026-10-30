"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { format } from "date-fns";
import { BsCheck, BsLock } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import axios from "@/config/axios";
import { openPaystackCheckout, preloadPaystack } from "@/lib/paystackCheckout";
import { formatMoney } from "@/helpers/money";
import { ORDER_TIMELINE, REQUEST_TIMELINE, STATUS_LABELS } from "@/data/statuses";
import { cn } from "@/lib/utils";

import StatusBadge from "@/components/statusBadge";
import { ProductImage } from "@/components/productCard";
import { Button } from "@/components/ui/button";

export default function TrackResult({ data, email, onChange }: { data: any; email: string; onChange: () => void }) {
  const isOrder = data.type === "ORDER";
  const steps: string[] = isOrder ? ORDER_TIMELINE : REQUEST_TIMELINE;
  const current = steps.indexOf(data.status);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{isOrder ? "Order" : "Sourcing request"}</p>
            <h2 className="text-2xl font-black">{data.code}</h2>
            <p className="text-sm text-muted-foreground">Placed {format(new Date(data.createdAt), "d MMM yyyy")}</p>
          </div>
          <StatusBadge status={data.status} className="text-sm" />
        </div>

        {/* TIMELINE */}
        {data.status !== "CANCELLED" && data.status !== "PENDING_PAYMENT" && (
          <ol className="mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((step, i) => (
              <li key={step} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                    i < current && "border-primary bg-primary text-primary-foreground",
                    i === current && "border-primary text-primary",
                    i > current && "text-muted-foreground",
                  )}
                >
                  {i < current ? <BsCheck className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("text-[11px] leading-tight sm:text-xs", i <= current ? "font-semibold" : "text-muted-foreground")}>
                  {STATUS_LABELS[step]}
                </span>
              </li>
            ))}
          </ol>
        )}

        {data.status === "PENDING_PAYMENT" && (
          <p className="mt-4 rounded-lg bg-muted p-3 text-sm">
            We haven&apos;t received payment for this order. If you were charged, contact us with your
            order code.
          </p>
        )}

        {data.trackingNumber && (
          <p className="mt-6 rounded-lg bg-accent p-3 text-sm">
            Shipped{data.carrier ? ` with ${data.carrier}` : ""}. Tracking number:{" "}
            <strong className="font-mono">{data.trackingNumber}</strong>
          </p>
        )}
      </div>

      {isOrder ? <OrderDetails data={data} /> : <RequestDetails data={data} email={email} onChange={onChange} />}

      <div className="rounded-xl border bg-card p-5 text-sm">
        <h3 className="font-bold">Delivery address</h3>
        <p className="mt-2 text-muted-foreground">
          {data.address.line1}, {data.address.city}, {data.address.region}
          {data.address.landmark ? ` (${data.address.landmark})` : ""}
        </p>
      </div>
    </div>
  );
}

function OrderDetails({ data }: { data: any }) {
  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <h3 className="font-bold">Items</h3>
      <ul className="mt-4 space-y-3">
        {data.items.map((item: any) => (
          <li key={item.productId} className="flex items-center gap-3 text-sm">
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md border">
              <ProductImage src={item.image || undefined} alt={item.name} />
            </span>
            <span className="flex-1">
              {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="font-semibold">{formatMoney(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
        <Row label="Subtotal" value={formatMoney(data.subtotal)} />
        <Row label={`Delivery (${data.shippingMethod})`} value={formatMoney(data.shippingFee)} />
        <Row label="Total" value={formatMoney(data.total)} bold />
      </dl>
    </div>
  );
}

function RequestDetails({ data, email, onChange }: { data: any; email: string; onChange: () => void }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const canPay = data.status === "QUOTED" && data.quoteTotal;

  useEffect(() => {
    if (canPay) preloadPaystack();
  }, [canPay]);

  const pay = async () => {
    setPaying(true);
    setErrorMsg("");
    try {
      const { data: tx } = await axios.post("/api/payments/initialize", { kind: "REQUEST", code: data.code, email });
      await openPaystackCheckout({
        accessCode: tx.accessCode,
        authorizationUrl: tx.authorizationUrl,
        onSuccess: (reference) => router.push(`/payment/callback?reference=${encodeURIComponent(reference)}`),
        onCancel: () => {
          setPaying(false);
          onChange();
        },
      });
    } catch (err: any) {
      setPaying(false);
      setErrorMsg(err?.response?.data || "We couldn't start the payment. Please try again.");
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 sm:p-6">
      <h3 className="font-bold">What you asked for</h3>
      <p className="mt-2">
        {data.productName} <span className="text-muted-foreground">× {data.quantity}</span>
      </p>
      {data.productUrl && (
        <a href={data.productUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-sm text-brand hover:underline">
          {data.productUrl}
        </a>
      )}

      {data.quoteTotal ? (
        <div className="mt-6 rounded-lg border bg-muted/40 p-4">
          <h4 className="font-bold">Your quote</h4>
          <dl className="mt-3 space-y-1 text-sm">
            <Row label="Item cost" value={formatMoney(data.quoteItemCost)} />
            <Row label="Shipping to you" value={formatMoney(data.quoteShipping)} />
            <Row label="Service fee" value={formatMoney(data.quoteServiceFee)} />
            <Row label="Total" value={formatMoney(data.quoteTotal)} bold />
          </dl>
          {data.quoteNote && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{data.quoteNote}</p>}

          {canPay && (
            <>
              <Button className="mt-4 w-full" size="lg" onClick={pay} disabled={paying}>
                {paying ? <LuLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <BsLock className="mr-2" />}
                Accept &amp; pay {formatMoney(data.quoteTotal)}
              </Button>
              {errorMsg && <p className="mt-2 text-center text-sm text-red-500">{errorMsg}</p>}
            </>
          )}
        </div>
      ) : (
        data.status === "NEW" && (
          <p className="mt-6 rounded-lg bg-muted p-3 text-sm">
            We&apos;re looking for this now. Your quote will appear here, and we&apos;ll email you when
            it&apos;s ready.
          </p>
        )
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", bold && "border-t pt-2 text-base font-bold")}>
      <dt className={bold ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
