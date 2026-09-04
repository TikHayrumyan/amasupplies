"use server";

import { requireStaff } from "@/lib/auth";
import { validateSizeCopy } from "@/lib/size-fields";
import {
  createSize,
  deleteSize,
  reorderSize,
  updateSize,
} from "@/lib/size";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh() {
  revalidatePath("/dashboard/sizes");
  revalidatePath("/dashboard/products");
}

export async function saveSize(formData: FormData): Promise<Result> {
  await requireStaff();
  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const copyError = validateSizeCopy(title);
  if (copyError) {
    return { error: copyError };
  }

  try {
    if (id) {
      await updateSize(id, title);
    } else {
      await createSize(title);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save size.",
    };
  }

  refresh();
  return { error: null, done: true };
}

export async function removeSize(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing size." };
  }
  try {
    await deleteSize(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete size.",
    };
  }
  refresh();
  return { error: null, done: true };
}

export async function moveSize(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<Result> {
  await requireStaff();
  try {
    await reorderSize(input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reorder size.",
    };
  }
  refresh();
  return { error: null, done: true };
}
