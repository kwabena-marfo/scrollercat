import Link from "next/link";

import Logo from "@/components/logo";
import { SITE_DESCRIPTION, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/data/site";

export default function StoreFooter() {
  return (
    <footer className="mt-20 border-t bg-muted/40">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo size={28} />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{SITE_DESCRIPTION}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/shop" className="hover:text-foreground">All products</Link>
            </li>
            <li>
              <Link href="/request" className="hover:text-foreground">Request a product</Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-foreground">Track an order</Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">Your cart</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold">Help</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">{SUPPORT_EMAIL}</a>
            </li>
            <li>
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="hover:text-foreground">{SUPPORT_PHONE}</a>
            </li>
            <li>Payments secured by Paystack</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} scrollerCat</span>
          <Link href="/admin" className="hover:text-foreground">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}
