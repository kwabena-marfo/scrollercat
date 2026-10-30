"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BsLock } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import axios from "@/config/axios";
import useCart from "@/hooks/useCart";
import useApi from "@/hooks/useApi";
import checkoutSchema, { type CheckoutForm } from "@/schemas/checkout";
import { openPaystackCheckout, preloadPaystack } from "@/lib/paystackCheckout";
import { formatMoney, roundMoney } from "@/helpers/money";
import { cn } from "@/lib/utils";

import ContactFields from "@/components/contactFields";
import { ProductImage } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type ShippingMethod = { id: string; name: string; description: string; fee: number; eta: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { ready, items, subtotal } = useCart();
  const { data: methods } = useApi<ShippingMethod[]>("/api/store/shipping-methods");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema), mode: "onTouched" });

  useEffect(() => preloadPaystack(), []);

  // Pre-select the first (cheapest by sort order) delivery option.
  useEffect(() => {
    if (methods?.length && !watch("shippingMethodId")) setValue("shippingMethodId", methods[0].id);
  }, [methods]); // eslint-disable-line react-hooks/exhaustive-deps

  const shipping = methods?.find((m) => m.id === watch("shippingMethodId"));
  const total = roundMoney(subtotal + (shipping?.fee || 0));

  const onSubmit: SubmitHandler<CheckoutForm> = async (form) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const { data } = await axios.post("/api/payments/initialize", {
        ...form,
        kind: "ORDER",
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      await openPaystackCheckout({
        accessCode: data.accessCode,
        authorizationUrl: data.authorizationUrl,
        onSuccess: (reference) => router.push(`/payment/callback?reference=${encodeURIComponent(reference)}`),
        onCancel: () => {
          setSubmitting(false);
          toast({ title: "Payment cancelled", description: "Your cart is still here whenever you're ready." });
        },
      });
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err?.response?.data || "We couldn't start the payment. Please try again.");
    }
  };

  if (!ready) return <div className="container min-h-[50vh] py-10" />;

  if (!items.length) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-black">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-page">
      <form onSubmit={handleSubmit(onSubmit)} className="container grid gap-8 py-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <h1 className="text-3xl font-black">Checkout</h1>

          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Contact &amp; delivery address</h2>
            <ContactFields register={register} control={control} errors={errors} />
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Delivery option</h2>
            <Controller
              control={control}
              name="shippingMethodId"
              render={({ field }) => (
                <div role="radiogroup" className="grid gap-3">
                  {(methods || []).map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                        field.value === m.id ? "border-primary bg-accent" : "hover:border-foreground/30",
                      )}
                    >
                      <input
                        type="radio"
                        className="mt-1 accent-[hsl(var(--primary))]"
                        checked={field.value === m.id}
                        onChange={() => field.onChange(m.id)}
                        name="shippingMethodId"
                      />
                      <span className="flex-1">
                        <span className="flex justify-between gap-4 font-semibold">
                          {m.name}
                          <span>{m.fee ? formatMoney(m.fee) : "Free"}</span>
                        </span>
                        {m.eta && <span className="block text-sm text-brand">{m.eta}</span>}
                        {m.description && <span className="block text-sm text-muted-foreground">{m.description}</span>}
                      </span>
                    </label>
                  ))}
                  {methods && !methods.length && (
                    <p className="text-sm text-muted-foreground">
                      No delivery options are set up yet. Please contact us to order.
                    </p>
                  )}
                </div>
              )}
            />
            {errors.shippingMethodId && (
              <p className="mt-2 text-xs text-red-500">{errors.shippingMethodId.message}</p>
            )}
          </section>
        </div>

        {/* SUMMARY */}
        <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 text-sm">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                  <ProductImage src={i.image || undefined} alt={i.name} />
                </span>
                <span className="flex-1">
                  <span className="line-clamp-1 font-medium">{i.name}</span>
                  <span className="text-muted-foreground">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatMoney(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shipping ? (shipping.fee ? formatMoney(shipping.fee) : "Free") : "—"}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting || !methods?.length}>
            {submitting ? <LuLoader2 className="mr-2 h-4 w-4 animate-spin" /> : <BsLock className="mr-2" />}
            {submitting ? "Opening checkout…" : `Pay ${formatMoney(total)}`}
          </Button>
          {errorMsg && <p className="mt-3 text-center text-sm text-red-500">{errorMsg}</p>}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mobile money or card, secured by Paystack.
          </p>
        </aside>
      </form>
    </div>
  );
}
