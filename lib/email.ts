import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "Much Love Jewels <orders@muchlovejewels.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@muchlovejewels.com";

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  items: { name: string; variant?: string | null; quantity: number; pricePaise: number }[];
  subtotalPaise: number;
  shippingPaise: number;
  totalPaise: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
};

function inr(paise: number) {
  return "₹" + (paise / 100).toLocaleString("en-IN");
}

function itemRows(items: OrderEmailData["items"]) {
  return items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #EAE0D5;font-size:14px;color:#2C1A0E;">
          ${item.name}${item.variant ? ` <span style="color:#7A6652;">(${item.variant})</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #EAE0D5;font-size:14px;color:#7A6652;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #EAE0D5;font-size:14px;color:#2C1A0E;text-align:right;">
          ${inr(item.pricePaise * item.quantity)}
        </td>
      </tr>`
    )
    .join("");
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#FBF8F3;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F3;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(44,26,14,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#2C1A0E;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.5px;">
              Much Love <span style="color:#C4956A;">Jewels</span>
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F4EDE1;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#7A6652;">
              Questions? Reply to this email or WhatsApp us.<br>
              &copy; ${new Date().getFullYear()} Much Love Jewels. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function customerConfirmationHtml(data: OrderEmailData) {
  const addr = data.shippingAddress;
  const body = `
    <h1 style="margin:0 0 4px;font-size:24px;color:#2C1A0E;">Order Confirmed!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#7A6652;">
      Hi ${data.customerName}, thank you for your order. We'll start preparing it right away.
    </p>

    <div style="background:#FBF8F3;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#7A6652;text-transform:uppercase;letter-spacing:0.8px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#C4956A;">${data.orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:left;letter-spacing:0.6px;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:center;letter-spacing:0.6px;">Qty</th>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:right;letter-spacing:0.6px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(data.items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#7A6652;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#2C1A0E;text-align:right;">${inr(data.subtotalPaise)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#7A6652;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#2C1A0E;text-align:right;">${data.shippingPaise === 0 ? "Free" : inr(data.shippingPaise)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#2C1A0E;border-top:2px solid #EAE0D5;">Total</td>
        <td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#C4956A;text-align:right;border-top:2px solid #EAE0D5;">${inr(data.totalPaise)}</td>
      </tr>
    </table>

    <div style="border:1px solid #EAE0D5;border-radius:6px;padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#7A6652;text-transform:uppercase;letter-spacing:0.8px;">Shipping to</p>
      <p style="margin:0;font-size:14px;color:#2C1A0E;line-height:1.7;">
        ${addr.name}<br>
        ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br>
        ${addr.city}, ${addr.state} — ${addr.pincode}<br>
        Phone: ${addr.phone}
      </p>
    </div>`;

  return baseTemplate(`Order Confirmed — ${data.orderNumber}`, body);
}

function adminNotificationHtml(data: OrderEmailData) {
  const addr = data.shippingAddress;
  const body = `
    <h1 style="margin:0 0 20px;font-size:22px;color:#2C1A0E;">New Order Received</h1>

    <div style="background:#FBF8F3;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#7A6652;text-transform:uppercase;letter-spacing:0.8px;">Order Number</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#C4956A;">${data.orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:left;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:center;">Qty</th>
          <th style="padding:8px 0;border-bottom:2px solid #2C1A0E;font-size:12px;color:#7A6652;text-transform:uppercase;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(data.items)}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#7A6652;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#2C1A0E;text-align:right;">${inr(data.subtotalPaise)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#7A6652;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#2C1A0E;text-align:right;">${data.shippingPaise === 0 ? "Free" : inr(data.shippingPaise)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#2C1A0E;border-top:2px solid #EAE0D5;">Total</td>
        <td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#C4956A;text-align:right;border-top:2px solid #EAE0D5;">${inr(data.totalPaise)}</td>
      </tr>
    </table>

    <div style="border:1px solid #EAE0D5;border-radius:6px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;color:#7A6652;text-transform:uppercase;letter-spacing:0.8px;">Ship to</p>
      <p style="margin:0;font-size:14px;color:#2C1A0E;line-height:1.7;">
        ${addr.name}<br>
        ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br>
        ${addr.city}, ${addr.state} — ${addr.pincode}<br>
        Phone: ${addr.phone}
      </p>
    </div>`;

  return baseTemplate(`New Order — ${data.orderNumber}`, body);
}

export async function sendOrderConfirmationEmail(to: string, data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Order Confirmed — ${data.orderNumber} | Much Love Jewels`,
      html: customerConfirmationHtml(data),
    });
  } catch (err) {
    console.error("[email] Failed to send order confirmation:", err);
  }
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `🛍️ New Order — ${data.orderNumber} (${inr(data.totalPaise)})`,
      html: adminNotificationHtml(data),
    });
  } catch (err) {
    console.error("[email] Failed to send admin notification:", err);
  }
}
