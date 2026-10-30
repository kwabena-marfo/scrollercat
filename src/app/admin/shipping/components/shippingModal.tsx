"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuLoader2 } from "react-icons/lu";

import useTriggerRequest from "@/hooks/useTriggerRequest";
import { shippingMethodSchema, type ShippingMethodForm } from "@/schemas/admin";

import FormField from "@/components/formField";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ShippingModal({
  isOpen,
  method,
  onClose,
  mutateMethods,
}: {
  isOpen: boolean;
  method: any | null;
  onClose: () => void;
  mutateMethods: () => void;
}) {
  const { toast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingMethodForm>({ resolver: zodResolver(shippingMethodSchema), mode: "onTouched" });

  const { reqFunction: save, reqState: saveState, setReqState: resetSave } = useTriggerRequest();
  const { reqFunction: remove, reqState: removeState, setReqState: resetRemove } = useTriggerRequest();

  useEffect(() => {
    if (!isOpen) return;
    reset(
      method
        ? { name: method.name, description: method.description, fee: method.fee, eta: method.eta, sortOrder: method.sortOrder, active: method.active }
        : ({ name: "", description: "", eta: "", sortOrder: 0, active: true } as any),
    );
    resetSave(undefined);
    resetRemove(undefined);
  }, [isOpen, method]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = saveState?.data || removeState?.data;
  useEffect(() => {
    if (done) {
      mutateMethods();
      toast({ title: done as string });
      resetSave(undefined);
      resetRemove(undefined);
      onClose();
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const error = saveState?.error || removeState?.error;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{method ? "Edit delivery option" : "Add delivery option"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) =>
            save({
              route: method ? `/api/admin/shipping/update?id=${method.id}` : "/api/admin/shipping/create",
              reqType: "post",
              data,
            }),
          )}
          className="grid gap-4 sm:grid-cols-2"
        >
          <FormField id="name" label="Name" required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" placeholder="e.g. Accra same-day" error={!!errors.name} {...register("name")} />
          </FormField>
          <FormField id="description" label="Description" className="sm:col-span-2">
            <Input id="description" placeholder="e.g. Order before 12pm" error={false} {...register("description")} />
          </FormField>
          <FormField id="fee" label="Fee (GHS)" required error={errors.fee?.message} hint="0 for free delivery">
            <Input id="fee" type="number" step="0.01" min={0} error={!!errors.fee} {...register("fee")} />
          </FormField>
          <FormField id="eta" label="Delivery time">
            <Input id="eta" placeholder="e.g. 2–4 days" error={false} {...register("eta")} />
          </FormField>
          <FormField id="sortOrder" label="Order (#)">
            <Input id="sortOrder" type="number" error={false} {...register("sortOrder")} />
          </FormField>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <div className="flex items-center gap-2 self-end pb-2">
                <Checkbox id="active" checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                <Label htmlFor="active" className="font-normal">Show at checkout</Label>
              </div>
            )}
          />

          <div className="flex justify-between gap-2 sm:col-span-2">
            {method ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                disabled={removeState?.pending}
                onClick={() =>
                  window.confirm(`Delete "${method.name}"?`) &&
                  remove({ route: `/api/admin/shipping/delete?id=${method.id}`, reqType: "post" })
                }
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saveState?.pending}>
              {saveState?.pending && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
          {error && <p className="text-center text-xs text-red-500 sm:col-span-2">{error as string}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
