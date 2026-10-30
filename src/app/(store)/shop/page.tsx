import type { Metadata } from "next";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight, BsSearch } from "react-icons/bs";

import searchProducts from "@/controllers/store/search";
import { getCategories } from "@/controllers/store/home";
import ProductCard from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ShopControls from "./components/shopControls";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; category?: string; sort?: string; page?: string; inStock?: string };

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  return { title: searchParams.q ? `Search: ${searchParams.q}` : "Shop" };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ products, total, page, pageCount }, categories] = await Promise.all([
    searchProducts(searchParams),
    getCategories(),
  ]);

  const q = (searchParams.q || "").trim();
  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  // Same filters, a different page / category.
  const hrefWith = (changes: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const next = { ...searchParams, ...changes };
    (Object.keys(next) as (keyof SearchParams)[]).forEach((key) => {
      const value = next[key];
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black sm:text-3xl">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : activeCategory ? activeCategory.name : "All products"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} product{total === 1 ? "" : "s"}
          {q && activeCategory ? ` in ${activeCategory.name}` : ""}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* CATEGORIES */}
        <aside>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categories
          </h2>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-visible">
            <CategoryLink href={hrefWith({ category: undefined, page: undefined })} active={!activeCategory}>
              All
            </CategoryLink>
            {categories.map((c) => (
              <CategoryLink
                key={c.id}
                href={hrefWith({ category: c.slug, page: undefined })}
                active={activeCategory?.id === c.id}
              >
                {c.name}
                <span className="ml-auto pl-2 text-xs text-muted-foreground">{c.productCount}</span>
              </CategoryLink>
            ))}
          </nav>
        </aside>

        <section>
          <ShopControls sort={searchParams.sort} inStock={searchParams.inStock === "1"} />

          {products.length ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
              <BsSearch className="h-8 w-8 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-bold">
                {q ? <>We don&apos;t stock &ldquo;{q}&rdquo; yet</> : "Nothing here yet"}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Tell us what you&apos;re looking for. We&apos;ll find it, send you a price including
                shipping, and deliver it to you.
              </p>
              <Button asChild className="mt-6">
                <Link href={`/request${q ? `?product=${encodeURIComponent(q)}` : ""}`}>
                  Request {q ? `"${q}"` : "a product"}
                </Link>
              </Button>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pages">
              <Button asChild variant="outline" size="sm" className={cn(page <= 1 && "pointer-events-none opacity-50")}>
                <Link href={hrefWith({ page: String(page - 1) })} aria-disabled={page <= 1}>
                  <BsArrowLeft className="mr-1" /> Previous
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(page >= pageCount && "pointer-events-none opacity-50")}
              >
                <Link href={hrefWith({ page: String(page + 1) })} aria-disabled={page >= pageCount}>
                  Next <BsArrowRight className="ml-1" />
                </Link>
              </Button>
            </nav>
          )}

          {products.length > 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Not what you need?{" "}
              <Link href={`/request${q ? `?product=${encodeURIComponent(q)}` : ""}`} className="font-semibold text-brand hover:underline">
                Ask us to source it
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-sm lg:rounded-md lg:border-0",
        active ? "border-primary bg-accent font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
