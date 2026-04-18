import { getOrderById } from "@/app/actions/orders";
import { formatPrice } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { CheckCircle, Package, MapPin, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Confirmed" };

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();
  if (order.payment_status !== "paid") redirect("/checkout");

  const shippingAddress = order.shipping_address as {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };

  const orderItems = order.order_items as Array<{
    id: string;
    product_name: string;
    variant_label: string | null;
    quantity: number;
    price_paise: number;
    products: { images: string[]; image_public_ids: string[] } | null;
  }>;

  return (
    <div className="container-site py-10 md:py-16 max-w-2xl">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
            <CheckCircle className="h-9 w-9 text-green-500" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="heading-h1 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm">
          Thank you for your purchase. We&apos;ll send you a confirmation shortly.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-cream px-4 py-1.5">
          <span className="text-xs text-brand-text-muted font-medium">Order</span>
          <span className="text-sm font-semibold text-brand-navy">
            {order.order_number}
          </span>
        </div>
      </div>

      {/* Order details card */}
      <div className="rounded-lg border border-brand-border bg-white overflow-hidden">
        {/* Items */}
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-brand-gold" />
            <h2 className="font-poppins text-sm font-semibold text-brand-navy uppercase tracking-wide">
              Items Ordered
            </h2>
          </div>

          <ul className="divide-y divide-brand-border">
            {orderItems.map((item) => {
              const imageUrl = item.products?.images?.[0];
              return (
                <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-brand-cream">
                    <SafeImage
                      src={imageUrl}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text line-clamp-1">
                      {item.product_name}
                    </p>
                    {item.variant_label && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant_label}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-navy flex-shrink-0">
                    {formatPrice(item.price_paise * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <Separator />

        {/* Pricing summary */}
        <div className="px-5 md:px-6 py-4 space-y-2 text-sm bg-brand-cream/40">
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
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold text-base text-brand-navy">
            <span>Total Paid</span>
            <span>{formatPrice(order.total_paise)}</span>
          </div>
        </div>

        <Separator />

        {/* Shipping address */}
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-brand-gold" />
            <h2 className="font-poppins text-sm font-semibold text-brand-navy uppercase tracking-wide">
              Delivering To
            </h2>
          </div>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-brand-text">{shippingAddress.name}</p>
            <p>{shippingAddress.line1}{shippingAddress.line2 ? `, ${shippingAddress.line2}` : ""}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
            </p>
            <p className="text-xs text-gray-500 pt-0.5">{shippingAddress.phone}</p>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mt-6 rounded-lg border border-brand-border bg-white p-5 md:p-6">
        <h2 className="font-poppins text-sm font-semibold text-brand-navy uppercase tracking-wide mb-4">
          What&apos;s Next
        </h2>
        <ol className="space-y-3">
          {[
            { label: "Order Confirmed", done: true, desc: "Payment received" },
            { label: "Processing", done: false, desc: "We&apos;re preparing your order" },
            { label: "Shipped", done: false, desc: "Your jewellery is on its way" },
            { label: "Delivered", done: false, desc: "Enjoy your order!" },
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-green-500 text-white"
                    : "bg-brand-cream border border-brand-border text-brand-text-muted"
                }`}
              >
                {step.done ? "✓" : i + 1}
              </div>
              <div>
                <p className={`text-sm font-medium ${step.done ? "text-green-700" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.desc.replace(/&apos;/g, "'")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account" className={buttonVariants({ size: "lg" }) + " bg-brand-navy hover:bg-brand-navy-light text-white px-8"}>
          View My Orders
        </Link>
        <Link href="/collections/all" className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8 gap-2"}>
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
