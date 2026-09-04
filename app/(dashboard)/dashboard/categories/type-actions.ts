"use server";

import { requireStaff } from "@/lib/auth";
import { getCategoryById } from "@/lib/category";
import { validateProductTypeCopy } from "@/lib/product-type-fields";
import {
  createProductType,
  deleteProductType,
  reorderProductType,
  updateProductType,
} from "@/lib/product-type";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

async function refresh(categoryId: number) {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  const category = await getCategoryById(categoryId);
  if (category?.slug) {
    revalidatePath(`/products/${category.slug}`);
  }
}

export async function saveProductType(formData: FormData): Promise<Result> {
  await requireStaff();
  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const categoryId = Number(formData.get("categoryId") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const copyError = validateProductTypeCopy(title, slug);
  if (copyError) {
    return { error: copyError };
  }
  if (!categoryId) {
    return { error: "Missing category." };
  }

  try {
    if (id) {
      await updateProductType(id, title, slug);
    } else {
      await createProductType(categoryId, title, slug);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save type.",
    };
  }

  await refresh(categoryId);
  return { error: null, done: true };
}

export async function removeProductType(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  const categoryId = Number(formData.get("categoryId") ?? 0);
  if (!id) {
    return { error: "Missing type." };
  }
  try {
    await deleteProductType(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete type.",
    };
  }
  if (categoryId) {
    await refresh(categoryId);
  }
  return { error: null, done: true };
}

export async function moveProductType(input: {
  id: number;
  categoryId: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderProductType(input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reorder type.",
    };
  }
  await refresh(input.categoryId);
  return { error: null, done: true };
}
