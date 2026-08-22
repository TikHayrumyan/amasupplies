"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null };

type HeroFormValues = {
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
};

export function HeroForm({
  hero,
  action,
}: {
  hero: HeroFormValues | null;
  action: (formData: FormData) => Promise<Result>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => action(formData),
    { error: null },
  );

  return (
    <form action={formAction} className="mt-10 flex max-w-xl flex-col gap-8">
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Title
        </span>
        <Input
          name="title"
          defaultValue={hero?.title ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Description
        </span>
        <textarea
          name="description"
          rows={4}
          defaultValue={hero?.description ?? ""}
          className="resize-y border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none focus-visible:border-foreground"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Image
        </span>
        {hero?.imageUrl ? (
          <p className="truncate text-sm text-muted-foreground">{hero.imageUrl}</p>
        ) : (
          <p className="text-sm text-muted-foreground">None</p>
        )}
        <Input type="file" name="image" accept="image/*" className="h-11 px-0 shadow-none" />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="clearImage" className="size-4" />
          Remove image
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Video
        </span>
        {hero?.videoUrl ? (
          <p className="truncate text-sm text-muted-foreground">{hero.videoUrl}</p>
        ) : (
          <p className="text-sm text-muted-foreground">None</p>
        )}
        <Input type="file" name="video" accept="video/*" className="h-11 px-0 shadow-none" />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="clearVideo" className="size-4" />
          Remove video
        </label>
      </div>

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
