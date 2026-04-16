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

// Require authentication — redirects to /auth/login if not logged in.
export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) redirect("/auth/login");
  return profile;
}

// Require admin role — redirects to / if not admin.
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
