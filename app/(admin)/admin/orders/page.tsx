import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { OrdersTable } from "./orders-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders | Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, total_paise, created_at, shipping_address")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-poppins text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders?.length ?? 0} total orders
        </p>
      </div>

      <OrdersTable orders={orders ?? []} />
    </div>
  );
}
