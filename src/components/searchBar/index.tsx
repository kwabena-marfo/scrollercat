"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { BsSearch } from "react-icons/bs";

import { cn } from "@/lib/utils";

// Submits to /shop?q=… — the one search everyone uses (header, hero, empty
// results). Keeps the shop's current category filter when there is one.
export default function SearchBar({
  size = "default",
  className,
  autoFocus,
}: {
  size?: "default" | "lg";
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");

  useEffect(() => {
    setQuery(searchParams?.get("q") || "");
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const category = searchParams?.get("category");
    if (category) params.set("category", category);
    const qs = params.toString();
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  };

  const large = size === "lg";

  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <label htmlFor={`search-${size}`} className="sr-only">
        Search products
      </label>
      <BsSearch
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          large ? "left-5 h-5 w-5" : "left-3 h-4 w-4",
        )}
      />
      <input
        id={`search-${size}`}
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={large ? "Search phones, headphones, kitchen gadgets…" : "Search products"}
        className={cn(
          "w-full rounded-full border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          large ? "h-14 pl-14 pr-32 text-base shadow-lg" : "h-10 pl-9 pr-4 text-sm",
        )}
      />
      {large && (
        <button
          type="submit"
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      )}
    </form>
  );
}
