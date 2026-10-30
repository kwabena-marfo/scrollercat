import { Suspense } from "react";
import Link from "next/link";
import { BsArrowRight, BsCreditCard2Front, BsGeoAlt, BsSearch, BsTruck, BsChatSquareText, BsBoxSeam } from "react-icons/bs";

import getHome from "@/controllers/store/home";
import SearchBar from "@/components/searchBar";
import ProductCard from "@/components/productCard";
import { BRAND_YELLOW, LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/helpers/money";
import { SITE_TAGLINE } from "@/data/site";

// Rendered per request from the database (and never at build time, when
// there may be no database to reach).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { featured, newArrivals, categories, shippingMethods } = await getHome();
  const showcase = featured.length ? featured : newArrivals;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND_YELLOW}33` }}
        />
        {/* The logo's cat-cart, large and faint, peeking in from the right. */}
        <LogoMark
          size={560}
          className="pointer-events-none absolute -right-40 top-1/2 h-[380px] w-[380px] -translate-y-1/2 -rotate-12 opacity-10 sm:-right-24 sm:h-[440px] sm:w-[440px] lg:right-6 lg:h-[460px] lg:w-[460px] lg:opacity-[0.18]"
        />
        <div className="container relative py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Shop online · Delivered across Ghana
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-6xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-4 max-w-xl text-base text-background/70 sm:text-lg">
            Search our shop and get it delivered to your door. Not in stock? Tell us what you
            want and we&apos;ll source it, quote you, and ship it.
          </p>

          <div className="mt-8 max-w-2xl text-foreground">
            <Suspense>
              <SearchBar size="lg" />
            </Suspense>
          </div>

          {categories.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-background/60">Popular:</span>
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  className="rounded-full border border-background/20 px-3 py-1 text-background/90 hover:border-primary hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <ul className="mt-10 grid gap-4 text-sm text-background/80 sm:grid-cols-3">
            <li className="flex items-center gap-3">
              <BsCreditCard2Front className="h-5 w-5 text-primary" /> Pay with MoMo or card (Paystack)
            </li>
            <li className="flex items-center gap-3">
              <BsTruck className="h-5 w-5 text-primary" /> Delivery to every region
            </li>
            <li className="flex items-center gap-3">
              <BsGeoAlt className="h-5 w-5 text-primary" /> Track every order online
            </li>
          </ul>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container mt-16">
          <SectionHeading title="Shop by category" href="/shop" linkLabel="All products" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className="rounded-xl border bg-card p-4 transition hover:border-primary hover:shadow-md"
              >
                <span className="block font-semibold">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.productCount} product{c.productCount === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED */}
      <section className="container mt-16">
        <SectionHeading
          title={featured.length ? "Featured" : "Just in"}
          href="/shop"
          linkLabel="Browse the shop"
        />
        {showcase.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {showcase.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Products you add in the admin panel will show up here.
          </p>
        )}
      </section>

      {/* SOURCING */}
      <section className="container mt-20">
        <div className="grid gap-10 overflow-hidden rounded-2xl border bg-accent p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Shop-for-me
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Can&apos;t find it? We&apos;ll get it.</h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Send us a product name or a link from any online store. We&apos;ll find it, send you
              one all-in price (item, shipping and our fee), and deliver it to you.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/request">
                Request a product <BsArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
          <ol className="grid gap-4">
            {[
              { icon: BsSearch, title: "Tell us what you want", text: "A name, a photo description or a link." },
              { icon: BsChatSquareText, title: "Get a quote", text: "One price for the item, shipping and our fee." },
              { icon: BsBoxSeam, title: "Pay and we ship", text: "Pay with MoMo or card and track it to your door." },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4 rounded-xl bg-card p-4 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon />
                </span>
                <div>
                  <p className="font-semibold">
                    {i + 1}. {title}
                  </p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {featured.length > 0 && newArrivals.length > 0 && (
        <section className="container mt-20">
          <SectionHeading title="New arrivals" href="/shop?sort=newest" linkLabel="See all" />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* DELIVERY */}
      {shippingMethods.length > 0 && (
        <section className="container mt-20">
          <h2 className="text-2xl font-black">Delivery options</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shippingMethods.map((m) => (
              <div key={m.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">{m.name}</h3>
                  <span className="font-bold">{m.fee ? formatMoney(m.fee) : "Free"}</span>
                </div>
                {m.eta && <p className="mt-1 text-sm text-brand">{m.eta}</p>}
                {m.description && <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHeading({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-black">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        {linkLabel} <BsArrowRight />
      </Link>
    </div>
  );
}
