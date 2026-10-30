"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";
import { ORDER_STATUSES, STATUS_LABELS } from "@/data/statuses";

import PageHeader from "@/components/pageHeader";
import StatusBadge from "@/components/statusBadge";
import { DataTable } from "@/components/dataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderSheet from "./components/orderSheet";

const OPEN = ["PAID", "PROCESSING", "SHIPPED"];

export default function OrdersPage() {
  const { data, isLoading, error, mutate } = useApi<any[]>("/api/admin/orders/get");
  // Unpaid checkouts (people who closed the payment popup) are hidden unless
  // asked for.
  const [filter, setFilter] = useState("open");
  const [selected, setSelected] = useState<any>(null);

  const rows = useMemo(() => {
    const orders = data || [];
    if (filter === "open") return orders.filter((o) => OPEN.includes(o.status));
    if (filter === "paid") return orders.filter((o) => o.status !== "PENDING_PAYMENT");
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [data, filter]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order",
        cell: ({ row }) => <span className="font-mono font-semibold">{row.original.orderNumber}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.createdAt), "d MMM yyyy, HH:mm"),
      },
      {
        id: "customer",
        accessorFn: (o) => `${o.name} ${o.email} ${o.phone}`,
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          </div>
        ),
      },
      {
        id: "items",
        accessorFn: (o) => o.items.map((i: any) => i.name).join(" "),
        header: "Items",
        cell: ({ row }) => {
          const count = row.original.items.reduce((n: number, i: any) => n + i.quantity, 0);
          return `${count} item${count === 1 ? "" : "s"}`;
        },
        enableSorting: false,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.total)}</span>,
      },
      {
        id: "region",
        accessorFn: (o) => `${o.address.city}, ${o.address.region}`,
        header: "Deliver to",
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
      <PageHeader title="Orders" description="Shop orders paid through Paystack. Click one to update its delivery." />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <DataTable
        loading={isLoading}
        data={rows}
        columns={columns}
        entityLabel="orders"
        searchPlaceholder="Order code, name, phone…"
        onRowClick={setSelected}
        toolbar={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">To fulfil</SelectItem>
              <SelectItem value="paid">All paid</SelectItem>
              <SelectItem value="all">Everything (incl. unpaid)</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <OrderSheet order={selected} onClose={() => setSelected(null)} onSaved={() => mutate()} />
    </>
  );
}
