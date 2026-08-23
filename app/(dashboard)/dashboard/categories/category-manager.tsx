"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import Image from "next/image";
import {
  CATEGORY_DESCRIPTION_MAX,
  CATEGORY_IMAGE_MAX_BYTES,
  CATEGORY_TITLE_MAX,
  slugify,
  validateCategoryCopy,
} from "@/lib/category-fields";
import type { CategoryRecord } from "@/lib/category-fields";
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
import { moveCategory, removeCategory, saveCategory } from "./actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "edit"; category: CategoryRecord | null }
  | { type: "delete"; category: CategoryRecord }
  | null;

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

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
        aria-label={`Reorder ${category.title}`}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="relative size-14 shrink-0 overflow-hidden bg-surface">
        <Image
          src={category.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          /{category.slug}
          {category.isPublished ? "" : " · Hidden"}
        </p>
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

export function CategoryManager({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const [items, setItems] = useState(categories);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    setItems(categories);
  }, [categories]);

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
    const result = await moveCategory({
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
          onClick={() => setPanel({ type: "edit", category: null })}
        >
          <Plus />
          Add category
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No categories yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-6">
              {items.map((category) => (
                <SortableRow
                  key={category.id}
                  category={category}
                  onEdit={() => setPanel({ type: "edit", category })}
                  onDelete={() => setPanel({ type: "delete", category })}
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
                  {panel.category ? "Edit category" : "Add category"}
                </SheetTitle>
                <SheetDescription>
                  Image is required. Slug is the public URL.
                </SheetDescription>
              </SheetHeader>
              <CategoryForm category={panel.category} onDone={close} />
            </>
          ) : null}

          {panel?.type === "delete" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete category</SheetTitle>
                <SheetDescription>
                  {panel.category.title} will be removed from the store.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm category={panel.category} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category: CategoryRecord | null;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [title, setTitle] = useState(category?.title ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [description, setDescription] = useState(category?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const preview = localUrl ?? category?.imageUrl ?? null;
  const copyError = validateCategoryCopy(title.trim(), slug.trim(), description.trim());
  const canSave = !copyError && Boolean(preview);

  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      if (fileRef.current) {
        formData.set("image", fileRef.current);
      }
      const result = await saveCategory(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  useEffect(() => {
    return () => {
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [localUrl]);

  function assignFile(next: File | null) {
    if (!next) {
      return;
    }
    if (next.size > CATEGORY_IMAGE_MAX_BYTES) {
      setLocalError("File is larger than 3 MB.");
      return;
    }
    if (!next.type.startsWith("image/")) {
      setLocalError("Choose an image file.");
      return;
    }
    fileRef.current = next;
    setFile(next);
    setLocalUrl(URL.createObjectURL(next));
    setLocalError(null);
    const transfer = new DataTransfer();
    transfer.items.add(next);
    if (inputRef.current) {
      inputRef.current.files = transfer.files;
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {state.error || localError ? (
        <p className="text-sm text-danger">{localError ?? state.error}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => assignFile(event.target.files?.[0] ?? null)}
      />

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Image
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            assignFile(event.dataTransfer.files[0] ?? null);
          }}
          className="mt-4 block w-full border border-dashed border-border px-5 py-6 text-left"
        >
          {preview ? (
            <span className="relative block aspect-4/3 w-full overflow-hidden">
              <Image
                src={preview}
                alt=""
                fill
                sizes="360px"
                unoptimized={preview.startsWith("blob:")}
                className="object-cover"
              />
            </span>
          ) : (
            <>
              <p className="text-sm">Drop an image here, or browse</p>
              <p className="mt-2 text-sm text-muted-foreground">
                JPG, PNG, or WebP, up to 3 MB
              </p>
            </>
          )}
        </button>
        {file ? (
          <p className="mt-2 text-sm text-muted-foreground">{file.name}</p>
        ) : null}
      </div>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Title
        </span>
        <Input
          name="title"
          value={title}
          maxLength={CATEGORY_TITLE_MAX}
          onChange={(event) => {
            const value = event.target.value;
            setTitle(value);
            if (!slugTouched) {
              setSlug(slugify(value));
            }
          }}
          className={fieldClass}
        />
        <span className="text-xs text-muted-foreground">
          {title.trim().length}/{CATEGORY_TITLE_MAX}
        </span>
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

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Description
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={CATEGORY_DESCRIPTION_MAX}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none focus-visible:border-foreground"
        />
        <span className="text-xs text-muted-foreground">
          {description.trim().length}/{CATEGORY_DESCRIPTION_MAX}
        </span>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={category?.isPublished ?? true}
          className="size-4"
        />
        Visible on the store
      </label>

      <Button
        type="submit"
        disabled={pending || !canSave}
        className="h-11 rounded-none text-sm tracking-[0.16em] uppercase"
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function DeleteForm({
  category,
  onDone,
}: {
  category: CategoryRecord;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeCategory(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={category.id} />
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
