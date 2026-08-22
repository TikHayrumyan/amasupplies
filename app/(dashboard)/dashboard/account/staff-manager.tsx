"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import {
  createStaffMember,
  deleteStaffMember,
  updateStaffMember,
} from "./actions";
import type { StaffUser } from "@/lib/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "add" }
  | { type: "edit"; user: StaffUser }
  | { type: "delete"; user: StaffUser }
  | null;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-3">
      <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function RoleSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="role"
      required
      defaultValue={defaultValue}
      className="h-11 border-0 border-b border-border bg-transparent text-sm outline-none focus-visible:border-foreground"
    >
      <option value="manager">Manager</option>
      <option value="admin">Admin</option>
    </select>
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
                    <button
                      type="button"
                      className="text-[13px] tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setPanel({ type: "edit", user })}
                    >
                      Edit
                    </button>
                    {user.id !== currentUserId ? (
                      <button
                        type="button"
                        className="ml-5 text-[13px] tracking-[0.08em] text-muted-foreground transition-colors hover:text-danger"
                        onClick={() => setPanel({ type: "delete", user })}
                      >
                        Delete
                      </button>
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
    async (_prev: Result, formData: FormData) => createStaffMember(formData),
    { error: null },
  );

  useEffect(() => {
    if (state.done) onDone();
  }, [state.done, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Field label="Name">
        <Input name="name" required autoComplete="off" className={fieldClass} />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          name="email"
          required
          autoComplete="off"
          className={fieldClass}
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
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
    async (_prev: Result, formData: FormData) => updateStaffMember(formData),
    { error: null },
  );

  useEffect(() => {
    if (state.done) onDone();
  }, [state.done, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={user.id} />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Field label="Name">
        <Input
          name="name"
          required
          defaultValue={user.name}
          className={fieldClass}
        />
      </Field>
      <Field label="Email">
        <Input
          type="email"
          name="email"
          required
          defaultValue={user.email}
          className={fieldClass}
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          name="password"
          minLength={8}
          autoComplete="new-password"
          placeholder="Unchanged"
          className={fieldClass}
        />
      </Field>
      <Field label="Role">
        <RoleSelect defaultValue={user.role} />
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
    async (_prev: Result, formData: FormData) => deleteStaffMember(formData),
    { error: null },
  );

  useEffect(() => {
    if (state.done) onDone();
  }, [state.done, onDone]);

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
