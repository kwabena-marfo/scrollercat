import { STATUS_COLORS, STATUS_LABELS } from "@/data/statuses";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
