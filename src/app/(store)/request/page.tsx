"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BsCheckCircleFill } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import axios from "@/config/axios";
import sourcingRequestSchema, { type SourcingRequestForm } from "@/schemas/sourcingRequest";

import ContactFields from "@/components/contactFields";
import FormField from "@/components/formField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function RequestForm() {
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState<{ code: string; email: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SourcingRequestForm>({
    resolver: zodResolver(sourcingRequestSchema),
    mode: "onTouched",
    defaultValues: { productName: searchParams?.get("product") || "", quantity: 1 },
  });

  const onSubmit: SubmitHandler<SourcingRequestForm> = async (form) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const { data } = await axios.post("/api/store/requests/create", form);
      setSent(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err?.response?.data || "We couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <BsCheckCircleFill className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-4 text-3xl font-black">Request received</h1>
        <p className="mt-3 text-muted-foreground">
          Your request code is <strong className="text-foreground">{sent.code}</strong>. We&apos;ll
          look for it and email a quote to <strong className="text-foreground">{sent.email}</strong>.
          You can pay the quote from the tracking page.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href={`/track?code=${sent.code}&email=${encodeURIComponent(sent.email)}`}>Track this request</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Back to the shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page">
      <div className="container max-w-3xl py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Shop-for-me</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Request a product</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us what you want, from anywhere. We&apos;ll find it and send you one price that covers
          the item, shipping to you and our fee. You only pay once you accept the quote.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">What are you looking for?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="productName" label="Product" required error={errors.productName?.message} className="sm:col-span-2">
                <Input
                  id="productName"
                  placeholder="e.g. Sony WH-1000XM5 headphones, black"
                  error={!!errors.productName}
                  {...register("productName")}
                />
              </FormField>
              <FormField
                id="productUrl"
                label="Link to the product"
                error={errors.productUrl?.message}
                hint="Amazon, AliExpress, Jumia, a brand's site… (optional)"
                className="sm:col-span-2"
              >
                <Input id="productUrl" type="url" placeholder="https://" error={!!errors.productUrl} {...register("productUrl")} />
              </FormField>
              <FormField id="details" label="Details" error={errors.details?.message} className="sm:col-span-2">
                <Textarea
                  id="details"
                  rows={4}
                  placeholder="Size, colour, model, anything that helps us find the right one"
                  {...register("details")}
                />
              </FormField>
              <FormField id="quantity" label="Quantity" required error={errors.quantity?.message}>
                <Input id="quantity" type="number" min={1} error={!!errors.quantity} {...register("quantity")} />
              </FormField>
              <FormField id="budget" label="Your budget (GHS)" error={errors.budget?.message} hint="Optional — helps us pick the right option.">
                <Input id="budget" type="number" min={0} step="0.01" error={!!errors.budget} {...register("budget")} />
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Where should we send it?</h2>
            <ContactFields register={register} control={control} errors={errors} />
          </section>

          <div className="flex flex-col items-center gap-3">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
              {submitting && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Sending…" : "Send request"}
            </Button>
            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            <p className="text-xs text-muted-foreground">Free to ask. No payment until you accept the quote.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={null}>
      <RequestForm />
    </Suspense>
  );
}
