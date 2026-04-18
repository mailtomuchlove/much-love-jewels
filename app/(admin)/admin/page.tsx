import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/stats-cards";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | Admin" };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [statsResult, productsResult, recentOrdersResult] = await Promise.all([
    // Aggregate via DB function — avoids fetching all rows as order volume grows
    supabase.rpc("get_dashboard_stats"),
    supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
    supabase
      .from("orders")
      .select("id, order_number, status, total_paise, created_at, payment_status")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const stats = statsResult.data as {
    total_revenue: number;
    total_orders: number;
    pending_count: number;
  } | null;
  const revenue = stats?.total_revenue ?? 0;
  const pendingCount = stats?.pending_count ?? 0;
  const orderCount = stats?.total_orders ?? 0;
  const productCount = productsResult.count ?? 0;
  const recentOrders = recentOrdersResult.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-poppins text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your store&apos;s performance.</p>
      </div>

      <StatsCards
        revenue={revenue}
        orderCount={orderCount}
        productCount={productCount}
        pendingCount={pendingCount}
      />

      {/* Recent orders */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-poppins text-sm font-semibold text-gray-800">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-brand-navy hover:underline font-medium"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500 p-6">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Order</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-brand-navy hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">
                    {formatPrice(order.total_paise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
