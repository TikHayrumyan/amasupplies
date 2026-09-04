"use server";

import { requireStaff } from "@/lib/auth";
import { validateCategoryCopy } from "@/lib/category-fields";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  removeCategoryMedia,
  reorderCategory,
  updateCategory,
  uploadCategoryImage,
} from "@/lib/category";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh() {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
}

export async function saveCategory(formData: FormData): Promise<Result> {
  await requireStaff();

  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";
  const media = formData.get("image");

  const copyError = validateCategoryCopy(title, slug, description);
  if (copyError) {
    return { error: copyError };
  }

  try {
    const current = id ? await getCategoryById(id) : null;
    const file = media instanceof File ? media : null;
    const uploaded = await uploadCategoryImage(file);
    const imageUrl = uploaded ?? current?.imageUrl ?? null;

    if (!imageUrl) {
      return { error: "An image is required." };
    }

    if (current) {
      await updateCategory(current.id, {
        title,
        slug,
        description,
        imageUrl,
        isPublished,
      });
      if (uploaded && current.imageUrl !== uploaded) {
        await removeCategoryMedia([current.imageUrl]);
      }
    } else {
      await createCategory({
        title,
        slug,
        description,
        imageUrl,
        isPublished,
      });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save category.",
    };
  }

  refresh();
  if (id) {
    revalidatePath(`/products/${slug}`);
  }
  return { error: null, done: true };
}

export async function removeCategory(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing category." };
  }

  try {
    await deleteCategory(id);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not delete category.",
    };
  }

  refresh();
  return { error: null, done: true };
}

export async function moveCategory(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();

  try {
    await reorderCategory(input);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not reorder category.",
    };
  }

  refresh();
  return { error: null, done: true };
}
