import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { OrderStatusSelect } from "./order-status-select";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Detail | Admin" };

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
};

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, images))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as Record<string, string>;
  const orderItems = order.order_items as Array<{
    id: string;
    product_name: string;
    variant_label: string | null;
    quantity: number;
    price_paise: number;
    products: { name: string; images: string[] } | null;
  }>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-poppins text-2xl font-bold text-gray-900">
              {order.order_number}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(order.created_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium capitalize ${
              STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Update status */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-poppins text-sm font-semibold text-gray-800 mb-3">
          Update Order Status
        </h2>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Order items */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-poppins text-sm font-semibold text-gray-800">Items</h2>
        </div>
        <ul className="divide-y divide-gray-100 px-5">
          {orderItems.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {item.products?.images?.[0] && (
                  <Image
                    src={item.products.images[0]}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                {item.variant_label && (
                  <p className="text-xs text-gray-500">{item.variant_label}</p>
                )}
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                {formatPrice(item.price_paise * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="px-5 py-4 space-y-2 text-sm bg-gray-50">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_paise)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {order.shipping_paise === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                formatPrice(order.shipping_paise)
              )}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total_paise)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-poppins text-sm font-semibold text-gray-800 mb-3">
          Shipping Address
        </h2>
        <div className="text-sm text-gray-600 space-y-0.5">
          <p className="font-medium text-gray-900">{address.name}</p>
          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
          <p>{address.city}, {address.state} — {address.pincode}</p>
          <p className="text-xs text-gray-400 pt-0.5">{address.phone}</p>
        </div>
      </div>

      {/* Payment info */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-poppins text-sm font-semibold text-gray-800 mb-3">
          Payment
        </h2>
        <div className="text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span
              className={`font-medium capitalize ${
                order.payment_status === "paid"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {order.payment_status}
            </span>
          </div>
          {order.payment_id && (
            <div className="flex justify-between">
              <span className="text-gray-500">Payment ID</span>
              <span className="text-xs font-mono text-gray-700">{order.payment_id}</span>
            </div>
          )}
          {order.razorpay_order_id && (
            <div className="flex justify-between">
              <span className="text-gray-500">Razorpay Order</span>
              <span className="text-xs font-mono text-gray-700">{order.razorpay_order_id}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
