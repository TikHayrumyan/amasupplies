"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, isStaffRole, type StaffRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function parseRole(value: string): StaffRole | null {
  return isStaffRole(value) ? value : null;
}

export async function updateOwnProfile(formData: FormData): Promise<Result> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/account");
  return { error: null, done: true };
}

export async function createStaffMember(formData: FormData): Promise<Result> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? ""));

  if (!name || !email || !password) {
    return { error: "Name, email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!role) {
    return { error: "Choose Admin or Manager." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
      app_metadata: { role },
    });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create user.",
    };
  }

  revalidatePath("/dashboard/account");
  return { error: null, done: true };
}

export async function updateStaffMember(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(String(formData.get("role") ?? ""));

  if (!id || !name || !email || !role) {
    return { error: "Name, email and role are required." };
  }
  if (password && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const admin = createAdminClient();
    const { data: existing, error: loadError } =
      await admin.auth.admin.getUserById(id);
    if (loadError || !existing.user) {
      return { error: loadError?.message ?? "User not found." };
    }

    const { error } = await admin.auth.admin.updateUserById(id, {
      email,
      ...(password ? { password } : {}),
      user_metadata: {
        ...existing.user.user_metadata,
        full_name: name,
      },
      app_metadata: {
        ...existing.user.app_metadata,
        role,
      },
    });
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update user.",
    };
  }

  revalidatePath("/dashboard/account");
  return { error: null, done: true };
}

export async function deleteStaffMember(formData: FormData): Promise<Result> {
  const { claims } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const selfId = typeof claims.sub === "string" ? claims.sub : "";

  if (!id) {
    return { error: "Missing user." };
  }
  if (id === selfId) {
    return { error: "You cannot delete your own account." };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete user.",
    };
  }

  revalidatePath("/dashboard/account");
  return { error: null, done: true };
}
