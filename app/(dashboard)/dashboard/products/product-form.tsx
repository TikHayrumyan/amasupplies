"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ImagePlus, Plus, X } from "lucide-react";
import {
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_ITEM_NUMBER_MAX,
  PRODUCT_META_DESCRIPTION_MAX,
  PRODUCT_META_TITLE_MAX,
  PRODUCT_SKU_MAX,
  PRODUCT_TITLE_MAX,
  slugify,
  validateProductCopy,
  type ProductDetail,
  type ProductImageRecord,
} from "@/lib/product-fields";
import type { ProductBrandRecord } from "@/lib/product-brand-fields";
import type { CategoryRecord } from "@/lib/category-fields";
import type { SizeRecord } from "@/lib/size-fields";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { removeProduct, saveProduct } from "./actions";

const fieldClass =
  "h-12 w-full rounded-none border border-border bg-surface px-4 text-sm shadow-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:bg-background focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };
type GalleryDraft = { file: File; url: string };

function isImageFile(file: File) {
  return file.type.startsWith("image/") && file.size <= PRODUCT_IMAGE_MAX_BYTES;
}

function RemoveMark({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className="absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center bg-danger text-white"
    >
      <X className="size-3.5" strokeWidth={2.5} />
    </button>
  );
}

function FieldSelect({
  name,
  value,
  placeholder,
  options,
  onChange,
}: {
  name: string;
  value: number;
  placeholder: string;
  options: { id: number; title: string }[];
  onChange: (id: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value || ""} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldClass, "flex items-center justify-between gap-3 text-left")}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground/60")}>
          {selected?.title ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto border border-border bg-background"
        >
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                role="option"
                aria-selected={option.id === value}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-11 w-full items-center px-4 text-left text-sm transition-colors hover:bg-surface",
                  option.id === value && "bg-surface",
                )}
              >
                {option.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ProductForm({
  product,
  categories,
  brands,
  sizes,
}: {
  product: ProductDetail | null;
  categories: Pick<CategoryRecord, "id" | "title">[];
  brands: Pick<ProductBrandRecord, "id" | "title">[];
  sizes: Pick<SizeRecord, "id" | "title">[];
}) {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<File | null>(null);
  const galleryItemsRef = useRef<GalleryDraft[]>([]);
  const mainPreviewRef = useRef<string | null>(null);
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [sku, setSku] = useState(product?.sku ?? "");
  const [itemNumber, setItemNumber] = useState(product?.itemNumber ?? "");
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    product?.metaDescription ?? "",
  );
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? 0);
  const [brandId, setBrandId] = useState(product?.brandId ?? 0);
  const [sizeIds, setSizeIds] = useState<number[]>(product?.sizeIds ?? []);
  const [mainPreview, setMainPreview] = useState<string | null>(
    product?.imageUrl ?? null,
  );
  const [keepGallery, setKeepGallery] = useState<ProductImageRecord[]>(
    product?.gallery ?? [],
  );
  const [galleryItems, setGalleryItems] = useState<GalleryDraft[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const copyError = validateProductCopy({
    title: title.trim(),
    slug: slug.trim(),
    sku: sku.trim(),
    itemNumber: itemNumber.trim(),
    metaTitle: metaTitle.trim(),
    metaDescription: metaDescription.trim(),
    categoryId,
    brandId,
  });
  const canSave = !copyError && Boolean(mainPreview);

  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      if (imageFileRef.current) {
        formData.set("image", imageFileRef.current);
      } else {
        formData.delete("image");
      }
      formData.delete("gallery");
      for (const item of galleryItems) {
        formData.append("gallery", item.file);
      }
      const result = await saveProduct(formData);
      if (result.done) {
        router.push("/dashboard/products");
      }
      return result;
    },
    { error: null },
  );

  useEffect(() => {
    galleryItemsRef.current = galleryItems;
  }, [galleryItems]);

  useEffect(() => {
    mainPreviewRef.current = mainPreview;
  }, [mainPreview]);

  useEffect(() => {
    return () => {
      if (mainPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(mainPreviewRef.current);
      }
      galleryItemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  function assignMain(file: File | null) {
    if (!file) {
      return;
    }
    if (!isImageFile(file)) {
      setLocalError("Choose an image up to 3 MB.");
      return;
    }
    if (mainPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPreview);
    }
    imageFileRef.current = file;
    setMainPreview(URL.createObjectURL(file));
    setLocalError(null);
  }

  function clearMain() {
    if (mainPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPreview);
    }
    imageFileRef.current = null;
    setMainPreview(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  }

  function addGalleryFiles(files: File[]) {
    const accepted = files.filter(isImageFile);
    if (accepted.length !== files.length) {
      setLocalError("Choose images up to 3 MB.");
    }
    if (accepted.length === 0) {
      return;
    }
    setGalleryItems((current) => [
      ...current,
      ...accepted.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    if (accepted.length === files.length) {
      setLocalError(null);
    }
    if (galleryRef.current) {
      galleryRef.current.value = "";
    }
  }

  function removeGalleryDraft(url: string) {
    setGalleryItems((current) => {
      const next = current.filter((item) => item.url !== url);
      const removed = current.find((item) => item.url === url);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="mt-10 flex max-w-2xl flex-col gap-10">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {state.error || localError ? (
        <p className="text-sm text-danger">{localError ?? state.error}</p>
      ) : null}

      <input
        ref={imageRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => assignMain(event.target.files?.[0] ?? null)}
      />
      <input
        ref={galleryRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => addGalleryFiles([...(event.target.files ?? [])])}
      />

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Main image
        </p>
        {mainPreview ? (
          <div className="relative mt-4 aspect-4/3 bg-surface">
            <Image
              src={mainPreview}
              alt=""
              fill
              sizes="640px"
              unoptimized={mainPreview.startsWith("blob:")}
              className="object-cover"
            />
            <RemoveMark label="Remove main image" onClick={clearMain} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              assignMain(event.dataTransfer.files[0] ?? null);
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

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Gallery
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Extra photos for the product page.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {keepGallery.map((image) => (
            <div key={image.id} className="relative aspect-square bg-surface">
              <input type="hidden" name="keepImageId" value={image.id} />
              <Image
                src={image.imageUrl}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <RemoveMark
                label="Remove gallery image"
                onClick={() =>
                  setKeepGallery((rows) => rows.filter((row) => row.id !== image.id))
                }
              />
            </div>
          ))}
          {galleryItems.map((item) => (
            <div key={item.url} className="relative aspect-square bg-surface">
              <Image
                src={item.url}
                alt=""
                fill
                sizes="200px"
                unoptimized
                className="object-cover"
              />
              <RemoveMark
                label="Remove gallery image"
                onClick={() => removeGalleryDraft(item.url)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addGalleryFiles([...event.dataTransfer.files]);
            }}
            className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-foreground/25 bg-surface text-center transition-colors hover:border-foreground/50"
          >
            <Plus className="size-6 text-muted-foreground" />
            <span className="caption tracking-[0.14em] uppercase">Add</span>
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Title
        </span>
        <Input
          name="title"
          value={title}
          maxLength={PRODUCT_TITLE_MAX}
          placeholder="Product name"
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
          placeholder="product-slug"
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-10 sm:grid-cols-2">
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            SKU
          </span>
          <Input
            name="sku"
            value={sku}
            maxLength={PRODUCT_SKU_MAX}
            placeholder="SKU-1001"
            onChange={(event) => setSku(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Item number
          </span>
          <Input
            name="itemNumber"
            value={itemNumber}
            maxLength={PRODUCT_ITEM_NUMBER_MAX}
            placeholder="ITM-1001"
            onChange={(event) => setItemNumber(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Category
        </span>
        <FieldSelect
          name="categoryId"
          value={categoryId}
          placeholder="Select category"
          options={categories}
          onChange={setCategoryId}
        />
      </div>
      <div className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Brand
        </span>
        <FieldSelect
          name="brandId"
          value={brandId}
          placeholder="Select brand"
          options={brands}
          onChange={setBrandId}
        />
      </div>
      </div>

      <fieldset>
        <legend className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Sizes
        </legend>
        {sizes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Add sizes first in Sizes.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {sizeIds.map((id) => (
              <input key={id} type="hidden" name="sizeId" value={id} />
            ))}
            {sizes.map((size) => {
              const selected = sizeIds.includes(size.id);
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    setSizeIds((current) =>
                      selected
                        ? current.filter((id) => id !== size.id)
                        : [...current, size.id],
                    );
                  }}
                  className={cn(
                    "h-10 border px-4 text-sm transition-colors",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-foreground hover:border-foreground/50",
                  )}
                >
                  {size.title}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Meta title
        </span>
        <Input
          name="metaTitle"
          value={metaTitle}
          maxLength={PRODUCT_META_TITLE_MAX}
          placeholder="Leave blank to use the product title"
          onChange={(event) => setMetaTitle(event.target.value)}
          className={fieldClass}
        />
        <span className="text-xs text-muted-foreground">
          {metaTitle.trim().length}/{PRODUCT_META_TITLE_MAX}
        </span>
      </label>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Meta description
        </span>
        <textarea
          name="metaDescription"
          rows={3}
          maxLength={PRODUCT_META_DESCRIPTION_MAX}
          value={metaDescription}
          placeholder="Short line for search results"
          onChange={(event) => setMetaDescription(event.target.value)}
          className="min-h-24 resize-none rounded-none border border-border bg-surface px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-foreground focus-visible:bg-background"
        />
      </label>

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Description
        </p>
        <div className="mt-4">
          <RichTextEditor
            name="description"
            defaultValue={product?.description ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 border border-border bg-surface px-4 py-3 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={product?.isPublished ?? true}
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
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

export function DeleteProductButton({ id }: { id: number }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      const result = await removeProduct(formData);
      if (result.done) {
        router.push("/dashboard/products");
      }
      return result;
    },
    { error: null },
  );

  return (
    <form action={formAction} className="mt-16 border-t border-border/80 pt-8">
      <input type="hidden" name="id" value={id} />
      {state.error ? <p className="mb-4 text-sm text-danger">{state.error}</p> : null}
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        className="h-11 px-0 text-danger hover:text-danger"
      >
        {pending ? "Deleting…" : "Delete product"}
      </Button>
    </form>
  );
}
