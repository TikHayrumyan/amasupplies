"use server";

import { requireStaff } from "@/lib/auth";
import { validateProductBrandCopy } from "@/lib/product-brand-fields";
import {
  createProductBrand,
  deleteProductBrand,
  reorderProductBrand,
  updateProductBrand,
} from "@/lib/product-brand";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh() {
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
}

export async function saveBrand(formData: FormData): Promise<Result> {
  await requireStaff();
  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const copyError = validateProductBrandCopy(title, slug);
  if (copyError) {
    return { error: copyError };
  }

  try {
    if (id) {
      await updateProductBrand(id, title, slug);
    } else {
      await createProductBrand(title, slug);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save brand.",
    };
  }

  refresh();
  return { error: null, done: true };
}

export async function removeBrand(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing brand." };
  }
  try {
    await deleteProductBrand(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete brand.",
    };
  }
  refresh();
  return { error: null, done: true };
}

export async function moveBrand(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderProductBrand(input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reorder brand.",
    };
  }
  refresh();
  return { error: null, done: true };
}
