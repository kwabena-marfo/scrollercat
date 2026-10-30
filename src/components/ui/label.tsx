"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

// `required` adds the usual red asterisk after the label text (unmarked =
// optional). The asterisk is hidden from screen readers, which hear
// "required" instead.
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {children}
    {required && (
      <>
        <span aria-hidden="true" className="ml-0.5 text-red-500">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
