import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BsCreditCard2Front, BsTruck } from "react-icons/bs";

import getProduct from "@/controllers/store/product";
import ProductCard from "@/components/productCard";
import ConditionBadge from "@/components/conditionBadge";
import { formatMoney } from "@/helpers/money";
import Gallery from "./components/gallery";
import AddToCart from "./components/addToCart";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  try {
    return await getProduct(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await load(params.slug);
  if (!data) return { title: "Product not found" };
  return {
    title: data.product.name,
    description: data.product.description.slice(0, 160),
    openGraph: { images: data.product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);
  if (!data) notFound();
  const { product, related } = data;

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div>
          <ConditionBadge condition={product.condition} className="mb-3 px-2.5 text-sm" />
          <h1 className="text-3xl font-black leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatMoney(product.price)}</span>
            {onSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.stock > 5 ? (
              <span className="font-medium text-green-600 dark:text-green-400">In stock</span>
            ) : product.stock > 0 ? (
              <span className="font-medium text-amber-600 dark:text-amber-400">Only {product.stock} left</span>
            ) : (
              <span className="font-medium text-red-600 dark:text-red-400">Sold out</span>
            )}
          </p>

          <AddToCart
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0] || null,
              stock: product.stock,
            }}
          />

          {product.stock <= 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Need it sooner?{" "}
              <Link
                href={`/request?product=${encodeURIComponent(product.name)}`}
                className="font-semibold text-brand hover:underline"
              >
                Ask us to source it
              </Link>
            </p>
          )}

          <ul className="mt-8 space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
            <li className="flex items-center gap-3">
              <BsTruck className="h-4 w-4 text-primary" /> Delivery anywhere in Ghana. Choose your
              option at checkout.
            </li>
            <li className="flex items-center gap-3">
              <BsCreditCard2Front className="h-4 w-4 text-primary" /> Pay securely with mobile money
              or card through Paystack.
            </li>
          </ul>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
