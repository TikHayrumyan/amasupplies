"use server";

import { requireStaff } from "@/lib/auth";
import { validateBlogCategoryCopy } from "@/lib/blog-category-fields";
import {
  createBlogCategory,
  deleteBlogCategory,
  reorderBlogCategory,
  updateBlogCategory,
} from "@/lib/blog-category";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh() {
  revalidatePath("/dashboard/blog");
  revalidatePath("/dashboard/blog/categories");
  revalidatePath("/blog");
}

export async function saveBlogCategory(formData: FormData): Promise<Result> {
  await requireStaff();
  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const copyError = validateBlogCategoryCopy(title, slug);
  if (copyError) {
    return { error: copyError };
  }

  try {
    if (id) {
      await updateBlogCategory(id, title, slug);
    } else {
      await createBlogCategory(title, slug);
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save category.",
    };
  }

  refresh();
  return { error: null, done: true };
}

export async function removeBlogCategory(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing category." };
  }
  try {
    await deleteBlogCategory(id);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not delete category.",
    };
  }
  refresh();
  return { error: null, done: true };
}

export async function moveBlogCategory(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderBlogCategory(input);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not reorder category.",
    };
  }
  refresh();
  return { error: null, done: true };
}
