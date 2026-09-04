"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
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
import type { CategoryRecord } from "@/lib/category-fields";
import {
  PRODUCT_TYPE_TITLE_MAX,
  slugify,
  validateProductTypeCopy,
  type ProductTypeRecord,
} from "@/lib/product-type-fields";
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
import { moveProductType, removeProductType, saveProductType } from "./type-actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "edit"; productType: ProductTypeRecord | null }
  | { type: "delete"; productType: ProductTypeRecord }
  | null;

function SortableRow({
  productType,
  onEdit,
  onDelete,
}: {
  productType: ProductTypeRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: productType.id });

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
        aria-label={`Reorder ${productType.title}`}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{productType.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          /{productType.slug}
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

export function TypeManager({
  category,
  types,
  open,
  onClose,
}: {
  category: CategoryRecord | null;
  types: ProductTypeRecord[];
  open: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState(types);
  const [panel, setPanel] = useState<Panel>(null);

  useEffect(() => {
    setItems(types);
  }, [types]);

  useEffect(() => {
    if (!open) {
      setPanel(null);
    }
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const closePanel = useCallback(() => setPanel(null), []);

  async function onDragEnd(event: DragEndEvent) {
    if (!category) {
      return;
    }
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
    const result = await moveProductType({
      id: moved.id,
      categoryId: category.id,
      beforeId: next[newIndex - 1]?.id ?? null,
      afterId: next[newIndex + 1]?.id ?? null,
    });
    if (result.error) {
      setItems(previous);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto bg-background sm:max-w-md"
      >
        {panel?.type === "edit" && category ? (
          <>
            <SheetHeader className="px-6 pt-8">
              <SheetTitle className="font-medium">
                {panel.productType ? "Edit type" : "Add type"}
              </SheetTitle>
              <SheetDescription>
                Types belong to {category.title}. Slug is used in filters.
              </SheetDescription>
            </SheetHeader>
            <TypeForm
              categoryId={category.id}
              productType={panel.productType}
              onDone={closePanel}
              onBack={closePanel}
            />
          </>
        ) : null}

        {panel?.type === "delete" && category ? (
          <>
            <SheetHeader className="px-6 pt-8">
              <SheetTitle className="font-medium">Delete type</SheetTitle>
              <SheetDescription>
                {panel.productType.title} will be removed. Products using it
                must be updated first.
              </SheetDescription>
            </SheetHeader>
            <DeleteForm
              categoryId={category.id}
              productType={panel.productType}
              onDone={closePanel}
            />
          </>
        ) : null}

        {panel === null && category ? (
          <>
            <SheetHeader className="px-6 pt-8">
              <SheetTitle className="font-medium">Types</SheetTitle>
              <SheetDescription>
                These become Type filters on the {category.title} page. Leave
                empty if this category does not need them.
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-8">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-[13px] tracking-[0.12em]"
                  onClick={() => setPanel({ type: "edit", productType: null })}
                >
                  <Plus />
                  Add type
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="mt-10 text-muted-foreground">No types yet.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={ids}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="mt-6">
                      {items.map((productType) => (
                        <SortableRow
                          key={productType.id}
                          productType={productType}
                          onEdit={() =>
                            setPanel({ type: "edit", productType })
                          }
                          onDelete={() =>
                            setPanel({ type: "delete", productType })
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function TypeForm({
  categoryId,
  productType,
  onDone,
  onBack,
}: {
  categoryId: number;
  productType: ProductTypeRecord | null;
  onDone: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(productType?.title ?? "");
  const [slug, setSlug] = useState(productType?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(productType));
  const copyError = validateProductTypeCopy(title.trim(), slug.trim());
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await saveProductType(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {productType ? <input type="hidden" name="id" value={productType.id} /> : null}
      <input type="hidden" name="categoryId" value={categoryId} />
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
          maxLength={PRODUCT_TYPE_TITLE_MAX}
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
      <div className="flex items-center gap-6">
        <Button
          type="submit"
          disabled={pending || Boolean(copyError)}
          className="h-11 rounded-none text-sm tracking-[0.16em] uppercase"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="ghost" className="h-11 px-0" onClick={onBack}>
          Back
        </Button>
      </div>
    </form>
  );
}

function DeleteForm({
  categoryId,
  productType,
  onDone,
}: {
  categoryId: number;
  productType: ProductTypeRecord;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeProductType(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={productType.id} />
      <input type="hidden" name="categoryId" value={categoryId} />
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
