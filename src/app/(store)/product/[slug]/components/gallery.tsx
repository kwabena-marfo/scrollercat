"use client";

import { useState } from "react";

import { ProductImage } from "@/components/productCard";
import { cn } from "@/lib/utils";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
        <ProductImage src={images[active]} alt={name} />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border-2",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
