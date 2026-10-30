"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BsPlus } from "react-icons/bs";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";

import PageHeader from "@/components/pageHeader";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import ShippingModal from "./components/shippingModal";

export default function ShippingPage() {
  const { data, isLoading, error, mutate } = useApi<any[]>("/api/admin/shipping/get");
  const [editing, setEditing] = useState<any>(undefined);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { accessorKey: "sortOrder", header: "#" },
      {
        accessorKey: "name",
        header: "Option",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && <div className="text-xs text-muted-foreground">{row.original.description}</div>}
          </div>
        ),
      },
      { accessorKey: "eta", header: "Delivery time" },
      {
        accessorKey: "fee",
        header: "Fee",
        cell: ({ row }) => (row.original.fee ? formatMoney(row.original.fee) : "Free"),
      },
      {
        accessorKey: "active",
        header: "At checkout",
        cell: ({ row }) => (row.original.active ? "Shown" : <span className="text-muted-foreground">Hidden</span>),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Delivery options"
        description="What customers choose from at checkout. Lowest # shows first."
        actions={
          <Button onClick={() => setEditing(null)}>
            <BsPlus className="mr-1 h-5 w-5" /> Add option
          </Button>
        }
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <DataTable
        loading={isLoading}
        data={data || []}
        columns={columns}
        entityLabel="delivery options"
        onRowClick={setEditing}
      />
      <ShippingModal
        isOpen={editing !== undefined}
        method={editing}
        onClose={() => setEditing(undefined)}
        mutateMethods={mutate}
      />
    </>
  );
}
