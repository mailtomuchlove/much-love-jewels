"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RazorpayButton } from "@/components/storefront/checkout/razorpay-button";
import { createAddress } from "@/app/actions/addresses";
import { formatPrice } from "@/lib/utils";
import { INDIAN_STATES } from "@/utils/constants";
import { addressSchema } from "@/utils/validators";
import { toast } from "sonner";
import type { Address, Profile } from "@/types";

interface CheckoutClientProps {
  profile: Profile;
  userEmail: string;
  addresses: Address[];
  cartItems: {
    id: string;
    quantity: number;
    products: { name: string; price: number; images: string[] } | null;
    product_variants: { label: string; price_adjustment: number } | null;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function CheckoutClient({
  profile,
  userEmail,
  addresses,
  cartItems,
  subtotal,
  shipping,
  total,
}: CheckoutClientProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? ""
  );
  const [showNewForm, setShowNewForm] = useState(addresses.length === 0);
  const [saving, setSaving] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  async function handleSaveAddress() {
    // Client-side validation before hitting the server
    const parsed = addressSchema.safeParse(newAddr);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      toast.error(firstError?.message ?? "Please check your address details");
      return;
    }

    setSaving(true);
    const result = await createAddress(newAddr);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSelectedAddressId(result.data.id);
    setShowNewForm(false);
    toast.success("Address saved!");
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Address */}
      <section className="rounded-lg border border-brand-border bg-white p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-bold">
            1
          </div>
          <h2 className="font-poppins text-base font-semibold text-brand-navy">
            Delivery Address
          </h2>
        </div>

        {/* Saved addresses */}
        {addresses.length > 0 && !showNewForm && (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-brand-navy bg-brand-cream"
                    : "border-brand-border hover:border-brand-navy/40"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-0.5 accent-brand-navy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-navy">
                    {addr.name}{" "}
                    {addr.is_default && (
                      <span className="ml-1 text-xs text-brand-gold font-normal">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                    {addr.state} — {addr.pincode}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                </div>
              </label>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </div>
        )}

        {/* New address form */}
        {showNewForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">Full Name</Label>
                <Input
                  value={newAddr.name}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your name"
                  className="mt-1 h-10"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">Phone</Label>
                <Input
                  value={newAddr.phone}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="10-digit mobile"
                  className="mt-1 h-10"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">Address Line 1</Label>
                <Input
                  value={newAddr.line1}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, line1: e.target.value }))
                  }
                  placeholder="House / Flat / Street"
                  className="mt-1 h-10"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">
                  Address Line 2{" "}
                  <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  value={newAddr.line2}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, line2: e.target.value }))
                  }
                  placeholder="Landmark / Area"
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">City</Label>
                <Input
                  value={newAddr.city}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="City"
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Pincode</Label>
                <Input
                  value={newAddr.pincode}
                  onChange={(e) =>
                    setNewAddr((p) => ({ ...p, pincode: e.target.value }))
                  }
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="mt-1 h-10"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-medium">State</Label>
                <Select
                  value={newAddr.state}
                  onValueChange={(v) =>
                    setNewAddr((p) => ({ ...p, state: v ?? "" }))
                  }
                >
                  <SelectTrigger className="mt-1 h-10">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSaveAddress}
                disabled={saving}
                className="bg-brand-navy hover:bg-brand-navy-light text-white"
              >
                {saving ? "Saving…" : "Save Address"}
              </Button>
              {addresses.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Step 2: Order Summary */}
      <section className="rounded-lg border border-brand-border bg-white p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-bold">
            2
          </div>
          <h2 className="font-poppins text-base font-semibold text-brand-navy">
            Order Summary
          </h2>
        </div>

        <ul className="divide-y divide-brand-border">
          {cartItems.map((item) => {
            const price =
              (item.products?.price ?? 0) +
              (item.product_variants?.price_adjustment ?? 0);
            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 flex-shrink-0 rounded-sm overflow-hidden bg-brand-cream">
                  <SafeImage
                    src={item.products?.images?.[0]}
                    alt={item.products?.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-text line-clamp-1">
                    {item.products?.name}
                  </p>
                  {item.product_variants && (
                    <p className="text-xs text-gray-500">
                      {item.product_variants.label}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-brand-navy flex-shrink-0">
                  {formatPrice(price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base text-brand-navy pt-1">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </section>

      {/* Step 3: Payment */}
      <section className="rounded-lg border border-brand-border bg-white p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-navy text-white text-xs font-bold">
            3
          </div>
          <h2 className="font-poppins text-base font-semibold text-brand-navy">
            Payment
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Secured by Razorpay. Supports UPI, cards, netbanking & wallets.
        </p>

        {selectedAddressId ? (
          <RazorpayButton
            addressId={selectedAddressId}
            userName={profile.name ?? "Customer"}
            userEmail={userEmail}
            userPhone={profile.phone ?? undefined}
          />
        ) : (
          <p className="text-sm text-red-500">
            Please select or add a delivery address first.
          </p>
        )}

        {/* Policy notice */}
        <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Please read before placing your order
          </p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2 text-xs text-amber-700">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>
                <strong>No returns or exchanges.</strong> All sales are final. We do not accept returns or exchanges on any orders.
              </span>
            </li>
            <li className="flex items-start gap-2 text-xs text-amber-700">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>
                <strong>Damage claims require an unboxing video.</strong> If you receive a damaged item, a clear unboxing video is mandatory to raise a replacement request. Claims without video proof will not be accepted.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
