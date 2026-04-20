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
        Relationships: [];
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
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          compare_price: number | null;
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
          product_code: string | null;
          tags: string[];
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
          product_code?: string | null;
          tags?: string[];
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
          product_code?: string | null;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          size: string | null;
          material: string | null;
          price_adjustment: number;
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
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          }
        ];
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
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
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
      upsert_cart_item_with_variant: {
        Args: {
          p_user_id: string;
          p_product_id: string;
          p_variant_id: string;
          p_quantity: number;
        };
        Returns: void;
      };
      get_dashboard_stats: {
        Args: Record<never, never>;
        Returns: { total_revenue: number; total_orders: number; pending_count: number };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
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
