"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { BsDash, BsPlus } from "react-icons/bs";

import useCart from "@/hooks/useCart";
import { addToCart, type CartItem } from "@/store/cartSlice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { dispatch } = useCart();
  const [quantity, setQuantity] = useState(1);

  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, 99);

  const add = () => {
    dispatch(addToCart({ ...product, quantity }));
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex h-11 items-center rounded-md border">
        <button
          type="button"
          className="flex h-full w-10 items-center justify-center disabled:opacity-40"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={soldOut || quantity <= 1}
          aria-label="Fewer"
        >
          <BsDash />
        </button>
        <span className="w-10 text-center font-semibold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="flex h-full w-10 items-center justify-center disabled:opacity-40"
          onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          disabled={soldOut || quantity >= max}
          aria-label="More"
        >
          <BsPlus />
        </button>
      </div>

      <Button
        size="lg"
        variant="outline"
        disabled={soldOut}
        onClick={() => {
          add();
          toast({ title: "Added to cart", description: `${quantity} × ${product.name}` });
        }}
      >
        Add to cart
      </Button>
      <Button
        size="lg"
        disabled={soldOut}
        onClick={() => {
          add();
          router.push("/checkout");
        }}
      >
        Buy now
      </Button>
    </div>
  );
}
