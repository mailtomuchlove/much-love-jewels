"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function updateProfile(data: {
  name: string;
  phone?: string;
}): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ name: data.name, phone: data.phone ?? null })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  return { success: true, data: undefined };
}
