import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";

const FALLBACK_SUGGESTIONS = ["Rings", "Earrings", "Necklaces", "Bracelets", "Under ₹499"];

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  try {
    const supabase = createStaticClient();

    const [catResult, priceResult] = await Promise.all([
      supabase
        .from("categories")
        .select("name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("products")
        .select("price")
        .eq("is_active", true)
        .order("price", { ascending: true })
        .limit(1),
    ]);

    const words: string[] = [];

    // Add category names (1–3 words only to fit the UI)
    for (const cat of catResult.data ?? []) {
      const name = cat.name.trim();
      if (name.split(/\s+/).length <= 3) words.push(name);
    }

    // Add price hints derived from actual inventory min price
    const minPaise = priceResult.data?.[0]?.price ?? 49900;
    const minRupees = Math.ceil(minPaise / 100);
    if (minRupees <= 299) words.push("Under ₹299");
    if (minRupees <= 499) words.push("Under ₹499");
    words.push("Under ₹999");

    return NextResponse.json({
      suggestions: words.length >= 2 ? words : FALLBACK_SUGGESTIONS,
    });
  } catch {
    return NextResponse.json({ suggestions: FALLBACK_SUGGESTIONS });
  }
}
