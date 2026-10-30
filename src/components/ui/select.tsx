"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { BsCheck, BsChevronDown, BsChevronUp } from "react-icons/bs";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm  placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <BsChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// Click-to-scroll arrows for lists taller than the dropdown (e.g. a 30+
// option year or country list). Radix's own ScrollUp/DownButton scroll
// continuously while merely hovered, which runs the list away from the
// pointer — these move one step per click instead, and only show when
// there's more list in that direction. Wheel/touch scrolling still works.
const SCROLL_STEP = 160;

function ScrollArrow({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick: () => void;
}) {
  const Icon = direction === "up" ? BsChevronUp : BsChevronDown;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={direction === "up" ? "Scroll up" : "Scroll down"}
      // Keep focus on the list so keyboard selection keeps working.
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex w-full items-center justify-center py-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  // A state-backed ref: Radix only mounts the viewport while the list is
  // open, so setup has to run when *it* appears, not when SelectContent does.
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = React.useState({ up: false, down: false });

  const measure = React.useCallback(() => {
    if (!viewport) return;
    setCanScroll({
      up: viewport.scrollTop > 0,
      down: viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
    });
  }, [viewport]);

  React.useLayoutEffect(() => {
    if (!viewport) return;

    // Radix positions the content (and scrolls the selected item into view)
    // a few frames after mount, so keep re-measuring as it settles.
    measure();
    const frame = requestAnimationFrame(measure);
    const timer = setTimeout(measure, 150);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(viewport);

    // Scroll the list ourselves. When the Select sits inside a Dialog or a
    // modal Popover (e.g. the DOB picker's month/year dropdowns in Add
    // Member), their scroll lock swallows wheel and touch scrolling on this
    // portalled list, leaving it stuck at the top.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewport.clientHeight : 1;
      viewport.scrollTop += e.deltaY * unit;
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      e.preventDefault();
      viewport.scrollTop += touchY - y;
      touchY = y;
    };
    // No touchend handling: Radix Select 2.x picks a touched item on its
    // click (not pointerup, as 1.x did), so the click lands on the item
    // itself rather than falling through to whatever sat under the list —
    // and cancelling touchend would stop items being picked at all.
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer?.disconnect();
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onTouchStart);
      viewport.removeEventListener("touchmove", onTouchMove);
    };
  }, [viewport, measure]);

  const scrollBy = (delta: number) => viewport?.scrollBy({ top: delta, behavior: "smooth" });

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {canScroll.up && <ScrollArrow direction="up" onClick={() => scrollBy(-SCROLL_STEP)} />}
        <SelectPrimitive.Viewport
          ref={setViewport}
          onScroll={measure}
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        {canScroll.down && <ScrollArrow direction="down" onClick={() => scrollBy(SCROLL_STEP)} />}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <BsCheck className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
