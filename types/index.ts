export * from "./database";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CartItem = {
  id: string;
  quantity: number;
  product_id: string;
  variant_id: string | null;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    image_public_ids: string[];
    stock: number;
  } | null;
  product_variants: {
    id: string;
    label: string;
    price_adjustment: number;
  } | null;
};
