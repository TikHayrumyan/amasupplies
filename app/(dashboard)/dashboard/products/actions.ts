"use server";

import { requireStaff } from "@/lib/auth";
import {
  isEmptyHtml,
  validateProductCopy,
} from "@/lib/product-fields";
import { getCategoryById } from "@/lib/category";
import { resolveProductTypeId } from "@/lib/product-type";
import {
  createProduct,
  deleteProduct,
  getProductById,
  removeProductMedia,
  reorderProduct,
  updateProduct,
  uploadProductImage,
} from "@/lib/product";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean; id?: number };

function refresh(slug?: string, categorySlug?: string) {
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  if (categorySlug) {
    revalidatePath(`/products/${categorySlug}`);
  }
  if (slug && categorySlug) {
    revalidatePath(`/products/${categorySlug}/${slug}`);
  }
}

async function uploadMany(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadProductImage(file);
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

export async function saveProduct(formData: FormData): Promise<Result> {
  await requireStaff();

  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const itemNumber = String(formData.get("itemNumber") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "");
  const description = isEmptyHtml(descriptionRaw) ? "" : descriptionRaw;
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const brandId = Number(formData.get("brandId") ?? 0);
  const typeId = Number(formData.get("typeId") ?? 0) || null;
  const isPublished = formData.get("isPublished") === "on";
  const sizeIds = formData
    .getAll("sizeId")
    .map((value) => Number(value))
    .filter((value) => value > 0);
  const keepImageIds = formData
    .getAll("keepImageId")
    .map((value) => Number(value))
    .filter((value) => value > 0);

  const category = await getCategoryById(categoryId);
  if (!category) {
    return { error: "Category is required." };
  }

  let resolvedTypeId: number | null;
  try {
    resolvedTypeId = await resolveProductTypeId(categoryId, typeId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Type is required.",
    };
  }

  const copyError = validateProductCopy({
    title,
    slug,
    sku,
    itemNumber,
    metaTitle,
    metaDescription,
    categoryId,
    brandId,
    typeId: resolvedTypeId ?? 0,
    typeRequired: resolvedTypeId !== null,
  });
  if (copyError) {
    return { error: copyError };
  }

  try {
    const current = id ? await getProductById(id) : null;
    const mainFile = formData.get("image");
    const uploadedMain = await uploadProductImage(
      mainFile instanceof File ? mainFile : null,
    );
    const imageUrl = uploadedMain ?? current?.imageUrl ?? null;
    if (!imageUrl) {
      return { error: "A main image is required." };
    }

    const galleryFiles = formData
      .getAll("gallery")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const galleryUrls = await uploadMany(galleryFiles);

    if (current) {
      await updateProduct(current.id, {
        title,
        slug,
        sku,
        itemNumber,
        metaTitle,
        metaDescription,
        description,
        imageUrl,
        brandId,
        categoryId,
        typeId: resolvedTypeId,
        isPublished,
        sizeIds,
        galleryUrls,
        keepImageIds,
      });
      if (uploadedMain && current.imageUrl !== uploadedMain) {
        await removeProductMedia([current.imageUrl]);
      }
    } else {
      await createProduct({
        title,
        slug,
        sku,
        itemNumber,
        metaTitle,
        metaDescription,
        description,
        imageUrl,
        brandId,
        categoryId,
        typeId: resolvedTypeId,
        isPublished,
        sizeIds,
        galleryUrls,
      });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save product.",
    };
  }

  refresh(slug, category.slug);
  return { error: null, done: true };
}

export async function removeProduct(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing product." };
  }
  const current = await getProductById(id);
  const category = current ? await getCategoryById(current.categoryId) : null;
  try {
    await deleteProduct(id);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not delete product.",
    };
  }
  refresh(current?.slug, category?.slug);
  return { error: null, done: true };
}

export async function moveProduct(input: {
  id: number;
  categoryId: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderProduct(input);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not reorder product.",
    };
  }
  const category = await getCategoryById(input.categoryId);
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  if (category?.slug) {
    revalidatePath(`/products/${category.slug}`);
  }
  return { error: null, done: true };
}
