"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/use-razorpay";
import { createOrder, verifyPayment } from "@/app/actions/orders";
import { useGuestCart } from "@/store/cart-store";
import { toast } from "sonner";
import type { RazorpaySuccessResponse } from "@/types";

interface RazorpayButtonProps {
  addressId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

const RAZORPAY_CONFIGURED = !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
  !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes("xxxx");

export function RazorpayButton({
  addressId,
  userName,
  userEmail,
  userPhone,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { loaded, openRazorpay } = useRazorpay();

  if (!RAZORPAY_CONFIGURED) {
    return (
      <div className="w-full h-12 flex items-center justify-center rounded-lg bg-gray-100 border border-dashed border-gray-300">
        <p className="text-sm text-gray-500 font-medium">
          Online payments coming soon — contact us via WhatsApp to order
        </p>
      </div>
    );
  }
  const router = useRouter();
  const { clearCart } = useGuestCart();

  async function handlePayment() {
    if (!loaded) {
      toast.error("Payment system is loading, please wait...");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order (server-side price calculation + Razorpay order)
      const orderResult = await createOrder(addressId);
      if (!orderResult.success) {
        toast.error(orderResult.error);
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, keyId, orderNumber } =
        orderResult.data;

      // 2. Open Razorpay modal
      openRazorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "Much Love Jewels",
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#00192F",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          // 3. Verify payment signature (server-side)
          const verifyResult = await verifyPayment({
            orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (!verifyResult.success) {
            toast.error("Payment verification failed. Please contact support.");
            setLoading(false);
            return;
          }

          // 4. Clear guest cart and redirect
          clearCart();
          router.push(`/orders/${orderId}/success`);
        },
      });
    } catch (err) {
      Sentry.captureException(err);
      toast.error("Payment could not be completed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !loaded}
      className="w-full h-12 bg-brand-navy hover:bg-brand-navy-light text-white font-semibold text-base"
    >
      {loading ? "Processing…" : !loaded ? "Loading payment…" : "Pay Securely"}
    </Button>
  );
}
