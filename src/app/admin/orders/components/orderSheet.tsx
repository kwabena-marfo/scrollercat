"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuLoader2 } from "react-icons/lu";

import useTriggerRequest from "@/hooks/useTriggerRequest";
import { orderUpdateSchema, type OrderUpdateForm } from "@/schemas/admin";
import { ORDER_STATUSES, STATUS_LABELS } from "@/data/statuses";
import { formatMoney } from "@/helpers/money";

import FormField from "@/components/formField";
import StatusBadge from "@/components/statusBadge";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderSheet({
  order,
  onClose,
  onSaved,
}: {
  order: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const { register, control, handleSubmit, reset } = useForm<OrderUpdateForm>({
    resolver: zodResolver(orderUpdateSchema),
  });
  const { reqFunction: saveOrder, reqState, setReqState } = useTriggerRequest();

  useEffect(() => {
    if (order) {
      reset({
        status: order.status,
        carrier: order.carrier || "",
        trackingNumber: order.trackingNumber || "",
        notes: order.notes || "",
      });
      setReqState(undefined);
    }
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reqState?.data) {
      onSaved();
      toast({ title: reqState.data as string });
      setReqState(undefined);
      onClose();
    }
  }, [reqState?.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: OrderUpdateForm) =>
    saveOrder({ route: `/api/admin/orders/update?id=${order.id}`, reqType: "post", data });

  return (
    <Sheet open={!!order} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        {order && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <span className="font-mono">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                Placed {format(new Date(order.createdAt), "d MMM yyyy, HH:mm")}
                {order.paidAt && ` · paid ${format(new Date(order.paidAt), "d MMM, HH:mm")}`}
              </p>
            </SheetHeader>

            <section className="mt-6 space-y-1 text-sm">
              <h3 className="font-bold">Customer</h3>
              <p>{order.name}</p>
              <p>
                <a href={`tel:${order.phone}`} className="text-brand hover:underline">{order.phone}</a> ·{" "}
                <a href={`mailto:${order.email}`} className="text-brand hover:underline">{order.email}</a>
              </p>
              <p className="text-muted-foreground">
                {order.address.line1}, {order.address.city}, {order.address.region}
                {order.address.landmark ? ` (${order.address.landmark})` : ""}
              </p>
            </section>

            <section className="mt-6 text-sm">
              <h3 className="font-bold">Items</h3>
              <ul className="mt-2 divide-y rounded-lg border">
                {order.items.map((i: any) => (
                  <li key={i.productId} className="flex justify-between gap-3 p-3">
                    <span>
                      {i.name} <span className="text-muted-foreground">× {i.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatMoney(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery ({order.shippingMethod})</dt>
                  <dd>{formatMoney(order.shippingFee)}</dd>
                </div>
                <div className="flex justify-between font-bold">
                  <dt>Total</dt>
                  <dd>{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </section>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 border-t pt-6">
              <h3 className="font-bold">Update delivery</h3>
              <FormField id="status" label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
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
                <FormField id="carrier" label="Courier">
                  <Input id="carrier" placeholder="e.g. Yango, DHL" error={false} {...register("carrier")} />
                </FormField>
                <FormField id="trackingNumber" label="Tracking number">
                  <Input id="trackingNumber" error={false} {...register("trackingNumber")} />
                </FormField>
              </div>
              <FormField id="notes" label="Internal notes" hint="Only staff see these.">
                <Textarea id="notes" rows={3} {...register("notes")} />
              </FormField>

              <Button type="submit" className="w-full" disabled={reqState?.pending}>
                {reqState?.pending && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              {reqState?.error && <p className="text-center text-xs text-red-500">{reqState.error as string}</p>}
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
