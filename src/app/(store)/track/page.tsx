"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { BsBoxSeam } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import useApi from "@/hooks/useApi";
import FormField from "@/components/formField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TrackResult from "./components/trackResult";

function Track() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code") || "";
  const email = searchParams?.get("email") || "";

  const [form, setForm] = useState({ code, email });

  // The lookup follows the URL, so a tracking link can be bookmarked or
  // sent in an email.
  const url =
    code && email
      ? `/api/store/track?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`
      : null;
  const { data, error, isLoading, mutate } = useApi(url);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ code: form.code.trim().toUpperCase(), email: form.email.trim() });
    router.push(`${pathname}?${params}`);
  };

  return (
    <div className="bg-page min-h-[70vh]">
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-black">Track an order or request</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the code from your confirmation (it starts with SC- for orders or RQ- for requests)
          and the email you used.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <FormField id="code" label="Code">
            <Input
              id="code"
              required
              placeholder="SC-XXXXXX"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              error={false}
            />
          </FormField>
          <FormField id="track-email" label="Email">
            <Input
              id="track-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={false}
            />
          </FormField>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Track
          </Button>
        </form>

        <div className="mt-8">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</p>}
          {isLoading && (
            <div className="flex justify-center py-12">
              <LuLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {data && <TrackResult data={data} email={email} onChange={() => mutate()} />}
          {!url && (
            <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
              <BsBoxSeam className="h-10 w-10" />
              <p className="mt-3 text-sm">Your order details will show here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <Track />
    </Suspense>
  );
}
