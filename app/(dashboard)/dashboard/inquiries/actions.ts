"use server";

import { requireStaff } from "@/lib/auth";
import { deleteInquiry, setInquiryRead } from "@/lib/inquiry";
import { revalidatePath } from "next/cache";

type Result = { error: string | null; done?: boolean };

function refresh() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/inquiries");
}

export async function markInquiryOpened(id: number): Promise<Result> {
  await requireStaff();
  if (!id) {
    return { error: "Missing inquiry." };
  }
  try {
    await setInquiryRead(id, true);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update inquiry.",
    };
  }
  refresh();
  return { error: null, done: true };
}

export async function removeInquiry(formData: FormData): Promise<Result> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing inquiry." };
  }
  try {
    await deleteInquiry(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete inquiry.",
    };
  }
  refresh();
  return { error: null, done: true };
}
