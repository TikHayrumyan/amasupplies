import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const STAFF_ROLES = ["admin", "manager"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function getRole(claims: { app_metadata?: unknown } | null | undefined) {
  const appMetadata = claims?.app_metadata as { role?: string } | undefined;
  return appMetadata?.role;
}

export function isStaffRole(role: string | undefined): role is StaffRole {
  return role === "admin" || role === "manager";
}

export async function requireStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const role = getRole(data.claims);
  if (!isStaffRole(role)) {
    redirect("/login?error=forbidden");
  }

  return { claims: data.claims, role };
}

export async function requireAdmin() {
  const staff = await requireStaff();
  if (staff.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }
  return staff;
}
