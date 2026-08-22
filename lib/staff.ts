import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffRole, type StaffRole } from "@/lib/auth";

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
};

export function displayName(metadata: unknown) {
  const data = metadata as { full_name?: string; name?: string } | undefined;
  return data?.full_name?.trim() || data?.name?.trim() || "";
}

export async function listStaff(): Promise<{
  users: StaffUser[];
  error: string | null;
}> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 100 });
    if (error) {
      return { users: [], error: error.message };
    }

    const users = (data.users ?? [])
      .map((user) => {
        const role = (user.app_metadata as { role?: string } | undefined)?.role;
        const email = user.email ?? "";
        if (!email || !isStaffRole(role)) {
          return null;
        }
        return {
          id: user.id,
          name: displayName(user.user_metadata),
          email,
          role,
        };
      })
      .filter((user): user is StaffUser => user !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    return { users, error: null };
  } catch (error) {
    return {
      users: [],
      error: error instanceof Error ? error.message : "Could not load staff.",
    };
  }
}
