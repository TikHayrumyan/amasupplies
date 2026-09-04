"use client";

import { useActionState, useCallback, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import {
  SIZE_TITLE_MAX,
  slugify,
  validateSizeCopy,
  type SizeRecord,
} from "@/lib/size-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { moveSize, removeSize, saveSize } from "./actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "edit"; size: SizeRecord | null }
  | { type: "delete"; size: SizeRecord }
  | null;

function SortableRow({
  size,
  onEdit,
  onDelete,
}: {
  size: SizeRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: size.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-4 border-b border-border/80 py-4",
        isDragging && "relative z-10 bg-background opacity-80",
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${size.title}`}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{size.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">/{size.slug}</p>
      </div>
      <button
        type="button"
        aria-label="Edit"
        className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Delete"
        className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-danger"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function SizeManager({ sizes }: { sizes: SizeRecord[] }) {
  const [items, setItems] = useState(sizes);
  const [panel, setPanel] = useState<Panel>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const close = useCallback(() => setPanel(null), []);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    const moved = next[newIndex];
    const result = await moveSize({
      id: moved.id,
      beforeId: next[newIndex - 1]?.id ?? null,
      afterId: next[newIndex + 1]?.id ?? null,
    });
    if (result.error) {
      setItems(previous);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-8 text-[13px] tracking-[0.12em]"
          onClick={() => setPanel({ type: "edit", size: null })}
        >
          <Plus />
          Add size
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No sizes yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-6">
              {items.map((size) => (
                <SortableRow
                  key={size.id}
                  size={size}
                  onEdit={() => setPanel({ type: "edit", size })}
                  onDelete={() => setPanel({ type: "delete", size })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Sheet open={panel !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto bg-background sm:max-w-md"
        >
          {panel?.type === "edit" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">
                  {panel.size ? "Edit size" : "Add size"}
                </SheetTitle>
                <SheetDescription>
                  Short labels only — S, L, 100 ml, 1 gallon.
                </SheetDescription>
              </SheetHeader>
              <SizeForm size={panel.size} onDone={close} />
            </>
          ) : null}
          {panel?.type === "delete" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete size</SheetTitle>
                <SheetDescription>
                  {panel.size.title} will be removed. Products using it must be
                  updated first.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm size={panel.size} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SizeForm({
  size,
  onDone,
}: {
  size: SizeRecord | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(size?.title ?? "");
  const [slug, setSlug] = useState(size?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(size));
  const copyError = validateSizeCopy(title.trim(), slug.trim());
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await saveSize(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {size ? <input type="hidden" name="id" value={size.id} /> : null}
      {state.error || copyError ? (
        <p className="text-sm text-danger">{state.error ?? copyError}</p>
      ) : null}
      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Name
        </span>
        <Input
          name="title"
          value={title}
          maxLength={SIZE_TITLE_MAX}
          onChange={(event) => {
            const value = event.target.value;
            setTitle(value);
            if (!slugTouched) {
              setSlug(slugify(value));
            }
          }}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Slug
        </span>
        <Input
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className={fieldClass}
        />
      </label>
      <Button
        type="submit"
        disabled={pending || Boolean(copyError)}
        className="h-11 rounded-none text-sm tracking-[0.16em] uppercase"
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function DeleteForm({
  size,
  onDone,
}: {
  size: SizeRecord;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeSize(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={size.id} />
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="flex gap-6">
        <Button type="button" variant="ghost" className="h-11 px-0" onClick={onDone}>
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
