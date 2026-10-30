"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";
import { REQUEST_STATUSES, STATUS_LABELS } from "@/data/statuses";

import PageHeader from "@/components/pageHeader";
import StatusBadge from "@/components/statusBadge";
import { DataTable } from "@/components/dataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RequestSheet from "./components/requestSheet";

const OPEN = ["NEW", "QUOTED", "PAID", "SOURCING", "SHIPPED"];

export default function RequestsPage() {
  const { data, isLoading, error, mutate } = useApi<any[]>("/api/admin/requests/get");
  const [filter, setFilter] = useState("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const requests = data || [];
    if (filter === "open") return requests.filter((r) => OPEN.includes(r.status));
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [data, filter]);

  // Look the open request up from the latest data, so the sheet shows the
  // new quote/status straight after saving.
  const selected = (data || []).find((r) => r.id === selectedId) || null;

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono font-semibold">{row.original.code}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => format(new Date(row.original.createdAt), "d MMM yyyy"),
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <div className="line-clamp-1 font-medium">{row.original.productName}</div>
            <div className="text-xs text-muted-foreground">Qty {row.original.quantity}</div>
          </div>
        ),
      },
      {
        id: "customer",
        accessorFn: (r) => `${r.name} ${r.email} ${r.phone}`,
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          </div>
        ),
      },
      {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => (row.original.budget ? formatMoney(row.original.budget) : "—"),
      },
      {
        accessorKey: "quoteTotal",
        header: "Quote",
        cell: ({ row }) => (row.original.quoteTotal ? <span className="font-semibold">{formatMoney(row.original.quoteTotal)}</span> : "—"),
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
        title="Sourcing requests"
        description="Products customers asked us to find. Quote them, and once paid, source and ship."
      />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <DataTable
        loading={isLoading}
        data={rows}
        columns={columns}
        entityLabel="requests"
        searchPlaceholder="Code, product, customer…"
        onRowClick={(r) => setSelectedId(r.id)}
        toolbar={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="all">All</SelectItem>
              {REQUEST_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <RequestSheet request={selected} onClose={() => setSelectedId(null)} onSaved={() => mutate()} />
    </>
  );
}
