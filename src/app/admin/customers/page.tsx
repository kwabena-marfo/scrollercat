"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";

import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/dataTable";

export default function CustomersPage() {
  const { data, isLoading, error } = useApi<any[]>("/api/admin/customers/get");

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "contact",
        accessorFn: (c) => `${c.email} ${c.phone}`,
        header: "Contact",
        cell: ({ row }) => (
          <div className="text-sm">
            <a href={`mailto:${row.original.email}`} className="block text-brand hover:underline">{row.original.email}</a>
            <a href={`tel:${row.original.phone}`} className="text-muted-foreground hover:underline">{row.original.phone}</a>
          </div>
        ),
      },
      {
        id: "location",
        accessorFn: (c) => (c.address ? `${c.address.city}, ${c.address.region}` : ""),
        header: "Location",
      },
      { accessorKey: "orderCount", header: "Orders" },
      { accessorKey: "requestCount", header: "Requests" },
      {
        accessorKey: "totalSpent",
        header: "Spent",
        cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.totalSpent)}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "First seen",
        cell: ({ row }) => format(new Date(row.original.createdAt), "d MMM yyyy"),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has checked out or sent a request, matched by email."
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <DataTable
        loading={isLoading}
        data={data || []}
        columns={columns}
        entityLabel="customers"
        searchPlaceholder="Name, email, phone, town…"
      />
    </>
  );
}
