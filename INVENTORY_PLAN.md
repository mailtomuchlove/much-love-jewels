# Inventory Management — In-Store Sales

## Overview
Much Love runs both a physical store and the online jewellery website. When a product is sold in-store, the website stock must be decremented to prevent overselling. This plan adds a fast "Sold in Store" stock-adjustment flow — first to the admin web panel, then to the future admin mobile app.

---

## Existing Infrastructure (already built — reuse)

- `products.stock` and `product_variants.stock` — in DB with `CHECK (stock >= 0)`
- `decrement_stock(p_product_id, p_quantity, p_variant_id?)` — Supabase RPC, atomic
- `restore_stock()` — called in `app/actions/orders.ts` for refunds but **not yet defined in schema**
- Admin products table — `app/(admin)/admin/products/products-table.tsx` — color-coded stock display

---

## What to Build

### 1. Missing DB function — `restore_stock` RPC
Add to `supabase-schema.sql` and run in Supabase SQL editor:

```sql
CREATE OR REPLACE FUNCTION restore_stock(p_product_id uuid, p_quantity int, p_variant_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_variant_id IS NOT NULL THEN
    UPDATE product_variants SET stock = stock + p_quantity WHERE id = p_variant_id;
  ELSE
    UPDATE products SET stock = stock + p_quantity WHERE id = p_product_id;
  END IF;
END;
$$;
```

### 2. `stock_adjustments` audit table
Keeps history of every manual stock change for reconciliation.

```sql
CREATE TABLE stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  qty_change int NOT NULL,
  reason text NOT NULL DEFAULT 'in_store_sale',
  admin_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### 3. New server action — `adjustStockInStore`
File: `app/actions/products.ts`

```ts
// qty negative = sold in store, positive = restock
export async function adjustStockInStore(
  productId: string,
  qty: number,
  variantId?: string
): Promise<{ error?: string }> {
  // uses decrement_stock or restore_stock RPC
  // logs to stock_adjustments table
}
```

### 4. Quick-adjust UI on admin web panel
File: `app/(admin)/admin/products/products-table.tsx`

Add `±` button next to stock count. Opens inline popover:
- Quantity stepper (default 1)
- "Sold in Store" button → calls adjustStockInStore (decrement)
- "Restock" button → calls adjustStockInStore (increment)
- Refreshes row on success

### 5. Admin Mobile App — "Sold in Store" flow
Future React Native + Expo app (separate repo).

```
Products List → tap product → Product Detail
  → "Sold in Store" button
  → variant selector (if variants exist)
  → qty picker (stepper, default 1)
  → confirm → Supabase RPC call → updated stock shown inline
```

Bonus: scan product QR code → jump straight to that product's detail (`expo-barcode-scanner`).

---

## Implementation Order

1. Add `restore_stock` RPC to `supabase-schema.sql` → run in Supabase
2. Create `stock_adjustments` table in Supabase
3. Add `adjustStockInStore` to `app/actions/products.ts`
4. Add quick-adjust button + popover to admin products table
5. Build admin mobile app (after web panel is working)

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase-schema.sql` | Add `restore_stock` RPC + `stock_adjustments` table |
| `app/actions/products.ts` | Add `adjustStockInStore` server action |
| `app/(admin)/admin/products/products-table.tsx` | Add `±` quick-adjust button + popover |

---

## Verification

1. Admin → Products → click `±` on any product → enter 1 → "Sold in Store"
2. Stock count drops by 1 immediately
3. Try selling more than stock available → DB CHECK blocks it, error shown
4. Check `stock_adjustments` table in Supabase — adjustment entry appears
5. Mobile app: tap product → "Sold in Store" → confirm → stock updates
