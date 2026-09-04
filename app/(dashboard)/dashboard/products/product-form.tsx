"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "@/lib/product-fields";
import type { ProductBrandRecord } from "@/lib/product-brand-fields";
import type { CategoryRecord } from "@/lib/category-fields";
import type { SizeRecord } from "@/lib/size-fields";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeProduct, saveProduct } from "./actions";

const fieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

type Result = { error: string | null; done?: boolean };

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
  const imageFileRef = useRef<File | null>(null);
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
  const [keepGallery, setKeepGallery] = useState(product?.gallery ?? []);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
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
    return () => {
      if (mainPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(mainPreview);
      }
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mainPreview, galleryPreviews]);

  function assignMain(file: File | null) {
    if (!file) {
      return;
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES || !file.type.startsWith("image/")) {
      setLocalError("Choose an image up to 3 MB.");
      return;
    }
    imageFileRef.current = file;
    setMainPreview(URL.createObjectURL(file));
    setLocalError(null);
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
        name="image"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => assignMain(event.target.files?.[0] ?? null)}
      />

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Main image
        </p>
        <button
          type="button"
          onClick={() => imageRef.current?.click()}
          className="mt-4 block w-full border border-dashed border-border px-5 py-6 text-left"
        >
          {mainPreview ? (
            <span className="relative block aspect-4/3 w-full">
              <Image
                src={mainPreview}
                alt=""
                fill
                sizes="640px"
                unoptimized={mainPreview.startsWith("blob:")}
                className="object-cover"
              />
            </span>
          ) : (
            <p className="text-sm text-muted-foreground">
              Drop or browse. JPG, PNG, or WebP, up to 3 MB.
            </p>
          )}
        </button>
      </div>

      <div>
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Gallery
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Extra photos for the product page.
        </p>
        {keepGallery.length > 0 ? (
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
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-background px-2 py-1 text-xs tracking-[0.12em] uppercase"
                  onClick={() =>
                    setKeepGallery((rows) => rows.filter((row) => row.id !== image.id))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {galleryPreviews.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {galleryPreviews.map((url) => (
              <div key={url} className="relative aspect-square bg-surface">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="200px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
        <input
          type="file"
          name="gallery"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-4 text-sm"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            setGalleryPreviews(files.map((file) => URL.createObjectURL(file)));
          }}
        />
      </div>

      <label className="flex flex-col gap-3">
        <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Title
        </span>
        <Input
          name="title"
          value={title}
          maxLength={PRODUCT_TITLE_MAX}
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

      <div className="grid gap-10 sm:grid-cols-2">
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            SKU
          </span>
          <Input
            name="sku"
            value={sku}
            maxLength={PRODUCT_SKU_MAX}
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
            onChange={(event) => setItemNumber(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Category
          </span>
          <select
            name="categoryId"
            value={categoryId || ""}
            onChange={(event) => setCategoryId(Number(event.target.value))}
            className={fieldClass}
          >
            <option value="">Select</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Brand
          </span>
          <select
            name="brandId"
            value={brandId || ""}
            onChange={(event) => setBrandId(Number(event.target.value))}
            className={fieldClass}
          >
            <option value="">Select</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.title}
              </option>
            ))}
          </select>
        </label>
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
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {sizes.map((size) => (
              <label key={size.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="sizeId"
                  value={size.id}
                  checked={sizeIds.includes(size.id)}
                  onChange={(event) => {
                    setSizeIds((current) =>
                      event.target.checked
                        ? [...current, size.id]
                        : current.filter((id) => id !== size.id),
                    );
                  }}
                  className="size-4"
                />
                {size.title}
              </label>
            ))}
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
          onChange={(event) => setMetaTitle(event.target.value)}
          className={fieldClass}
        />
        <span className="text-xs text-muted-foreground">
          {metaTitle.trim().length}/{PRODUCT_META_TITLE_MAX}. Leave blank to use
          the product title.
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
          onChange={(event) => setMetaDescription(event.target.value)}
          className="resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none focus-visible:border-foreground"
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

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={product?.isPublished ?? true}
          className="size-4"
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
