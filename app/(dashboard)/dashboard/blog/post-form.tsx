"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import {
  BLOG_AUTHOR_MAX,
  BLOG_DEFAULT_AUTHOR,
  BLOG_EXCERPT_MAX,
  BLOG_IMAGE_MAX_BYTES,
  BLOG_META_DESCRIPTION_MAX,
  BLOG_META_TITLE_MAX,
  BLOG_RELATED_MAX,
  BLOG_TITLE_MAX,
  slugify,
  validateBlogPostCopy,
  type BlogPostDetail,
} from "@/lib/blog-fields";
import type { BlogCategoryRecord } from "@/lib/blog-category-fields";
import type { RelatedProductOption } from "@/lib/product-fields";
import { FieldSelect } from "@/components/field-select";
import { RelatedProductsPicker } from "@/components/related-products-picker";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeBlogPost, saveBlogPost } from "./actions";

type Result = { error: string | null; done?: boolean };

function isImageFile(file: File) {
  return file.type.startsWith("image/") && file.size <= BLOG_IMAGE_MAX_BYTES;
}

export function BlogPostForm({
  post,
  categories,
  catalog,
}: {
  post: BlogPostDetail | null;
  categories: Pick<BlogCategoryRecord, "id" | "title">[];
  catalog: RelatedProductOption[];
}) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);
  const previewRef = useRef<string | null>(null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? "",
  );
  const [authorName, setAuthorName] = useState(
    post?.authorName ?? BLOG_DEFAULT_AUTHOR,
  );
  const [categoryId, setCategoryId] = useState(
    post?.categoryId ?? (categories.length === 1 ? categories[0].id : 0),
  );
  const [relatedIds, setRelatedIds] = useState<number[]>(post?.relatedIds ?? []);
  const [preview, setPreview] = useState<string | null>(post?.imageUrl ?? null);
  const [localError, setLocalError] = useState<string | null>(null);

  const copyError = validateBlogPostCopy({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt.trim(),
    metaTitle: metaTitle.trim(),
    metaDescription: metaDescription.trim(),
    authorName: authorName.trim(),
    categoryId,
  });
  const canSave = !copyError && Boolean(preview);

  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      if (imageFileRef.current) {
        formData.set("image", imageFileRef.current);
      } else {
        formData.delete("image");
      }
      const result = await saveBlogPost(formData);
      if (result.done) {
        router.push("/dashboard/blog");
      }
      return result;
    },
    { error: null },
  );

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  function assignImage(file: File | null) {
    if (!file) {
      return;
    }
    if (!isImageFile(file)) {
      setLocalError("Choose an image up to 3 MB.");
      return;
    }
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    imageFileRef.current = file;
    setPreview(URL.createObjectURL(file));
    setLocalError(null);
  }

  function clearImage() {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    imageFileRef.current = null;
    setPreview(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="mt-10 flex max-w-2xl flex-col gap-10">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      {state.error || localError ? (
        <p className="text-sm text-danger">{localError ?? state.error}</p>
      ) : null}

      <input
        ref={imageRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => assignImage(event.target.files?.[0] ?? null)}
      />

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Image
        </p>
        {preview ? (
          <div className="relative mt-4 aspect-4/3 bg-surface">
            <Image
              src={preview}
              alt=""
              fill
              sizes="640px"
              unoptimized={preview.startsWith("blob:")}
              className="object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={clearImage}
              className="absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center bg-danger text-white"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              assignImage(event.dataTransfer.files[0] ?? null);
            }}
            className="mt-4 flex aspect-4/3 w-full flex-col items-center justify-center gap-3 border border-dashed border-foreground/25 bg-surface px-6 text-center transition-colors hover:border-foreground/50"
          >
            <ImagePlus className="size-8 text-muted-foreground" />
            <span className="caption tracking-[0.16em] uppercase">Add image</span>
            <span className="text-sm text-muted-foreground">
              Click or drop · JPG, PNG, or WebP · up to 3 MB
            </span>
          </button>
        )}
      </div>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Title
        </span>
        <Input
          name="title"
          value={title}
          maxLength={BLOG_TITLE_MAX}
          placeholder="Post title"
          onChange={(event) => {
            const value = event.target.value;
            setTitle(value);
            if (!slugTouched) {
              setSlug(slugify(value));
            }
          }}
          variant="box"
        />
      </label>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Slug
        </span>
        <Input
          name="slug"
          value={slug}
          placeholder="post-slug"
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          variant="box"
        />
      </label>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Category
          </span>
          <FieldSelect
            name="categoryId"
            value={categoryId ? String(categoryId) : ""}
            placeholder="Select category"
            options={categories.map((category) => ({
              value: String(category.id),
              label: category.title,
            }))}
            onChange={(id) => setCategoryId(Number(id))}
          />
        </div>
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Author
          </span>
          <Input
            name="authorName"
            value={authorName}
            maxLength={BLOG_AUTHOR_MAX}
            onChange={(event) => setAuthorName(event.target.value)}
            variant="box"
          />
        </label>
      </div>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Excerpt
        </span>
        <textarea
          name="excerpt"
          rows={3}
          maxLength={BLOG_EXCERPT_MAX}
          value={excerpt}
          placeholder="One or two sentences for the listing and search results"
          onChange={(event) => setExcerpt(event.target.value)}
          className="min-h-24 resize-none rounded-none border border-border bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:bg-background"
        />
        <span className="text-xs text-muted-foreground">
          {excerpt.trim().length}/{BLOG_EXCERPT_MAX}
        </span>
      </label>

      <RelatedProductsPicker
        catalog={catalog}
        productId={null}
        selectedIds={relatedIds}
        onChange={setRelatedIds}
        max={BLOG_RELATED_MAX}
        legend="Related products"
        hint={`Choose up to ${BLOG_RELATED_MAX} products to show on this post. They can be from any category or type.`}
      />

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Meta title
        </span>
        <Input
          name="metaTitle"
          value={metaTitle}
          maxLength={BLOG_META_TITLE_MAX}
          placeholder="Leave blank to use the post title"
          onChange={(event) => setMetaTitle(event.target.value)}
          variant="box"
        />
        <span className="text-xs text-muted-foreground">
          {metaTitle.trim().length}/{BLOG_META_TITLE_MAX}
        </span>
      </label>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Meta description
        </span>
        <textarea
          name="metaDescription"
          rows={3}
          maxLength={BLOG_META_DESCRIPTION_MAX}
          value={metaDescription}
          placeholder="Leave blank to use the excerpt"
          onChange={(event) => setMetaDescription(event.target.value)}
          className="min-h-24 resize-none rounded-none border border-border bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:bg-background"
        />
      </label>

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Content
        </p>
        <div className="mt-4">
          <RichTextEditor name="content" defaultValue={post?.content ?? ""} />
        </div>
      </div>

      <label className="flex items-center gap-3 border border-border bg-surface px-4 py-3 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={post?.isPublished ?? true}
          className="size-4 rounded-none accent-primary"
        />
        Visible on the store
      </label>

      <div className="flex flex-wrap items-center gap-6">
        <Button
          type="submit"
          disabled={pending || !canSave}
          className="h-11 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button asChild variant="ghost" className="h-11 px-0">
          <Link href="/dashboard/blog">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

export function DeleteBlogPostButton({ id }: { id: number }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeBlogPost(formData);
      if (result.done) {
        router.push("/dashboard/blog");
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="mt-16 max-w-2xl border-t border-border/80 pt-8">
      <input type="hidden" name="id" value={id} />
      {state.error ? <p className="mb-4 text-sm text-danger">{state.error}</p> : null}
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        className="h-11 px-0 text-danger hover:text-danger"
      >
        {pending ? "Deleting…" : "Delete post"}
      </Button>
    </form>
  );
}
