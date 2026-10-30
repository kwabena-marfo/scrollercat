"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BsBag, BsBoxSeam } from "react-icons/bs";

import Logo from "@/components/logo";
import SearchBar from "@/components/searchBar";
import ThemeToggle from "@/components/themeToggle";
import useCart from "@/hooks/useCart";

export default function StoreHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="bg-foreground text-background">
        <div className="container flex h-9 items-center justify-center text-xs sm:text-sm">
          <span>
            Can&apos;t find it in our shop?{" "}
            <Link href="/request" className="font-semibold underline underline-offset-2">
              We&apos;ll source it and ship it to you →
            </Link>
          </span>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-4">
        <Link href="/" aria-label="scrollerCat home">
          <Logo size={30} />
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm font-medium lg:flex">
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
          <Link href="/request" className="hover:text-primary">
            Request a product
          </Link>
        </nav>

        <div className="mx-auto hidden w-full max-w-md md:block">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/track"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent sm:flex"
          >
            <BsBoxSeam /> Track order
          </Link>
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex items-center rounded-md px-3 py-2 hover:bg-accent"
          >
            <BsBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container pb-3 md:hidden">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
