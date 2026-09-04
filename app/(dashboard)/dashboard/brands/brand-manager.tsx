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
  PRODUCT_BRAND_TITLE_MAX,
  validateProductBrandCopy,
  type ProductBrandRecord,
} from "@/lib/product-brand-fields";
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
import { moveBrand, removeBrand, saveBrand } from "./actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type Panel =
  | { type: "edit"; brand: ProductBrandRecord | null }
  | { type: "delete"; brand: ProductBrandRecord }
  | null;

function SortableRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand: ProductBrandRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: brand.id });

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
        aria-label={`Reorder ${brand.title}`}
        className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <p className="min-w-0 flex-1 truncate font-medium">{brand.title}</p>
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

export function BrandManager({ brands }: { brands: ProductBrandRecord[] }) {
  const [items, setItems] = useState(brands);
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
    const result = await moveBrand({
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
          onClick={() => setPanel({ type: "edit", brand: null })}
        >
          <Plus />
          Add brand
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No brands yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-6">
              {items.map((brand) => (
                <SortableRow
                  key={brand.id}
                  brand={brand}
                  onEdit={() => setPanel({ type: "edit", brand })}
                  onDelete={() => setPanel({ type: "delete", brand })}
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
                  {panel.brand ? "Edit brand" : "Add brand"}
                </SheetTitle>
                <SheetDescription>
                  The name shown on the product card and product page.
                </SheetDescription>
              </SheetHeader>
              <BrandForm brand={panel.brand} onDone={close} />
            </>
          ) : null}
          {panel?.type === "delete" ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete brand</SheetTitle>
                <SheetDescription>
                  {panel.brand.title} will be removed. Products using it must be
                  updated first.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm brand={panel.brand} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BrandForm({
  brand,
  onDone,
}: {
  brand: ProductBrandRecord | null;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(brand?.title ?? "");
  const copyError = validateProductBrandCopy(title.trim());
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await saveBrand(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      {brand ? <input type="hidden" name="id" value={brand.id} /> : null}
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
          maxLength={PRODUCT_BRAND_TITLE_MAX}
          onChange={(event) => setTitle(event.target.value)}
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
  brand,
  onDone,
}: {
  brand: ProductBrandRecord;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeBrand(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={brand.id} />
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
