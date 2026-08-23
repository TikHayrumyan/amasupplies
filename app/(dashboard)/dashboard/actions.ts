"use server";

import { requireStaff } from "@/lib/auth";
import { validateBrandCopy } from "@/lib/brand-fields";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  removeBrandMedia,
  reorderBrand,
  updateBrand,
  uploadBrandImage,
} from "@/lib/brand";
import { getHero, removeHeroMedia, saveHero, uploadHeroMedia } from "@/lib/hero";
import { type HeroMediaKind, validateHeroCopy } from "@/lib/hero-media";
import { revalidatePath } from "next/cache";

type BrandResult = { error: string | null; done?: boolean };

function refreshHome() {
  revalidatePath("/");
  revalidatePath("/dashboard");
}

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

    refreshHome();
    return { error: null, saved: true, imageUrl, videoUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save hero.",
      saved: false,
    };
  }
}

export async function saveBrand(formData: FormData): Promise<BrandResult> {
  await requireStaff();

  const idValue = String(formData.get("id") ?? "");
  const id = idValue ? Number(idValue) : null;
  const title = String(formData.get("title") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";
  const media = formData.get("image");

  const copyError = validateBrandCopy(title);
  if (copyError) {
    return { error: copyError };
  }

  try {
    const current = id ? await getBrandById(id) : null;
    const file = media instanceof File ? media : null;
    const uploaded = await uploadBrandImage(file);
    const imageUrl = uploaded ?? current?.imageUrl ?? null;

    if (!imageUrl) {
      return { error: "A logo is required." };
    }

    if (current) {
      await updateBrand(current.id, {
        title,
        imageUrl,
        isPublished,
      });
      if (uploaded && current.imageUrl !== uploaded) {
        await removeBrandMedia([current.imageUrl]);
      }
    } else {
      await createBrand({
        title,
        imageUrl,
        isPublished,
      });
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save brand.",
    };
  }

  refreshHome();
  return { error: null, done: true };
}

export async function removeBrand(formData: FormData): Promise<BrandResult> {
  await requireStaff();
  const id = Number(formData.get("id") ?? 0);
  if (!id) {
    return { error: "Missing brand." };
  }

  try {
    await deleteBrand(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete brand.",
    };
  }

  refreshHome();
  return { error: null, done: true };
}

export async function moveBrand(input: {
  id: number;
  beforeId: number | null;
  afterId: number | null;
}): Promise<BrandResult> {
  await requireStaff();

  try {
    await reorderBrand(input);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not reorder brand.",
    };
  }

  refreshHome();
  return { error: null, done: true };
}
