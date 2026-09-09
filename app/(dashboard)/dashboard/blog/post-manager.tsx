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
import Image from "next/image";
import Link from "next/link";
import type { BlogCategoryRecord } from "@/lib/blog-category-fields";
import {
  formatBlogDate,
  type BlogPostListItem,
} from "@/lib/blog-fields";
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
import { cn } from "@/lib/utils";
import { moveBlogPost, removeBlogPost } from "./actions";

type Result = { error: string | null; done?: boolean };

function SortableRow({
  post,
  sortable,
  showCategory,
  onDelete,
}: {
  post: BlogPostListItem;
  sortable: boolean;
  showCategory: boolean;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id, disabled: !sortable });

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
        <IconButton
          aria-label={`Reorder ${post.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </IconButton>
      ) : (
        <span className="size-8 shrink-0" />
      )}
      <div className="relative size-14 shrink-0 overflow-hidden bg-surface">
        <Image
          src={post.imageUrl}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{post.title}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {showCategory ? `${post.categoryTitle} · ` : ""}
          {formatBlogDate(post.publishedAt)}
          {post.isPublished ? "" : " · Hidden"}
        </p>
      </div>
      <IconButton asChild>
        <Link href={`/dashboard/blog/${post.id}`} aria-label="Edit">
          <Pencil className="size-4" />
        </Link>
      </IconButton>
      <IconButton aria-label="Delete" danger onClick={onDelete}>
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  );
}

export function BlogPostManager({
  posts,
  categories,
}: {
  posts: BlogPostListItem[];
  categories: Pick<BlogCategoryRecord, "id" | "title">[];
}) {
  const [items, setItems] = useState(posts);
  const [categoryId, setCategoryId] = useState(0);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<BlogPostListItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const close = useCallback(() => setPanel(null), []);

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
        item.excerpt.toLowerCase().includes(needle)
      );
    });
  }, [items, categoryId, query]);

  const sortable = !query.trim() && !categoryId;
  const ids = useMemo(() => visible.map((item) => item.id), [visible]);

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!sortable || !over || active.id === over.id) {
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
    const result = await moveBlogPost({
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
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap gap-8">
          <label className="flex min-w-40 flex-col gap-3">
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Category
            </span>
            <FieldSelect
              variant="line"
              value={String(categoryId)}
              placeholder="All"
              options={[
                { value: "0", label: "All" },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.title,
                })),
              ]}
              onChange={(id) => setCategoryId(Number(id))}
            />
          </label>
          <label className="flex min-w-48 flex-1 flex-col gap-3">
            <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Search
            </span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title or excerpt"
              variant="line"
            />
          </label>
        </div>
        {categories.length === 0 ? (
          <Button asChild variant="outline" className="h-8 text-[13px] tracking-[0.12em]">
            <Link href="/dashboard/blog/categories">
              <Plus />
              Add category
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-8 text-[13px] tracking-[0.12em]">
            <Link href="/dashboard/blog/new">
              <Plus />
              Add post
            </Link>
          </Button>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {categories.length === 0
          ? "Add a category first, then write a post."
          : sortable
            ? "Drag to set the order readers see on the blog."
            : "Clear search and category to reorder."}
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          {categories.length === 0 ? "No categories yet." : "No posts yet."}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="mt-6">
              {visible.map((post) => (
                <SortableRow
                  key={post.id}
                  post={post}
                  sortable={sortable}
                  showCategory={!categoryId}
                  onDelete={() => setPanel(post)}
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
                <SheetTitle className="font-medium">Delete post</SheetTitle>
                <SheetDescription>
                  {panel.title} will be removed from the blog.
                </SheetDescription>
              </SheetHeader>
              <DeleteForm post={panel} onDone={close} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DeleteForm({
  post,
  onDone,
}: {
  post: BlogPostListItem;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeBlogPost(formData);
      if (result.done) {
        onDone();
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="flex flex-col gap-8 px-6 pb-8">
      <input type="hidden" name="id" value={post.id} />
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
