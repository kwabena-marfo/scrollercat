"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuLoader2 } from "react-icons/lu";

import useTriggerRequest from "@/hooks/useTriggerRequest";
import { productSchema, type ProductForm } from "@/schemas/admin";
import { CONDITION_LABELS, PRODUCT_CONDITIONS } from "@/data/conditions";

import FormField from "@/components/formField";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_CATEGORY = "none";

export default function ProductModal({
  isOpen,
  product,
  categories,
  onClose,
  mutateProducts,
}: {
  isOpen: boolean;
  product: any | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  mutateProducts: () => void;
}) {
  const { toast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema), mode: "onTouched" });

  const { reqFunction: saveProduct, reqState: saveState, setReqState: resetSaveState } = useTriggerRequest();
  const { reqFunction: deleteProduct, reqState: deleteState, setReqState: resetDeleteState } = useTriggerRequest();

  useEffect(() => {
    if (!isOpen) return;
    reset(
      product
        ? {
            name: product.name,
            description: product.description,
            condition: product.condition || "NEW",
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? undefined,
            stock: product.stock,
            categoryId: product.categoryId || "",
            images: product.images.join("\n"),
            featured: product.featured,
            active: product.active,
          }
        : { name: "", description: "", condition: "NEW", stock: 0, images: "", categoryId: "", featured: false, active: true } as any,
    );
    resetSaveState(undefined);
    resetDeleteState(undefined);
  }, [isOpen, product]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = saveState?.data || deleteState?.data;
  useEffect(() => {
    if (done) {
      mutateProducts();
      toast({ title: done as string });
      resetSaveState(undefined);
      resetDeleteState(undefined);
      onClose();
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: ProductForm) =>
    saveProduct({
      route: product ? `/api/admin/products/update?id=${product.id}` : "/api/admin/products/create",
      reqType: "post",
      data,
    });

  const onDelete = () => {
    if (!window.confirm(`Delete "${product.name}"? Past orders keep their copy. To just take it off the shop, untick "Show in shop" instead.`)) return;
    deleteProduct({ route: `/api/admin/products/delete?id=${product.id}`, reqType: "post" });
  };

  const error = saveState?.error || deleteState?.error;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Name" required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" error={!!errors.name} {...register("name")} />
          </FormField>

          <FormField id="price" label="Price (GHS)" required error={errors.price?.message}>
            <Input id="price" type="number" step="0.01" min={0} error={!!errors.price} {...register("price")} />
          </FormField>
          <FormField id="compareAtPrice" label="Was (GHS)" hint="Shows the item as on sale." error={errors.compareAtPrice?.message}>
            <Input id="compareAtPrice" type="number" step="0.01" min={0} error={!!errors.compareAtPrice} {...register("compareAtPrice")} />
          </FormField>

          <FormField id="stock" label="In stock" required error={errors.stock?.message}>
            <Input id="stock" type="number" min={0} error={!!errors.stock} {...register("stock")} />
          </FormField>
          <FormField id="condition" label="Condition" hint="Shown as a badge in the shop.">
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select value={field.value || "NEW"} onValueChange={field.onChange}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CONDITION_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField id="categoryId" label="Category" className="sm:col-span-2">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value || NO_CATEGORY} onValueChange={(v) => field.onChange(v === NO_CATEGORY ? "" : v)}>
                  <SelectTrigger id="categoryId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField id="description" label="Description" className="sm:col-span-2">
            <Textarea id="description" rows={4} {...register("description")} />
          </FormField>

          <FormField
            id="images"
            label="Image URLs"
            hint="One per line. The first is the main photo."
            className="sm:col-span-2"
          >
            <Textarea id="images" rows={3} placeholder="https://res.cloudinary.com/…" {...register("images")} />
          </FormField>

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox id="active" checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                  <Label htmlFor="active" className="font-normal">Show in shop</Label>
                </div>
              )}
            />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox id="featured" checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                  <Label htmlFor="featured" className="font-normal">Feature on the home page</Label>
                </div>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-between">
            {product ? (
              <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete} disabled={deleteState?.pending}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saveState?.pending}>
              {saveState?.pending && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Save changes" : "Add product"}
            </Button>
          </div>
          {error && <p className="text-center text-xs text-red-500 sm:col-span-2">{error as string}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
