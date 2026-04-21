import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

// Get current user's profile. Returns null if not authenticated.
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

// Require authentication — opens auth modal via URL param if not logged in.
export async function requireAuth(next?: string): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    const dest = next
      ? `/?modal=login&next=${encodeURIComponent(next)}`
      : "/?modal=login";
    redirect(dest);
  }
  return profile;
}

// Require admin role — redirects to / if not admin.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) redirect("/?modal=login&next=%2Fadmin");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
