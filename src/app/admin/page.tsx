"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BsCashStack, BsExclamationTriangle, BsPeople, BsSearchHeart, BsTruck } from "react-icons/bs";

import useApi from "@/hooks/useApi";
import { formatMoney } from "@/helpers/money";
import StatCard from "@/components/statCard";
import StatusBadge from "@/components/statusBadge";
import PageHeader from "@/components/pageHeader";

export default function DashboardPage() {
  const { data, isLoading, error } = useApi("/api/admin/dashboard");

  return (
    <>
      <PageHeader title="Dashboard" description="The last 30 days at a glance." />
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (30 days)"
          value={formatMoney(data?.revenue)}
          hint={data ? `${data.paidCount} payment${data.paidCount === 1 ? "" : "s"}` : undefined}
          icon={BsCashStack}
          loading={isLoading}
        />
        <StatCard label="Orders to ship" value={data?.toShip ?? 0} hint="Paid or packing" icon={BsTruck} loading={isLoading} />
        <StatCard
          label="Requests to action"
          value={data?.newRequests ?? 0}
          hint="New (to quote) or paid (to source)"
          icon={BsSearchHeart}
          loading={isLoading}
        />
        <StatCard label="Customers" value={data?.customerCount ?? 0} icon={BsPeople} loading={isLoading} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-bold">Revenue by day</h2>
          <p className="text-xs text-muted-foreground">Successful Paystack payments, in GHS</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueByDay || []} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(parseISO(d), "d MMM")}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(d) => format(parseISO(d as string), "EEE d MMM")}
                  formatter={(value: number, name) => [formatMoney(value), name === "orders" ? "Shop orders" : "Sourcing"]}
                />
                <Area type="monotone" dataKey="orders" stackId="1" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#fillOrders)" />
                <Area type="monotone" dataKey="requests" stackId="1" stroke="hsl(var(--foreground))" strokeWidth={1.5} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <BsExclamationTriangle className="text-amber-500" /> Low stock
          </h2>
          {data?.lowStock?.length ? (
            <ul className="mt-3 divide-y text-sm">
              {data.lowStock.map((p: any) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="line-clamp-1">{p.name}</span>
                  <span className={p.stock <= 0 ? "font-bold text-red-500" : "font-semibold"}>{p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{isLoading ? "Loading…" : "Everything is well stocked."}</p>
          )}
          <Link href="/admin/products" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
            Manage products →
          </Link>
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">
            All orders →
          </Link>
        </div>
        {data?.recentOrders?.length ? (
          <ul className="mt-3 divide-y text-sm">
            {data.recentOrders.map((o: any) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-mono font-semibold">{o.orderNumber}</span>
                <span className="text-muted-foreground">{o.name}</span>
                <span className="ml-auto">{formatMoney(o.total)}</span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{isLoading ? "Loading…" : "No paid orders yet."}</p>
        )}
      </section>
    </>
  );
}
