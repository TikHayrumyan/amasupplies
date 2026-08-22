import { requireAdmin } from "@/lib/auth";
import { displayName, listStaff } from "@/lib/staff";
import { ProfileEditor } from "./profile-editor";
import { StaffManager } from "./staff-manager";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { claims, role } = await requireAdmin();
  const { users, error } = await listStaff();
  const email = typeof claims.email === "string" ? claims.email : "";
  const currentUserId = typeof claims.sub === "string" ? claims.sub : "";
  const self = users.find((user) => user.id === currentUserId);
  const name = self?.name || displayName(claims.user_metadata);
  const staff = users.filter((user) => user.id !== currentUserId);

  return (
    <div className="container mx-auto px-4 py-12">
      <ProfileEditor name={name} email={email} role={role} />

      {error ? (
        <p className="mt-10 text-sm text-danger">{error}</p>
      ) : null}

      <StaffManager users={staff} currentUserId={currentUserId} />
    </div>
  );
}
