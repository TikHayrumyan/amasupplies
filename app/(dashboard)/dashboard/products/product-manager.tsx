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
import Image from "next/image";
import Link from "next/link";
import type { CategoryRecord } from "@/lib/category-fields";
import type { ProductListItem } from "@/lib/product-fields";
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
import { moveProduct, removeProduct } from "./actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };

function SortableRow({
  product,
  sortable,
  showCategory,
  onDelete,
}: {
  product: ProductListItem;
  sortable: boolean;
  showCategory: boolean;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id, disabled: !sortable });

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
      {sortable ? (
        <button
          type="button"
          aria-label={`Reorder ${product.title}`}
          className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="size-8 shrink-0" />
      )}
      <div className="relative size-14 shrink-0 overflow-hidden bg-surface">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {product.brandTitle}
          {showCategory ? ` · ${product.categoryTitle}` : ""}
          {` · ${product.itemNumber}`}
          {product.isPublished ? "" : " · Hidden"}
        </p>
      </div>
      <Link
        href={`/dashboard/products/${product.id}`}
        aria-label="Edit"
        className="inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-4" />
      </Link>
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

export function ProductManager({
  products,
  categories,
}: {
  products: ProductListItem[];
  categories: Pick<CategoryRecord, "id" | "title">[];
}) {
  const [items, setItems] = useState(products);
  const [categoryId, setCategoryId] = useState(0);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<ProductListItem | null>(null);

  useEffect(() => {
    setItems(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryId && item.categoryId !== categoryId) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        item.title.toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle) ||
        item.itemNumber.toLowerCase().includes(needle)
      );
    });
  }, [items, categoryId, query]);

  const sortable = categoryId > 0 && query.trim() === "";
  const ids = useMemo(() => visible.map((item) => item.id), [visible]);
  const close = useCallback(() => setPanel(null), []);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!sortable || !over || active.id === over.id) {
      return;
    }
    const oldIndex = visible.findIndex((item) => item.id === active.id);
    const newIndex = visible.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }
    const previous = items;
    const nextVisible = arrayMove(visible, oldIndex, newIndex);
    const nextIds = new Set(nextVisible.map((item) => item.id));
    const next = [
      ...items.filter((item) => !nextIds.has(item.id)),
      ...nextVisible,
    ];
    setItems(next);
    const moved = nextVisible[newIndex];
    const result = await moveProduct({
      id: moved.id,
      categoryId,
      beforeId: nextVisible[newIndex - 1]?.id ?? null,
      afterId: nextVisible[newIndex + 1]?.id ?? null,
    });
    if (result.error) {
      setItems(previous);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap gap-8">
          <label className="flex min-w-40 flex-col gap-3">
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              className={fieldClass}
            >
              <option value={0}>All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-48 flex-1 flex-col gap-3">
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Search
            </span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, SKU, or item number"
              className={fieldClass}
            />
          </label>
        </div>
        <Button asChild variant="outline" className="h-8 text-[13px] tracking-[0.12em]">
          <Link href="/dashboard/products/new">
            <Plus />
            Add product
          </Link>
        </Button>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {sortable
          ? "Drag to set the order shoppers see in this category."
          : "Choose a category to reorder. Search turns off drag."}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No products yet.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-6">
              {visible.map((product) => (
                <SortableRow
                  key={product.id}
                  product={product}
                  sortable={sortable}
                  showCategory={!categoryId}
                  onDelete={() => setPanel(product)}
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
          {panel ? (
            <>
              <SheetHeader className="px-6 pt-8">
                <SheetTitle className="font-medium">Delete product</SheetTitle>
                <SheetDescription>
                  {panel.title} will be removed from the store.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm product={panel} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DeleteForm({
  product,
  onDone,
}: {
  product: ProductListItem;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeProduct(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={product.id} />
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
