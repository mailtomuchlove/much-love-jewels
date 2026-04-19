"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { Json } from "@/types";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  confirmed:  "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700",
  shipped:    "bg-indigo-50 text-indigo-700",
  delivered:  "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-600",
  refunded:   "bg-gray-100 text-gray-600",
};

const STATUS_DOT: Record<string, string> = {
  pending:    "bg-yellow-400",
  confirmed:  "bg-blue-400",
  processing: "bg-purple-400",
  shipped:    "bg-indigo-400",
  delivered:  "bg-green-500",
  cancelled:  "bg-red-400",
  refunded:   "bg-gray-400",
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_paise: number;
  created_at: string;
  shipping_address: Json;
};

const PAGE_SIZE = 10;

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        (((o.shipping_address as Record<string, unknown>)?.name as string) ?? "")
          .toLowerCase()
          .includes(q)
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(v: string) { setSearch(v); setPage(1); }

  function pageNumbers() {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  const thClass = "px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by order # or customer…"
            className="pl-8 h-9 text-sm bg-white"
          />
        </div>
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {pageItems.length === 0 ? (
        <div className="py-16 text-center">
          <Search className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className={thClass}>Order</th>
                <th className={thClass}>Customer</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Payment</th>
                <th className={thClass}>Date</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-brand-navy">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-sm">
                    {((order.shipping_address as Record<string, unknown>)?.name as string) ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.status] ?? "bg-gray-400"}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold capitalize ${
                      order.payment_status === "paid" ? "text-green-600"
                      : order.payment_status === "failed" ? "text-red-500"
                      : "text-yellow-600"
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-800">
                    {formatPrice(order.total_paise)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium text-brand-navy bg-brand-navy/8 hover:bg-brand-navy/15 transition-colors"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`el-${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === p ? "bg-brand-navy text-white" : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
