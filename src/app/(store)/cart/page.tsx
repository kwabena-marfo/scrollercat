"use client";

import Link from "next/link";
import { BsBag, BsDash, BsPlus, BsTrash } from "react-icons/bs";

import useCart from "@/hooks/useCart";
import { removeFromCart, setQuantity } from "@/store/cartSlice";
import { ProductImage } from "@/components/productCard";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/helpers/money";

export default function CartPage() {
  const { ready, items, subtotal, dispatch } = useCart();

  if (!ready) return <div className="container min-h-[50vh] py-10" />;

  if (!items.length) {
    return (
      <div className="container flex flex-col items-center py-24 text-center">
        <BsBag className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-black">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Search the shop, or ask us to source something.</p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/shop">Browse the shop</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/request">Request a product</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-black">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4">
              <Link href={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                <ProductImage src={item.image || undefined} alt={item.name} />
              </Link>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="font-semibold hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatMoney(item.price)} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-9 items-center rounded-md border">
                    <button
                      type="button"
                      className="flex h-full w-8 items-center justify-center disabled:opacity-40"
                      onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      aria-label={`Fewer ${item.name}`}
                    >
                      <BsDash />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="flex h-full w-8 items-center justify-center disabled:opacity-40"
                      onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= Math.min(item.stock, 99)}
                      aria-label={`More ${item.name}`}
                    >
                      <BsPlus />
                    </button>
                  </div>
                  <span className="w-24 text-right font-bold">{formatMoney(item.price * item.quantity)}</span>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <BsTrash />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border bg-card p-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatMoney(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Delivery is added at checkout.</p>
          <Button asChild size="lg" className="mt-5 w-full">
            <Link href="/checkout">Checkout</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/shop">Keep shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
