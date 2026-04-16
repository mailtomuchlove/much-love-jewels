export * from "./database";

// ─── UI / Form Types ──────────────────────────────────────

export type CheckoutStep = "address" | "review" | "payment";

export type AddressFormData = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type CartAction =
  | { type: "add"; product_id: string; variant_id?: string; quantity: number }
  | { type: "remove"; item_id: string }
  | { type: "update"; item_id: string; quantity: number }
  | { type: "clear" };

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
