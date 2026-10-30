import * as React from "react";

import { cn } from "@/lib/utils";

interface CustomInputProps {
  error: boolean;
}
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    CustomInputProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Full class names (not `focus:${...}`) so Tailwind can see them.
          "flex h-10 w-full rounded-md border bg-card text-base px-3 md:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-red-400 focus:ring-red-500" : "focus:ring-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
