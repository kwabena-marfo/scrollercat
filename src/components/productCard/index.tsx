import Link from "next/link";
import { BsImage } from "react-icons/bs";

import { formatMoney } from "@/helpers/money";
import ConditionBadge from "@/components/conditionBadge";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  condition?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: string[];
  category?: { name: string; slug: string } | null;
};

export function ProductImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  // Plain <img>: product photos can come from any host an admin pastes.
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className || ""}`} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <BsImage className="h-8 w-8" />
    </div>
  );
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="transition duration-300 group-hover:scale-105"
        />
        {onSale && !soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            Sale
          </span>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-xs font-bold text-background">
            Sold out
          </span>
        )}
        <ConditionBadge condition={product.condition} className="absolute right-2 top-2 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && (
          <span className="text-xs text-muted-foreground">{product.category.name}</span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-bold">{formatMoney(product.price)}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
