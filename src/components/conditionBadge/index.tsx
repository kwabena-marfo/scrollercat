import { CONDITION_COLORS, CONDITION_LABELS } from "@/data/conditions";
import { cn } from "@/lib/utils";

export default function ConditionBadge({ condition, className }: { condition?: string | null; className?: string }) {
  if (!condition) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        CONDITION_COLORS[condition] || "bg-muted text-muted-foreground",
        className,
      )}
    >
      {CONDITION_LABELS[condition] || condition}
    </span>
  );
}
