"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { BsBoxArrowUpRight, BsPlus, BsTags } from "react-icons/bs";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";

import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/dataTable";
import { ProductImage } from "@/components/productCard";
import ConditionBadge from "@/components/conditionBadge";
import { Button } from "@/components/ui/button";
import ProductModal from "./components/productModal";
import CategoriesModal from "./components/categoriesModal";

export default function ProductsPage() {
  const { data, isLoading, error, mutate } = useApi<{ products: any[]; categories: any[] }>("/api/admin/products/get");
  // undefined = closed, null = new product, object = editing it.
  const [editing, setEditing] = useState<any>(undefined);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
              <ProductImage src={row.original.images[0]} alt="" />
            </span>
            <span className="line-clamp-2 max-w-xs font-medium">{row.original.name}</span>
            {row.original.condition !== "NEW" && <ConditionBadge condition={row.original.condition} />}
          </div>
        ),
      },
      {
        id: "category",
        accessorFn: (p) => p.category?.name || "",
        header: "Category",
        cell: ({ getValue }) => getValue() || <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatMoney(row.original.price),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span className={row.original.stock <= 0 ? "font-bold text-red-500" : row.original.stock <= 5 ? "font-semibold text-amber-600" : ""}>
            {row.original.stock}
          </span>
        ),
      },
      {
        id: "visibility",
        accessorFn: (p) => (p.active ? "live" : "hidden") + (p.featured ? " featured" : ""),
        header: "In shop",
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.original.active ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300" : "bg-muted text-muted-foreground"}`}>
              {row.original.active ? "Live" : "Hidden"}
            </span>
            {row.original.featured && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-brand">Featured</span>
            )}
          </div>
        ),
      },
      {
        id: "view",
        header: "",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.active && (
            <Link
              href={`/product/${row.original.slug}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground"
              aria-label="View in shop"
            >
              <BsBoxArrowUpRight />
            </Link>
          ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Products"
        description="Your catalogue. Click a product to edit it."
        actions={
          <>
            <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
              <BsTags className="mr-2" /> Categories
            </Button>
            <Button onClick={() => setEditing(null)}>
              <BsPlus className="mr-1 h-5 w-5" /> Add product
            </Button>
          </>
        }
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <DataTable
        loading={isLoading}
        data={data?.products || []}
        columns={columns}
        entityLabel="products"
        searchPlaceholder="Search products…"
        onRowClick={setEditing}
      />

      <ProductModal
        isOpen={editing !== undefined}
        product={editing}
        categories={data?.categories || []}
        onClose={() => setEditing(undefined)}
        mutateProducts={mutate}
      />
      <CategoriesModal
        isOpen={categoriesOpen}
        categories={data?.categories || []}
        onClose={() => setCategoriesOpen(false)}
        mutateProducts={mutate}
      />
    </>
  );
}
