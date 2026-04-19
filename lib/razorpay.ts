import crypto from "crypto";

// Dynamic import so the razorpay package never loads at build time
export async function createRazorpayOrder(amount: number, currency: string, receipt: string) {
  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return client.orders.create({ amount, currency, receipt });
}

export async function createRazorpayRefund(paymentId: string, amountPaise: number) {
  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return client.payments.refund(paymentId, {
    amount: amountPaise,
    speed: "normal",
  });
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}
