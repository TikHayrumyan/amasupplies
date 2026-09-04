"use client";

import { useActionState, useCallback, useState } from "react";
import {
  createStaffMember,
  deleteStaffMember,
  updateStaffMember,
} from "./actions";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import type { StaffUser } from "@/lib/staff";
import { Field } from "@/components/field";
import { FieldSelect } from "@/components/field-select";
import { IconButton } from "@/components/icon-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "add" }
  | { type: "edit"; user: StaffUser }
  | { type: "delete"; user: StaffUser }
  | null;

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

function RoleSelect({ defaultValue }: { defaultValue: string }) {
  const [role, setRole] = useState(defaultValue);
  return (
    <FieldSelect
      name="role"
      value={role}
      placeholder="Select role"
      options={ROLE_OPTIONS}
      onChange={setRole}
      variant="line"
    />
  );
}

export function StaffManager({
  users,
  currentUserId,
}: {
  users: StaffUser[];
  currentUserId: string;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Staff
          </p>
          <p className="mt-2 text-muted-foreground">
            Admins and managers who can open the dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-8 text-[13px] tracking-[0.12em]"
          onClick={() => setPanel({ type: "add" })}
        >
          <UserPlus />
          Add user
        </Button>
      </div>

      {users.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No staff yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-xl text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-4 font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Name
                </th>
                <th className="py-3 pr-4 font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Email
                </th>
                <th className="py-3 pr-4 font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  Role
                </th>
                <th className="py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/80">
                  <td className="py-4 pr-4">{user.name}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{user.email}</td>
                  <td className="py-4 pr-4 tracking-[0.08em] uppercase">
                    {user.role}
                  </td>
                  <td className="py-4 text-right">
                    <IconButton
                      aria-label="Edit"
                      onClick={() => setPanel({ type: "edit", user })}
                    >
                      <Pencil className="size-4" />
                    </IconButton>
                    {user.id !== currentUserId ? (
                      <IconButton
                        aria-label="Delete"
                        danger
                        className="ml-1"
                        onClick={() => setPanel({ type: "delete", user })}
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={panel !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent
          side="right"
          className="w-full gap-0 bg-background sm:max-w-md"
        >
          {panel?.type === "add" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Add user</SheetTitle>
                <SheetDescription>
                  They can sign in to the dashboard with this email.
                </SheetDescription>
              </SheetHeader>
              <AddForm onDone={close} />
            </>
          ) : null}

          {panel?.type === "edit" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Edit user</SheetTitle>
                <SheetDescription>
                  Leave password empty to keep the current one.
                </SheetDescription>
              </SheetHeader>
              <EditForm user={panel.user} onDone={close} />
            </>
          ) : null}

          {panel?.type === "delete" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete user</SheetTitle>
                <SheetDescription>
                  {panel.user.name} ({panel.user.email}) will no longer be able
                  to sign in.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm user={panel.user} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await createStaffMember(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Field label="Name">
        <Input name="name" required autoComplete="off" variant="line" />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          name="email"
          required
          autoComplete="off"
          variant="line"
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          variant="line"
        />
      </Field>
      <Field label="Role">
        <RoleSelect defaultValue="manager" />
      </Field>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-none text-sm tracking-[0.16em] uppercase"
      >
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}

function EditForm({
  user,
  onDone,
}: {
  user: StaffUser;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await updateStaffMember(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={user.id} />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Field label="Name">
        <Input
          name="name"
          required
          defaultValue={user.name}
          variant="line"
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          name="email"
          required
          defaultValue={user.email}
          variant="line"
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          name="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Unchanged"
          variant="line"
        />
      </Field>
      <Field label="Role">
        <RoleSelect key={user.id} defaultValue={user.role} />
      </Field>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-none text-sm tracking-[0.16em] uppercase"
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function DeleteForm({
  user,
  onDone,
}: {
  user: StaffUser;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await deleteStaffMember(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={user.id} />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="flex gap-6">
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-0"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          variant="ghost"
          className="h-11 px-0 text-danger hover:text-danger"
        >
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </form>
  );
}
