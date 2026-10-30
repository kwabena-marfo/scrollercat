import { cn } from "@/lib/utils";

// The brand mark: a cat head drawn as a lowercase "c" with a magnifying-glass
// handle, riding on two cart wheels. In the wordmark it stands in for the "c"
// of "cat". src/app/icon.svg and public/logo.svg use the same shapes.
// The yellow is the logo's own colour, independent of --primary.
export const BRAND_YELLOW = "#F9B314";

function CatCart({ color }: { color: string }) {
  return (
    <>
      <path
        d="M47.65 23.54A13 13 0 1 0 46.19 40.19L52.5 46.5"
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 22.6 25.5 11.5 33.6 18.4ZM47 22.6 48.5 11.5 40.4 18.4Z"
        fill={color}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <circle cx="31.5" cy="30.5" r="2.2" fill={color} />
      <circle cx="39.5" cy="30.5" r="2.2" fill={color} />
      <circle cx="31" cy="51" r="2.8" fill={color} />
      <circle cx="43" cy="51" r="2.8" fill={color} />
    </>
  );
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="17 9 42 46"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <CatCart color={BRAND_YELLOW} />
    </svg>
  );
}

// "scroller" + mark-as-"c" + "at". The mark is sized so the head matches the
// x-height and the wheels hang below the baseline like a descender.
export default function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="scrollerCat"
      className={cn("inline-block whitespace-nowrap font-semibold leading-none tracking-tight", className)}
      style={{ fontSize: size * 0.75 }}
    >
      scroller
      <svg
        width="0.632em"
        height="0.808em"
        viewBox="20 9 36 46"
        aria-hidden="true"
        // Tailwind's preflight makes svgs display:block, which would break the word.
        className="inline-block"
        style={{ verticalAlign: "-0.149em", margin: "0 0.01em 0 0.03em" }}
      >
        <CatCart color={BRAND_YELLOW} />
      </svg>
      <span style={{ color: BRAND_YELLOW }}>at</span>
    </span>
  );
}
