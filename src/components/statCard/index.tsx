import type { IconType } from "react-icons";

import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: IconType;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-brand">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-black">{loading ? <Skeleton className="h-8 w-24" /> : value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
