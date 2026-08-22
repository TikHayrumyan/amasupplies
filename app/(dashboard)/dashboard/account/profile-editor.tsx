"use client";

import { useActionState, useState } from "react";
import { updateOwnProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result = { error: string | null; done?: boolean };

export function ProfileEditor({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await updateOwnProfile(formData);
      if (result.done) {
        setEditing(false);
      }
      return result;
    },
    { error: null },
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.12em] text-muted-foreground uppercase">
            Account
          </p>
          <h1 className="mt-2 font-medium tracking-tight">{name || email}</h1>
          {name ? (
            <p className="mt-2 text-muted-foreground">{email}</p>
          ) : null}
          <p className="mt-3 caption tracking-[0.14em] text-muted-foreground uppercase">
            {role}
          </p>
        </div>
        {!editing ? (
          <Button
            type="button"
            variant="outline"
            className=" text-[13px] tracking-[0.12em]"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        ) : null}
      </div>

      {editing ? (
        <form action={formAction} className="mt-8 max-w-sm">
          {state.error ? (
            <p className="mb-4 text-sm text-danger">{state.error}</p>
          ) : null}
          <label className="flex flex-col gap-3">
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Name
            </span>
            <Input
              name="name"
              required
              defaultValue={name}
              className="h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0"
            />
          </label>
          <div className="mt-6 flex items-center gap-6">
            <Button
              type="submit"
              disabled={pending}
              className="h-10 rounded-none px-6 text-[13px] tracking-[0.12em] uppercase"
            >
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 text-[13px] tracking-[0.12em]"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
