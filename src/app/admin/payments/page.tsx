"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";

import PageHeader from "@/components/pageHeader";
import StatusBadge from "@/components/statusBadge";
import { DataTable } from "@/components/dataTable";

export default function PaymentsPage() {
  const { data, isLoading, error } = useApi<any[]>("/api/admin/payments/get");

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.createdAt), "d MMM yyyy, HH:mm"),
      },
      {
        accessorKey: "reference",
        header: "Paystack reference",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference}</span>,
      },
      {
        id: "for",
        accessorFn: (p) => `${p.order?.orderNumber || p.request?.code || ""} ${p.order?.name || p.request?.name || ""}`,
        header: "For",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div>
              <div className="font-mono font-semibold">{p.order?.orderNumber || p.request?.code}</div>
              <div className="text-xs text-muted-foreground">
                {p.kind === "ORDER" ? "Shop order" : "Sourcing"} · {p.order?.name || p.request?.name}
              </div>
            </div>
          );
        },
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.amount)}</span>,
      },
      {
        accessorKey: "fees",
        header: "Paystack fee",
        cell: ({ row }) => (row.original.fees != null ? formatMoney(row.original.fees) : "—"),
      },
      {
        accessorKey: "channel",
        header: "Method",
        cell: ({ row }) => <span className="capitalize">{(row.original.channel || "—").replace("_", " ")}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every Paystack transaction. Pending ones are checkouts the customer didn't finish."
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <DataTable
        loading={isLoading}
        data={data || []}
        columns={columns}
        entityLabel="payments"
        searchPlaceholder="Reference, code, email…"
      />
    </>
  );
}
