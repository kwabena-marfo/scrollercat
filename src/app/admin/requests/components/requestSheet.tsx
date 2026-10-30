"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuLoader2 } from "react-icons/lu";

import useTriggerRequest from "@/hooks/useTriggerRequest";
import {
  requestQuoteSchema,
  requestUpdateSchema,
  type RequestQuoteForm,
  type RequestUpdateForm,
} from "@/schemas/admin";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/data/statuses";
import { formatMoney, roundMoney } from "@/helpers/money";

import FormField from "@/components/formField";
import StatusBadge from "@/components/statusBadge";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RequestSheet({
  request,
  onClose,
  onSaved,
}: {
  request: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const canQuote = request && ["NEW", "QUOTED"].includes(request.status);

  return (
    <Sheet open={!!request} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        {request && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <span className="font-mono">{request.code}</span>
                <StatusBadge status={request.status} />
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Received {format(new Date(request.createdAt), "d MMM yyyy, HH:mm")}
              </p>
            </SheetHeader>

            <section className="mt-6 space-y-1 text-sm">
              <h3 className="font-bold">Wants</h3>
              <p className="text-base font-semibold">
                {request.productName} <span className="font-normal text-muted-foreground">× {request.quantity}</span>
              </p>
              {request.productUrl && (
                <a href={request.productUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-brand hover:underline">
                  {request.productUrl}
                </a>
              )}
              {request.details && <p className="whitespace-pre-line text-muted-foreground">{request.details}</p>}
              {request.budget && <p>Budget: {formatMoney(request.budget)}</p>}
            </section>

            <section className="mt-6 space-y-1 text-sm">
              <h3 className="font-bold">Customer</h3>
              <p>{request.name}</p>
              <p>
                <a href={`tel:${request.phone}`} className="text-brand hover:underline">{request.phone}</a> ·{" "}
                <a href={`mailto:${request.email}`} className="text-brand hover:underline">{request.email}</a>
              </p>
              <p className="text-muted-foreground">
                {request.address.line1}, {request.address.city}, {request.address.region}
                {request.address.landmark ? ` (${request.address.landmark})` : ""}
              </p>
            </section>

            {canQuote ? (
              <QuoteForm request={request} onSaved={onSaved} />
            ) : (
              request.quoteTotal && (
                <section className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
                  <h3 className="font-bold">Quote (paid {request.paidAt ? format(new Date(request.paidAt), "d MMM") : ""})</h3>
                  <p className="mt-1">
                    {formatMoney(request.quoteItemCost)} item + {formatMoney(request.quoteShipping)} shipping +{" "}
                    {formatMoney(request.quoteServiceFee)} fee = <strong>{formatMoney(request.quoteTotal)}</strong>
                  </p>
                </section>
              )
            )}

            <StatusForm request={request} onSaved={onSaved} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuoteForm({ request, onSaved }: { request: any; onSaved: () => void }) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RequestQuoteForm>({ resolver: zodResolver(requestQuoteSchema) });
  const { reqFunction, reqState, setReqState } = useTriggerRequest();

  useEffect(() => {
    reset({
      quoteItemCost: request.quoteItemCost ?? ("" as any),
      quoteShipping: request.quoteShipping ?? ("" as any),
      quoteServiceFee: request.quoteServiceFee ?? ("" as any),
      quoteNote: request.quoteNote || "",
    });
    setReqState(undefined);
  }, [request.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reqState?.data) {
      onSaved();
      toast({ title: reqState.data as string });
      setReqState(undefined);
    }
  }, [reqState?.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = roundMoney(
    (Number(watch("quoteItemCost")) || 0) + (Number(watch("quoteShipping")) || 0) + (Number(watch("quoteServiceFee")) || 0),
  );

  return (
    <form
      onSubmit={handleSubmit((data) =>
        reqFunction({ route: `/api/admin/requests/quote?id=${request.id}`, reqType: "post", data }),
      )}
      className="mt-6 space-y-4 border-t pt-6"
    >
      <div>
        <h3 className="font-bold">{request.status === "QUOTED" ? "Update the quote" : "Send a quote"}</h3>
        <p className="text-xs text-muted-foreground">
          The customer sees this on their tracking page and pays it there. Email them the tracking link.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="quoteItemCost" label="Item cost" error={errors.quoteItemCost?.message}>
          <Input id="quoteItemCost" type="number" step="0.01" min={0} error={!!errors.quoteItemCost} {...register("quoteItemCost")} />
        </FormField>
        <FormField id="quoteShipping" label="Shipping" error={errors.quoteShipping?.message}>
          <Input id="quoteShipping" type="number" step="0.01" min={0} error={!!errors.quoteShipping} {...register("quoteShipping")} />
        </FormField>
        <FormField id="quoteServiceFee" label="Service fee" error={errors.quoteServiceFee?.message}>
          <Input id="quoteServiceFee" type="number" step="0.01" min={0} error={!!errors.quoteServiceFee} {...register("quoteServiceFee")} />
        </FormField>
      </div>
      <FormField id="quoteNote" label="Note to the customer" hint="E.g. arrival estimate, colour we found.">
        <Textarea id="quoteNote" rows={3} {...register("quoteNote")} />
      </FormField>
      <div className="flex items-center justify-between rounded-lg bg-accent p-3 text-sm">
        <span>Customer pays</span>
        <strong className="text-lg">{formatMoney(total)}</strong>
      </div>
      <Button type="submit" className="w-full" disabled={reqState?.pending}>
        {reqState?.pending && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        {request.status === "QUOTED" ? "Update quote" : "Send quote"}
      </Button>
      {reqState?.error && <p className="text-center text-xs text-red-500">{reqState.error as string}</p>}
    </form>
  );
}

function StatusForm({ request, onSaved }: { request: any; onSaved: () => void }) {
  const { toast } = useToast();
  const { register, control, handleSubmit, reset } = useForm<RequestUpdateForm>({
    resolver: zodResolver(requestUpdateSchema),
  });
  const { reqFunction, reqState, setReqState } = useTriggerRequest();

  useEffect(() => {
    reset({
      status: request.status,
      carrier: request.carrier || "",
      trackingNumber: request.trackingNumber || "",
      adminNotes: request.adminNotes || "",
    });
    setReqState(undefined);
  }, [request.id, request.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reqState?.data) {
      onSaved();
      toast({ title: reqState.data as string });
      setReqState(undefined);
    }
  }, [reqState?.data]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      onSubmit={handleSubmit((data) =>
        reqFunction({ route: `/api/admin/requests/update?id=${request.id}`, reqType: "post", data }),
      )}
      className="mt-6 space-y-4 border-t pt-6"
    >
      <h3 className="font-bold">Progress</h3>
      <FormField id="request-status" label="Status">
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="request-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="request-carrier" label="Courier">
          <Input id="request-carrier" error={false} {...register("carrier")} />
        </FormField>
        <FormField id="request-tracking" label="Tracking number">
          <Input id="request-tracking" error={false} {...register("trackingNumber")} />
        </FormField>
      </div>
      <FormField id="adminNotes" label="Internal notes" hint="Supplier, order IDs… Only staff see these.">
        <Textarea id="adminNotes" rows={3} {...register("adminNotes")} />
      </FormField>
      <Button type="submit" variant="outline" className="w-full" disabled={reqState?.pending}>
        {reqState?.pending && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save progress
      </Button>
      {reqState?.error && <p className="text-center text-xs text-red-500">{reqState.error as string}</p>}
    </form>
  );
}
