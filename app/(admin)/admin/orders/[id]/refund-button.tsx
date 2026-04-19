"use client";

import { useState } from "react";
import { refundOrder } from "@/app/actions/products";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export function RefundButton({
  orderId,
  orderNumber,
  totalFormatted,
}: {
  orderId: string;
  orderNumber: string;
  totalFormatted: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRefund() {
    setLoading(true);
    const result = await refundOrder(orderId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Refund processed successfully");
      router.refresh();
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={loading}
        className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing…" : "Issue Refund"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Issue full refund?</AlertDialogTitle>
          <AlertDialogDescription>
            This will refund <strong>{totalFormatted}</strong> to the customer for order{" "}
            <strong>{orderNumber}</strong> via Razorpay. Stock will be restored automatically.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRefund}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yes, Refund
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
