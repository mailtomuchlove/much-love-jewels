"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { addressSchema } from "@/utils/validators";
import type { ActionResult, Address } from "@/types";

export async function getAddresses(): Promise<Address[]> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", profile.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createAddress(
  rawData: unknown
): Promise<ActionResult<Address>> {
  const profile = await requireAuth();
  const parsed = addressSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // If new address is default, unset others
  if (parsed.data.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({ user_id: profile.id, ...parsed.data })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { success: true, data };
}

export async function updateAddress(
  addressId: string,
  rawData: unknown
): Promise<ActionResult<Address>> {
  const profile = await requireAuth();
  const parsed = addressSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  if (parsed.data.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(parsed.data)
    .eq("id", addressId)
    .eq("user_id", profile.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { success: true, data };
}

export async function deleteAddress(
  addressId: string
): Promise<ActionResult<void>> {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", profile.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  return { success: true, data: undefined };
}

export async function setDefaultAddress(
  addressId: string
): Promise<ActionResult<void>> {
  const profile = await requireAuth();
  const supabase = await createClient();

  // Unset all, then set the one
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", profile.id);

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", profile.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/account");
  return { success: true, data: undefined };
}
