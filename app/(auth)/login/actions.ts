"use server";

import { createClient } from "@/lib/supabase/server";
import { isStaffRole, getRole } from "@/lib/auth";
import { redirect } from "next/navigation";

function safeNextPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? "/dashboard"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data } = await supabase.auth.getClaims();
  if (!isStaffRole(getRole(data?.claims))) {
    await supabase.auth.signOut();
    redirect("/login?error=forbidden");
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
