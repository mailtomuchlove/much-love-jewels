"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/actions/products";
import { toast } from "sonner";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (status === currentStatus) return;
    setSaving(true);
    const result = await updateOrderStatus(orderId, status);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Order status updated");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-10 w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="bg-brand-navy hover:bg-brand-navy-light text-white h-10"
        size="sm"
      >
        {saving ? "Saving…" : "Update"}
      </Button>
    </div>
  );
}
