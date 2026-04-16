export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin";
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number; // paise
          compare_price: number | null; // paise
          images: string[];
          image_public_ids: string[];
          category_id: string;
          stock: number;
          material: string | null;
          weight_grams: number | null;
          is_active: boolean;
          is_featured: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          compare_price?: number | null;
          images?: string[];
          image_public_ids?: string[];
          category_id: string;
          stock?: number;
          material?: string | null;
          weight_grams?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          compare_price?: number | null;
          images?: string[];
          image_public_ids?: string[];
          category_id?: string;
          stock?: number;
          material?: string | null;
          weight_grams?: number | null;
          is_active?: boolean;
          is_featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          size: string | null;
          material: string | null;
          price_adjustment: number; // paise
          stock: number;
          sku: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          size?: string | null;
          material?: string | null;
          price_adjustment?: number;
          stock?: number;
          sku?: string | null;
        };
        Update: {
          label?: string;
          size?: string | null;
          material?: string | null;
          price_adjustment?: number;
          stock?: number;
          sku?: string | null;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
        };
        Update: {
          quantity?: number;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
        };
        Update: never;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          subtotal_paise: number;
          shipping_paise: number;
          total_paise: number;
          razorpay_order_id: string | null;
          payment_id: string | null;
          shipping_address: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          guest_email?: string | null;
          status?: string;
          payment_status?: string;
          subtotal_paise: number;
          shipping_paise?: number;
          total_paise: number;
          razorpay_order_id?: string | null;
          payment_id?: string | null;
          shipping_address: Json;
        };
        Update: {
          status?: string;
          payment_status?: string;
          razorpay_order_id?: string | null;
          payment_id?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          variant_label: string | null;
          quantity: number;
          price_paise: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id?: string | null;
          product_name: string;
          variant_label?: string | null;
          quantity: number;
          price_paise: number;
        };
        Update: never;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          is_approved?: boolean;
        };
        Update: {
          is_approved?: boolean;
          comment?: string | null;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number };
        Returns: void;
      };
    };
  };
}

// ─── Derived Row Types ─────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

// ─── Joined / Enriched Types ──────────────────────────────
export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug">;
  product_variants: ProductVariant[];
};

export type CartItemWithProduct = CartItem & {
  products: Pick<
    Product,
    "id" | "name" | "slug" | "images" | "image_public_ids" | "price" | "stock"
  >;
  product_variants: Pick<
    ProductVariant,
    "id" | "label" | "price_adjustment" | "stock"
  > | null;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, "id" | "name" | "images">;
  })[];
};

export type LocalCartItem = {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  // Enriched client-side only
  product?: Pick<
    Product,
    "id" | "name" | "slug" | "images" | "image_public_ids" | "price"
  >;
  variant?: Pick<
    ProductVariant,
    "id" | "label" | "price_adjustment"
  > | null;
};
