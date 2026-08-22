"use server";

import { requireStaff } from "@/lib/auth";
import { getHero, saveHero, uploadHeroMedia } from "@/lib/hero";
import { revalidatePath } from "next/cache";

export async function updateHero(formData: FormData) {
  await requireStaff();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clearImage = formData.get("clearImage") === "on";
  const clearVideo = formData.get("clearVideo") === "on";
  const image = formData.get("image");
  const video = formData.get("video");

  try {
    const current = await getHero();
    const imageFile = image instanceof File ? image : null;
    const videoFile = video instanceof File ? video : null;

    const imageUrl = clearImage
      ? null
      : (await uploadHeroMedia(imageFile, "image")) ?? current?.imageUrl ?? null;
    const videoUrl = clearVideo
      ? null
      : (await uploadHeroMedia(videoFile, "video")) ?? current?.videoUrl ?? null;

    await saveHero({ title, description, imageUrl, videoUrl });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save hero.",
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { error: null };
}
