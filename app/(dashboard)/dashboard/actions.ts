"use server";

import { requireStaff } from "@/lib/auth";
import { getHero, removeHeroMedia, saveHero, uploadHeroMedia } from "@/lib/hero";
import { type HeroMediaKind, validateHeroCopy } from "@/lib/hero-media";
import { revalidatePath } from "next/cache";

export async function updateHero(formData: FormData) {
  await requireStaff();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const copyError = validateHeroCopy(title, description);
  if (copyError) {
    return { error: copyError, saved: false };
  }

  const kind: HeroMediaKind =
    formData.get("mediaKind") === "video" ? "video" : "image";
  const clearMedia = formData.get("clearMedia") === "on";
  const media = formData.get("media");

  try {
    const current = await getHero();
    const file = media instanceof File ? media : null;
    const uploaded = await uploadHeroMedia(file, kind);
    const keepCurrent = clearMedia
      ? null
      : kind === "video"
        ? current?.videoUrl
        : current?.imageUrl;

    const mediaUrl = uploaded ?? keepCurrent ?? null;

    const imageUrl = kind === "image" ? mediaUrl : null;
    const videoUrl = kind === "video" ? mediaUrl : null;

    await saveHero({
      title,
      description,
      imageUrl,
      videoUrl,
    });

    await removeHeroMedia(
      [current?.imageUrl, current?.videoUrl].filter(
        (url) => url && url !== imageUrl && url !== videoUrl,
      ),
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { error: null, saved: true, imageUrl, videoUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save hero.",
      saved: false,
    };
  }
}
