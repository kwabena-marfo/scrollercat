"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form";

import FormField from "@/components/formField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GHANA_REGIONS } from "@/data/regions";

// Name, email, phone and delivery address — shared by /checkout and
// /request, whose schemas both spread schemas/contact.ts.
export default function ContactFields<T extends FieldValues>({
  register: registerField,
  control,
  errors,
}: {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
}) {
  // The form's own schema has these paths; TypeScript can't see that
  // through the generic.
  const register = (path: string) => registerField(path as Path<T>);
  const err = (path: string) => {
    const [a, b] = path.split(".");
    const e: any = b ? (errors as any)?.[a]?.[b] : (errors as any)?.[a];
    return e?.message as string | undefined;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id="name" label="Full name" required error={err("name")} className="sm:col-span-2">
        <Input id="name" autoComplete="name" error={!!err("name")} {...register("name")} />
      </FormField>
      <FormField id="email" label="Email" required error={err("email")} hint="We'll send your receipt and updates here.">
        <Input id="email" type="email" autoComplete="email" error={!!err("email")} {...register("email")} />
      </FormField>
      <FormField id="phone" label="Phone" required error={err("phone")} hint="For the delivery rider.">
        <Input id="phone" type="tel" autoComplete="tel" placeholder="024 000 0000" error={!!err("phone")} {...register("phone")} />
      </FormField>

      <FormField id="line1" label="Street or GPS address" required error={err("address.line1")} className="sm:col-span-2">
        <Input
          id="line1"
          autoComplete="street-address"
          placeholder="e.g. 12 Oxford St, Osu or GA-123-4567"
          error={!!err("address.line1")}
          {...register("address.line1")}
        />
      </FormField>
      <FormField id="city" label="Town / city" required error={err("address.city")}>
        <Input id="city" autoComplete="address-level2" error={!!err("address.city")} {...register("address.city")} />
      </FormField>
      <FormField id="region" label="Region" required error={err("address.region")}>
        <Controller
          control={control}
          name={"address.region" as Path<T>}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger id="region" className={err("address.region") ? "border-red-400" : ""}>
                <SelectValue placeholder="Choose a region" />
              </SelectTrigger>
              <SelectContent>
                {GHANA_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField id="landmark" label="Landmark" error={err("address.landmark")} className="sm:col-span-2">
        <Input id="landmark" placeholder="Near the… (optional)" error={false} {...register("address.landmark")} />
      </FormField>
    </div>
  );
}
