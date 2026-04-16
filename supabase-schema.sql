-- ============================================================
-- Much Love Jewels — Complete Supabase Schema
-- Run this entire file in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: auto-update updated_at ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── Order number sequence ─────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ============================================================
-- TABLES
-- ============================================================

-- profiles (extends auth.users)
-- NOTE: is_admin() is defined AFTER this table so it can reference it
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  phone      text,
  role       text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Helper: check if current user is admin ───────────────────
-- Defined HERE (after profiles table exists) to avoid relation-not-found error
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  description text,
  image_url   text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- products (prices in PAISE — 1 INR = 100 paise)
CREATE TABLE IF NOT EXISTS public.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  description      text,
  price            int NOT NULL CHECK (price > 0),
  compare_price    int CHECK (compare_price > 0),
  images           text[] NOT NULL DEFAULT '{}',
  image_public_ids text[] NOT NULL DEFAULT '{}',
  category_id      uuid NOT NULL REFERENCES public.categories(id),
  stock            int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  material         text,
  weight_grams     numeric(6,2),
  is_active        boolean NOT NULL DEFAULT true,
  is_featured      boolean NOT NULL DEFAULT false,
  meta_title       text,
  meta_description text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_products_slug     ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_price    ON public.products(price);

-- product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label            text NOT NULL,
  size             text,
  material         text,
  price_adjustment int NOT NULL DEFAULT 0,
  stock            int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku              text UNIQUE,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity   int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Two partial indexes because NULL != NULL in UNIQUE constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_unique_with_variant
  ON public.cart_items(user_id, product_id, variant_id)
  WHERE variant_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_unique_no_variant
  ON public.cart_items(user_id, product_id)
  WHERE variant_id IS NULL;

-- wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text NOT NULL,
  line1      text NOT NULL,
  line2      text,
  city       text NOT NULL,
  state      text NOT NULL,
  pincode    char(6) NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      text UNIQUE NOT NULL,
  user_id           uuid REFERENCES auth.users(id),
  guest_email       text,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status    text NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal_paise    int NOT NULL,
  shipping_paise    int NOT NULL DEFAULT 0,
  total_paise       int NOT NULL,
  razorpay_order_id text UNIQUE,
  payment_id        text UNIQUE,
  shipping_address  jsonb NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX IF NOT EXISTS idx_orders_user      ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay  ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment   ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON public.orders(status);

-- order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id),
  variant_id    uuid REFERENCES public.product_variants(id),
  product_name  text NOT NULL,
  variant_label text,
  quantity      int NOT NULL CHECK (quantity > 0),
  price_paise   int NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- categories (public read, admin write)
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories"      ON public.categories FOR ALL   USING (is_admin());

-- products (public read active, admin write all)
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage products"      ON public.products FOR ALL   USING (is_admin());

-- product_variants (public read)
CREATE POLICY "Public read variants"   ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins manage variants" ON public.product_variants FOR ALL USING (is_admin());

-- cart_items
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- wishlist
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- orders
CREATE POLICY "Users read own orders"  ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage orders"   ON public.orders FOR ALL   USING (is_admin());

-- order_items
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()
  ));
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (is_admin());

-- reviews
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users insert own review"      ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage reviews"        ON public.reviews FOR ALL   USING (is_admin());

-- ============================================================
-- FUNCTIONS / RPC
-- ============================================================

-- Atomic stock decrement (called after payment confirmed)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_quantity int)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - p_quantity
  WHERE id = p_product_id AND stock >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock: %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE
-- After running:
--   1. Sign up with your admin email via the storefront
--   2. Run: UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
--      (find your UUID in Supabase Dashboard → Authentication → Users)
-- ============================================================
